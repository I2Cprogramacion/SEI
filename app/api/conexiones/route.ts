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

    const clerkUserId = user.id
    const { destinatarioClerkId, mensaje } = await request.json()

    if (!destinatarioClerkId) {
      return NextResponse.json(
        { error: "Destinatario requerido" },
        { status: 400 }
      )
    }

    // Verificar que no existe ya una conexión
    const existente = await sql`
      SELECT id FROM conexiones 
      WHERE (investigador_origen_id = ${clerkUserId} AND investigador_destino_id = ${destinatarioClerkId})
         OR (investigador_origen_id = ${destinatarioClerkId} AND investigador_destino_id = ${clerkUserId})
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
        investigador_origen_id,
        investigador_destino_id,
        estado,
        mensaje,
        fecha_solicitud
      ) VALUES (
        ${clerkUserId},
        ${destinatarioClerkId},
        'pendiente',
        ${mensaje || null},
        CURRENT_TIMESTAMP
      )
      RETURNING id
    `

    // Enviar notificación por correo (no bloquear si falla)
    try {
      const senderName = user.fullName || user.firstName || 'Un investigador'
      const senderEmail = user.emailAddresses[0]?.emailAddress || ''

      const recipient = await (await clerkClient()).users.getUser(destinatarioClerkId)
      const recipientEmail = recipient.emailAddresses[0]?.emailAddress

      if (recipientEmail) {
        await notifyNewConnectionRequest(recipientEmail, senderName, senderEmail)
      }
    } catch (emailError) {
      console.warn('⚠️ No se pudo enviar notificación por email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada exitosamente",
      conexionId: result.rows[0].id,
    })
  } catch (error) {
    console.error("Error al solicitar conexión:", error)
    return NextResponse.json(
      { error: "Error al solicitar conexión" },
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

    // Obtener todas las conexiones usando Clerk IDs
    const conexiones = await sql`
      SELECT 
        c.id,
        c.estado,
        c.fecha_solicitud,
        c.fecha_respuesta,
        c.investigador_origen_id,
        c.investigador_destino_id,
        c.mensaje,
        CASE 
          WHEN c.investigador_origen_id = ${clerkUserId} THEN 'enviada'
          ELSE 'recibida'
        END as tipo,
        CASE 
          WHEN c.investigador_origen_id = ${clerkUserId} THEN i_dest.id
          ELSE i_orig.id
        END as otro_id,
        CASE 
          WHEN c.investigador_origen_id = ${clerkUserId} THEN i_dest.nombre_completo
          ELSE i_orig.nombre_completo
        END as otro_nombre,
        CASE 
          WHEN c.investigador_origen_id = ${clerkUserId} THEN i_dest.correo
          ELSE i_orig.correo
        END as otro_email,
        CASE 
          WHEN c.investigador_origen_id = ${clerkUserId} THEN i_dest.fotografia_url
          ELSE i_orig.fotografia_url
        END as otro_foto,
        CASE 
          WHEN c.investigador_origen_id = ${clerkUserId} THEN i_dest.institucion
          ELSE i_orig.institucion
        END as otro_institucion
      FROM conexiones c
      LEFT JOIN investigadores i_orig ON c.investigador_origen_id = i_orig.clerk_user_id
      LEFT JOIN investigadores i_dest ON c.investigador_destino_id = i_dest.clerk_user_id
      WHERE c.investigador_origen_id = ${clerkUserId} 
         OR c.investigador_destino_id = ${clerkUserId}
      ORDER BY 
        CASE WHEN c.estado = 'pendiente' THEN 0 ELSE 1 END,
        c.fecha_solicitud DESC
    `

    return NextResponse.json(conexiones.rows)
  } catch (error) {
    console.error("Error al obtener conexiones:", error)
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

    const nuevoEstado = accion === 'aceptar' ? 'aceptada' : 'rechazada'

    // Obtener datos de la conexión antes de actualizar
    const conexion = await sql`
      SELECT investigador_origen_id 
      FROM conexiones 
      WHERE id = ${conexionId} 
      AND investigador_destino_id = ${clerkUserId}
      AND estado = 'pendiente'
    `

    // Actualizar estado solo si el usuario es el destinatario
    await sql`
      UPDATE conexiones 
      SET estado = ${nuevoEstado},
          fecha_respuesta = CURRENT_TIMESTAMP
      WHERE id = ${conexionId} 
      AND investigador_destino_id = ${clerkUserId}
      AND estado = 'pendiente'
    `

    // Si se aceptó, enviar notificación al remitente
    if (accion === 'aceptar' && conexion.rows.length > 0) {
      try {
        const senderClerkId = conexion.rows[0].investigador_origen_id
        const accepterName = user.fullName || user.firstName || 'Un investigador'

        const sender = await (await clerkClient()).users.getUser(senderClerkId)
        const senderEmail = sender.emailAddresses[0]?.emailAddress

        if (senderEmail) {
          await notifyConnectionAccepted(senderEmail, accepterName)
        }
      } catch (emailError) {
        console.warn('⚠️ No se pudo enviar notificación por email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar conexión:", error)
    return NextResponse.json(
      { error: "Error al actualizar conexión" },
      { status: 500 }
    )
  }
}
