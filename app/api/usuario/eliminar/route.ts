import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      )
    }

    // 1. Eliminar datos del investigador de PostgreSQL (Neon)
    const deleteResult = await sql`
      DELETE FROM investigadores 
      WHERE clerk_user_id = ${userId}
      RETURNING id
    `

    console.log(`Usuario ${userId} eliminado de PostgreSQL:`, deleteResult)

    // 2. Eliminar usuario de Clerk
    try {
      const client = await clerkClient()
      await client.users.deleteUser(userId)
      console.log(`Usuario ${userId} eliminado de Clerk`)
    } catch (clerkError) {
      console.error("Error al eliminar de Clerk:", clerkError)
      // Continuamos aunque falle Clerk, ya que los datos de PostgreSQL se eliminaron
      return NextResponse.json(
        {
          success: true,
          warning: "Datos eliminados de la base de datos, pero hubo un error al eliminar de Clerk",
          clerkError: clerkError instanceof Error ? clerkError.message : "Error desconocido"
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario eliminado completamente (PostgreSQL + Clerk)"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al eliminar usuario"
      },
      { status: 500 }
    )
  }
}
