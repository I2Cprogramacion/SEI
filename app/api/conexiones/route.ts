import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"
import { notifyNewConnectionRequest, notifyConnectionAccepted } from "@/lib/email-notifications"
import { clerkClient } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log('🔵 POST /api/conexiones - Usuario:', user.id)

    const clerkUserId = user.id
    const { destinatarioId, mensaje } = await request.json()

    console.log('🔵 Datos recibidos:', { destinatarioId, mensaje: mensaje?.substring(0, 50) })

    if (!destinatarioId) {
      return NextResponse.json(
        { error: "Destinatario requerido" },
        { status: 400 }
      )
    }

    // Obtener ID del investigador origen desde clerk_user_id
    console.log('🔵 Buscando investigador origen con clerk_user_id:', clerkUserId)
    const origenQuery = await sql`
      SELECT id, nombre_completo, correo FROM investigadores 
      WHERE clerk_user_id = ${clerkUserId} 
      LIMIT 1
    `
    console.log('🔵 Resultado origen:', origenQuery.rows)

    if (origenQuery.rows.length === 0) {
      console.log('❌ Usuario origen no encontrado')
      return NextResponse.json(
        { error: "Usuario no encontrado en el sistema" },
        { status: 404 }
      )
    }

    const origenId = origenQuery.rows[0].id
    const origenNombre = origenQuery.rows[0].nombre_completo
    const origenEmail = origenQuery.rows[0].correo

    // Verificar que el destinatario existe
    console.log('🔵 Verificando destinatario con id:', destinatarioId)
    const destinoQuery = await sql`
      SELECT id, correo FROM investigadores 
      WHERE id = ${destinatarioId} 
      LIMIT 1
    `
    console.log('🔵 Resultado destino:', destinoQuery.rows)

    if (destinoQuery.rows.length === 0) {
      console.log('❌ Destinatario no encontrado')
      return NextResponse.json(
        { error: "Destinatario no encontrado" },
        { status: 404 }
      )
    }

    const destinoId = destinoQuery.rows[0].id
    const destinoEmail = destinoQuery.rows[0].correo

    console.log('🔵 IDs obtenidos:', { origenId, destinoId })

    // Verificar que no existe ya una conexión pendiente o aceptada entre las mismas partes
    const existente = await sql`
      SELECT id, estado FROM conexiones 
      WHERE (
        (investigador_id = ${origenId} AND conectado_con_id = ${destinoId})
        OR (investigador_id = ${destinoId} AND conectado_con_id = ${origenId})
      )
      AND estado IN ('pendiente','aceptada')
      LIMIT 1
    `

    if (existente.rows.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una solicitud de conexión" },
        { status: 400 }
      )
    }

    // Crear solicitud de conexión
    const result = await sql`
      INSERT INTO conexiones (
        investigador_id,
        conectado_con_id,
        investigador_destino_id,
        estado,
        mensaje
      ) VALUES (
        ${origenId},
        ${destinoId},
        ${destinoId},
        'pendiente',
        ${mensaje || null}
      )
      RETURNING id
    `

    // Enviar notificación por correo (no bloquear si falla)
    try {
      if (destinoEmail) {
        await notifyNewConnectionRequest(destinoEmail, origenNombre || 'Un investigador', origenEmail || '')
      }
    } catch (emailError) {
    }

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada exitosamente",
      conexionId: result.rows[0].id,
    })
  } catch (error) {
    console.error('❌ Error en POST /api/conexiones:', error)
    return NextResponse.json(
      { error: "Error al solicitar conexión", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const clerkUserId = user.id

    // Obtener ID numérico del investigador actual
    const investigadorQuery = await sql`
      SELECT id FROM investigadores WHERE clerk_user_id = ${clerkUserId} LIMIT 1
    `

    if (investigadorQuery.rows.length === 0) {
      return NextResponse.json([])
    }

    const investigadorId = investigadorQuery.rows[0].id

    // Obtener todas las conexiones
    const conexiones = await sql`
      SELECT 
        c.id,
        c.estado,
        c.created_at as fecha_solicitud,
        c.updated_at as fecha_respuesta,
        c.investigador_id,
        c.investigador_destino_id,
        c.mensaje,
        CASE 
          WHEN c.investigador_id = ${investigadorId} THEN 'enviada'
          ELSE 'recibida'
        END as tipo,
        CASE 
          WHEN c.investigador_id = ${investigadorId} THEN i_dest.id
          ELSE i_orig.id
        END as otro_id,
        CASE 
          WHEN c.investigador_id = ${investigadorId} THEN i_dest.nombre_completo
          ELSE i_orig.nombre_completo
        END as otro_nombre,
        CASE 
          WHEN c.investigador_id = ${investigadorId} THEN i_dest.correo
          ELSE i_orig.correo
        END as otro_email,
        CASE 
          WHEN c.investigador_id = ${investigadorId} THEN i_dest.fotografia_url
          ELSE i_orig.fotografia_url
        END as otro_foto,
        CASE 
          WHEN c.investigador_id = ${investigadorId} THEN i_dest.institucion
          ELSE i_orig.institucion
        END as otro_institucion
      FROM conexiones c
      LEFT JOIN investigadores i_orig ON c.investigador_id = i_orig.id
      LEFT JOIN investigadores i_dest ON c.investigador_destino_id = i_dest.id
      WHERE c.investigador_id = ${investigadorId} 
         OR c.investigador_destino_id = ${investigadorId}
      ORDER BY 
        CASE WHEN c.estado = 'pendiente' THEN 0 ELSE 1 END,
        c.created_at DESC
    `

    return NextResponse.json(conexiones.rows)
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener conexiones" },
      { status: 500 }
    )
  }
}

// PATCH - Aceptar o rechazar conexión
export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const clerkUserId = user.id
    const { conexionId, accion } = await request.json()

    if (!conexionId || !accion) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    if (accion !== 'aceptar' && accion !== 'rechazar') {
      return NextResponse.json(
        { error: "Acción inválida" },
        { status: 400 }
      )
    }

    // Obtener ID numérico del investigador actual
    const investigadorQuery = await sql`
      SELECT id FROM investigadores WHERE clerk_user_id = ${clerkUserId} LIMIT 1
    `

    if (investigadorQuery.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const investigadorId = investigadorQuery.rows[0].id
    const nuevoEstado = accion === 'aceptar' ? 'aceptada' : 'rechazada'

    // Obtener datos de la conexión antes de actualizar
    const conexion = await sql`
      SELECT c.investigador_id, i.clerk_user_id as origen_clerk_id
      FROM conexiones c
      LEFT JOIN investigadores i ON c.investigador_id = i.id
      WHERE c.id = ${conexionId} 
      AND c.investigador_destino_id = ${investigadorId}
      AND c.estado = 'pendiente'
    `

    // Actualizar estado solo si el usuario es el destinatario
    await sql`
      UPDATE conexiones 
      SET estado = ${nuevoEstado},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${conexionId} 
      AND investigador_destino_id = ${investigadorId}
      AND estado = 'pendiente'
    `

    // Si se aceptó, enviar notificación al remitente
    if (accion === 'aceptar' && conexion.rows.length > 0) {
      try {
        const senderClerkId = conexion.rows[0].origen_clerk_id
        const accepterName = user.fullName || user.firstName || 'Un investigador'

        if (senderClerkId) {
          const sender = await (await clerkClient()).users.getUser(senderClerkId)
          const senderEmail = sender.emailAddresses[0]?.emailAddress

          if (senderEmail) {
            await notifyConnectionAccepted(senderEmail, accepterName)
          }
        }
      } catch (emailError) {
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar conexión" },
      { status: 500 }
    )
  }
}
