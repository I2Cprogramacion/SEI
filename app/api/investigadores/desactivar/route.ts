import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"
import { currentUser } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const clerkUserId = user.id
    const db = await getDatabase()
    // Actualizar el campo activo a false
    await db.query(
      `UPDATE investigadores SET activo = FALSE WHERE clerk_user_id = $1`,
      [clerkUserId]
    )
    return NextResponse.json({ success: true, message: "Perfil desactivado" })
  } catch (error) {
    return NextResponse.json({ error: `Error al desactivar el perfil: ${error instanceof Error ? error.message : "Error desconocido"}` }, { status: 500 })
  }
}
