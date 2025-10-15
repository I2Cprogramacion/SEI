import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const clerkUserId = user.id
    const { destinatarioClerkId, asunto, mensaje } = await request.json()

    if (!destinatarioClerkId || !asunto || !mensaje) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Guardar el mensaje usando Clerk IDs directamente
    const result = await sql`
      INSERT INTO mensajes (
        remitente_id,
        destinatario_id,
        asunto,
        mensaje,
        fecha_envio,
        leido
      ) VALUES (
        ${clerkUserId},
        ${destinatarioClerkId},
        ${asunto},
        ${mensaje},
        CURRENT_TIMESTAMP,
        false
      )
      RETURNING id
    `

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

    const clerkUserId = user.id

    // Obtener todos los mensajes (enviados y recibidos) usando Clerk ID directamente
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
          WHEN m.remitente_id = ${clerkUserId} THEN 'enviado'
          ELSE 'recibido'
        END as tipo,
        CASE 
          WHEN m.remitente_id = ${clerkUserId} THEN i_dest.nombre_completo
          ELSE i_rem.nombre_completo
        END as otro_usuario,
        CASE 
          WHEN m.remitente_id = ${clerkUserId} THEN i_dest.correo
          ELSE i_rem.correo
        END as otro_email,
        CASE 
          WHEN m.remitente_id = ${clerkUserId} THEN i_dest.fotografia_url
          ELSE i_rem.fotografia_url
        END as otro_foto
      FROM mensajes m
      LEFT JOIN investigadores i_rem ON m.remitente_id = i_rem.clerk_user_id
      LEFT JOIN investigadores i_dest ON m.destinatario_id = i_dest.clerk_user_id
      WHERE m.remitente_id = ${clerkUserId} OR m.destinatario_id = ${clerkUserId}
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

    const clerkUserId = user.id
    const { mensajeId } = await request.json()

    if (!mensajeId) {
      return NextResponse.json(
        { error: "ID de mensaje requerido" },
        { status: 400 }
      )
    }

    // Marcar como leído solo si el usuario es el destinatario
    await sql`
      UPDATE mensajes 
      SET leido = true 
      WHERE id = ${mensajeId} 
      AND destinatario_id = ${clerkUserId}
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
