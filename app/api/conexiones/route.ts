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

    // Obtener el investigador solicitante
    const solicitanteResult = await sql`
      SELECT id, nombre_completo
      FROM investigadores
      WHERE correo = ${userEmail}
    `

    if (solicitanteResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Perfil de investigador no encontrado" },
        { status: 404 }
      )
    }

    const solicitante = solicitanteResult.rows[0]
    const { investigadorId, mensaje } = await request.json()

    if (!investigadorId) {
      return NextResponse.json(
        { error: "ID de investigador requerido" },
        { status: 400 }
      )
    }

    // Verificar si ya existe una conexión
    const conexionExistente = await sql`
      SELECT id, estado
      FROM conexiones
      WHERE (investigador_origen_id = ${solicitante.id} AND investigador_destino_id = ${investigadorId})
         OR (investigador_origen_id = ${investigadorId} AND investigador_destino_id = ${solicitante.id})
    `

    if (conexionExistente.rows.length > 0) {
      const estado = conexionExistente.rows[0].estado
      if (estado === 'aceptada') {
        return NextResponse.json(
          { error: "Ya estás conectado con este investigador" },
          { status: 400 }
        )
      } else if (estado === 'pendiente') {
        return NextResponse.json(
          { error: "Ya existe una solicitud pendiente" },
          { status: 400 }
        )
      }
    }

    // Crear la solicitud de conexión
    const result = await sql`
      INSERT INTO conexiones (
        investigador_origen_id,
        investigador_destino_id,
        estado,
        mensaje,
        fecha_solicitud
      ) VALUES (
        ${solicitante.id},
        ${investigadorId},
        'pendiente',
        ${mensaje || 'Solicitud de conexión'},
        CURRENT_TIMESTAMP
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: "Solicitud de conexión enviada",
      conexionId: result.rows[0].id,
    })
  } catch (error) {
    console.error("Error al crear conexión:", error)
    return NextResponse.json(
      { error: "Error al enviar la solicitud" },
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

    // Obtener todas las conexiones (aceptadas y pendientes)
    const conexiones = await sql`
      SELECT 
        c.id,
        c.estado,
        c.fecha_solicitud,
        c.fecha_respuesta,
        CASE 
          WHEN c.investigador_origen_id = ${investigadorId} THEN i2.id
          ELSE i1.id
        END as id_conexion,
        CASE 
          WHEN c.investigador_origen_id = ${investigadorId} THEN i2.nombre_completo
          ELSE i1.nombre_completo
        END as nombre,
        CASE 
          WHEN c.investigador_origen_id = ${investigadorId} THEN i2.correo
          ELSE i1.correo
        END as email,
        CASE 
          WHEN c.investigador_origen_id = ${investigadorId} THEN i2.fotografia_url
          ELSE i1.fotografia_url
        END as fotografia_url,
        CASE 
          WHEN c.investigador_origen_id = ${investigadorId} THEN i2.institucion
          ELSE i1.institucion
        END as institucion
      FROM conexiones c
      JOIN investigadores i1 ON c.investigador_origen_id = i1.id
      JOIN investigadores i2 ON c.investigador_destino_id = i2.id
      WHERE c.investigador_origen_id = ${investigadorId} OR c.investigador_destino_id = ${investigadorId}
      ORDER BY c.fecha_solicitud DESC
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
