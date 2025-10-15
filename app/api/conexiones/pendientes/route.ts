import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

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
      return NextResponse.json({ count: 0 })
    }

    const investigadorId = investigadorResult.rows[0].id

    // Contar conexiones pendientes donde el usuario es el destinatario
    const result = await sql`
      SELECT COUNT(*) as count
      FROM conexiones
      WHERE investigador_destino_id = ${investigadorId}
      AND estado = 'pendiente'
    `

    return NextResponse.json({ count: parseInt(result.rows[0].count) || 0 })
  } catch (error) {
    console.error("Error al obtener conexiones pendientes:", error)
    return NextResponse.json({ count: 0 })
  }
}
