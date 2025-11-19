import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"
import { notifyNewMessage } from "@/lib/email-notifications"
import { clerkClient } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const clerkUserId = user.id
    const { destinatarioId, asunto, mensaje } = await request.json()

    if (!destinatarioId || !asunto || !mensaje) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Obtener ID del remitente desde clerk_user_id
    const remitenteQuery = await sql`
      SELECT id, correo, nombre_completo FROM investigadores 
      WHERE clerk_user_id = ${clerkUserId} 
      LIMIT 1
    `

    if (remitenteQuery.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado en el sistema" },
        { status: 404 }
      )
    }

    const remitenteId = remitenteQuery.rows[0].id
    const remitenteNombre = remitenteQuery.rows[0].nombre_completo
    const remitenteEmail = remitenteQuery.rows[0].correo

    // Obtener datos del destinatario
    const destinatarioQuery = await sql`
      SELECT id, correo, nombre_completo FROM investigadores 
      WHERE id = ${destinatarioId} 
      LIMIT 1
    `

    if (destinatarioQuery.rows.length === 0) {
      return NextResponse.json(
        { error: "Destinatario no encontrado" },
        { status: 404 }
      )
    }

    const destinatarioEmail = destinatarioQuery.rows[0].correo

    // Guardar el mensaje usando IDs de investigadores
    const result = await sql`
      INSERT INTO mensajes (
        remitente_id,
        destinatario_id,
        asunto,
        contenido,
        leido
      ) VALUES (
        ${remitenteId},
        ${destinatarioId},
        ${asunto},
        ${mensaje},
        false
      )
      RETURNING id
    `

    // Enviar notificación por correo (no bloquear si falla)
    try {
      if (destinatarioEmail) {
        await notifyNewMessage(
          destinatarioEmail,
          remitenteNombre || 'Un investigador',
          remitenteEmail || '',
          asunto,
          mensaje.substring(0, 100)
        )
      }
    } catch (emailError) {
      // Si falla el email, solo logear pero no fallar la request
    }

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado exitosamente",
      mensajeId: result.rows[0].id,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al enviar el mensaje" },
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

    // Obtener ID del investigador actual
    const investigadorQuery = await sql`
      SELECT id FROM investigadores 
      WHERE clerk_user_id = ${clerkUserId} 
      LIMIT 1
    `

    if (investigadorQuery.rows.length === 0) {
      return NextResponse.json([])
    }

    const investigadorId = investigadorQuery.rows[0].id

    // Obtener todos los mensajes (enviados y recibidos) usando IDs de investigadores
    const mensajes = await sql`
      SELECT 
        m.id,
        m.asunto,
        m.contenido as mensaje,
        m.created_at as fecha_envio,
        m.leido,
        m.remitente_id,
        m.destinatario_id,
        CASE 
          WHEN m.remitente_id = ${investigadorId} THEN 'enviado'
          ELSE 'recibido'
        END as tipo,
        CASE 
          WHEN m.remitente_id = ${investigadorId} THEN i_dest.nombre_completo
          ELSE i_rem.nombre_completo
        END as otro_usuario,
        CASE 
          WHEN m.remitente_id = ${investigadorId} THEN i_dest.correo
          ELSE i_rem.correo
        END as otro_email,
        CASE 
          WHEN m.remitente_id = ${investigadorId} THEN i_dest.fotografia_url
          ELSE i_rem.fotografia_url
        END as otro_foto
      FROM mensajes m
      LEFT JOIN investigadores i_rem ON m.remitente_id = i_rem.id
      LEFT JOIN investigadores i_dest ON m.destinatario_id = i_dest.id
      WHERE m.remitente_id = ${investigadorId} OR m.destinatario_id = ${investigadorId}
      ORDER BY m.created_at DESC
    `

    return NextResponse.json(mensajes.rows)
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener mensajes" },
      { status: 500 }
    )
  }
}

// PATCH - Marcar mensaje como leído
export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const clerkUserId = user.id
    const { mensajeId } = await request.json()

    if (!mensajeId) {
      return NextResponse.json(
        { error: "ID de mensaje requerido" },
        { status: 400 }
      )
    }

    // Obtener ID del investigador actual
    const investigadorQuery = await sql`
      SELECT id FROM investigadores 
      WHERE clerk_user_id = ${clerkUserId} 
      LIMIT 1
    `

    if (investigadorQuery.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const investigadorId = investigadorQuery.rows[0].id

    // Marcar como leído solo si el usuario es el destinatario
    await sql`
      UPDATE mensajes 
      SET leido = true 
      WHERE id = ${mensajeId} 
      AND destinatario_id = ${investigadorId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al marcar mensaje como leído" },
      { status: 500 }
    )
  }
}
