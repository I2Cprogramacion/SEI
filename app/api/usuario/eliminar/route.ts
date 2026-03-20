import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { executeQuery } from "@/lib/db-connection"
import { sql } from "@vercel/postgres"

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      )
    }

    console.log(`🗑️ Iniciando eliminación de usuario: ${userId}`)

    // 1. Eliminar usuario de Clerk PRIMERO (más crítico)
    try {
      const client = await clerkClient()
      await client.users.deleteUser(userId)
      console.log(`✅ Usuario ${userId} eliminado de Clerk`)
    } catch (clerkError) {
      console.error("❌ Error al eliminar de Clerk:", clerkError)
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo eliminar la cuenta de Clerk. Por favor, intenta de nuevo."
        },
        { status: 500 }
      )
    }

    // 2. Eliminar datos del investigador de PostgreSQL con reintentos
    try {
      const deleteResult = await executeQuery(
        () => sql`
          DELETE FROM investigadores 
          WHERE clerk_user_id = ${userId}
          RETURNING id
        `,
        3 // 3 reintentos
      )
      console.log(`✅ Usuario ${userId} eliminado de PostgreSQL:`, deleteResult.rowCount, "filas")
    } catch (dbError) {
      console.error("⚠️ Error al eliminar de PostgreSQL:", dbError)
      // Aunque falle la BD, el usuario ya fue eliminado de Clerk
      return NextResponse.json(
        {
          success: true,
          warning: "Cuenta eliminada de Clerk pero hubo un error al eliminar datos de la base de datos",
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario eliminado completamente (Clerk + PostgreSQL)"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      {
        success: false,
        error: `Error al eliminar la cuenta: ${errorMessage}`
      },
      { status: 500 }
    )
  }
}
