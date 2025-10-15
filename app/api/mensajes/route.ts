import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress

    if (!userEmail) {
      return NextResponse.json({ error: "Email no encontrado" }, { status: 400 })
    }

    // Obtener el investigador remitente
    const remitenteResult = await sql`
      SELECT id, nombre_completo
      FROM investigadores
      WHERE correo = ${userEmail}
    `

    if (remitenteResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Perfil de investigador no encontrado" },
        { status: 404 }
      )
    }

    const remitente = remitenteResult.rows[0]
    const { destinatarioId, asunto, mensaje } = await request.json()

    if (!destinatarioId || !asunto || !mensaje) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el destinatario existe
    const destinatarioResult = await sql`
      SELECT id, nombre_completo, correo
      FROM investigadores
      WHERE id = ${destinatarioId}
    `

    if (destinatarioResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Destinatario no encontrado" },
        { status: 404 }
      )
    }

    // Guardar el mensaje en la base de datos
    const result = await sql`
      INSERT INTO mensajes (
        remitente_id,
        destinatario_id,
        asunto,
        mensaje,
        fecha_envio,
        leido
      ) VALUES (
        ${remitente.id},
        ${destinatarioId},
        ${asunto},
        ${mensaje},
        CURRENT_TIMESTAMP,
        false
      )
      RETURNING id
    `

    // TODO: Enviar email de notificación al destinatario
    // Puedes usar un servicio como SendGrid, Resend, etc.

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado exitosamente",
      mensajeId: result.rows[0].id,
    })
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
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

    const userEmail = user.emailAddresses[0]?.emailAddress

    // Obtener el investigador actual
    const investigadorResult = await sql`
      SELECT id FROM investigadores WHERE correo = ${userEmail}
    `

    if (investigadorResult.rows.length === 0) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
    }

    const investigadorId = investigadorResult.rows[0].id

    // Obtener todos los mensajes (enviados y recibidos)
    const mensajes = await sql`
      SELECT 
        m.id,
        m.asunto,
        m.mensaje,
        m.fecha_envio,
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
      JOIN investigadores i_rem ON m.remitente_id = i_rem.id
      JOIN investigadores i_dest ON m.destinatario_id = i_dest.id
      WHERE m.remitente_id = ${investigadorId} OR m.destinatario_id = ${investigadorId}
      ORDER BY m.fecha_envio DESC
    `

    return NextResponse.json(mensajes.rows)
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
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

    const userEmail = user.emailAddresses[0]?.emailAddress
    const { mensajeId } = await request.json()

    if (!mensajeId) {
      return NextResponse.json(
        { error: "ID de mensaje requerido" },
        { status: 400 }
      )
    }

    // Obtener investigador actual
    const investigadorResult = await sql`
      SELECT id FROM investigadores WHERE correo = ${userEmail}
    `

    if (investigadorResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Investigador no encontrado" },
        { status: 404 }
      )
    }

    const investigadorId = investigadorResult.rows[0].id

    // Marcar como leído solo si el usuario es el destinatario
    await sql`
      UPDATE mensajes 
      SET leido = true 
      WHERE id = ${mensajeId} 
      AND destinatario_id = ${investigadorId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error)
    return NextResponse.json(
      { error: "Error al marcar mensaje como leído" },
      { status: 500 }
    )
  }
}
