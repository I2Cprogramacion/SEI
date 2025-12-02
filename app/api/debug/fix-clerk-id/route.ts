import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0].emailAddress

    // Actualizar el clerk_user_id en la base de datos
    const result = await db.query(
      "UPDATE investigadores SET clerk_user_id = $1 WHERE correo = $2 RETURNING id, correo, clerk_user_id, nombre_completo, slug",
      [user.id, email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "No se encontró el investigador" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "clerk_user_id actualizado correctamente",
      clerkUserId: user.id,
      investigador: result.rows[0]
    })
  } catch (error) {
    console.error("Error actualizando clerk_user_id:", error)
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}
