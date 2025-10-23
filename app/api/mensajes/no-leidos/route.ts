import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { querySafe } from "@/lib/db-connection"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    const clerkUserId = user.id

    // Obtener el investigador actual (buscar por clerk_user_id primero, luego por correo)
    const investigadorResult = await querySafe<{ id: number }>`
      SELECT id FROM investigadores 
      WHERE clerk_user_id = ${clerkUserId} OR correo = ${userEmail}
      LIMIT 1
    `

    if (investigadorResult.rows.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    const investigadorId = investigadorResult.rows[0].id

    // Contar mensajes no leídos
    const result = await querySafe<{ count: string }>`
      SELECT COUNT(*) as count
      FROM mensajes
      WHERE destinatario_id = ${investigadorId}
      AND leido = false
    `

    return NextResponse.json({ count: parseInt(result.rows[0].count) || 0 })
  } catch (error) {
    return NextResponse.json({ count: 0 })
  }
}
