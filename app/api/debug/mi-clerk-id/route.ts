import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Buscar en la base de datos
    const investigador = await db.query(
      "SELECT id, correo, clerk_user_id, nombre_completo, slug FROM investigadores WHERE correo = $1",
      [user.emailAddresses[0].emailAddress]
    )

    return NextResponse.json({
      clerkUser: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        username: user.username,
      },
      dbRecord: investigador.rows[0] || null,
      coinciden: investigador.rows[0]?.clerk_user_id === user.id,
      problema: investigador.rows[0]?.clerk_user_id !== user.id 
        ? `El clerk_user_id en DB (${investigador.rows[0]?.clerk_user_id}) NO coincide con tu ID real (${user.id})`
        : "Todo correcto"
    })
  } catch (error) {
    console.error("Error en diagnóstico:", error)
    return NextResponse.json({ error: "Error en diagnóstico" }, { status: 500 })
  }
}
