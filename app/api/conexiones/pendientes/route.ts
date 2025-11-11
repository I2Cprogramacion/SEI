import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

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
      return NextResponse.json({ count: 0 })
    }

    const investigadorId = investigadorQuery.rows[0].id

    // Contar solicitudes pendientes donde el usuario (por su ID numérico) es el destinatario
    const result = await sql`
      SELECT COUNT(*)::int as count
      FROM conexiones
      WHERE investigador_destino_id = ${investigadorId}
      AND estado = 'pendiente'
    `

    return NextResponse.json({ count: result.rows[0]?.count ?? 0 })
  } catch (error) {
    return NextResponse.json({ count: 0 })
  }
}
