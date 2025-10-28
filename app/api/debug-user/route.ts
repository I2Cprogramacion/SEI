import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

/**
 * Endpoint de debug para ver qué datos tiene Clerk vs PostgreSQL
 * Acceder a: /api/debug-user
 */
export async function GET() {
  try {
    // Obtener usuario de Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ 
        error: "No autenticado",
        message: "No hay sesión activa de Clerk"
      }, { status: 401 })
    }

    const clerkData = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      createdAt: clerkUser.createdAt,
      imageUrl: clerkUser.imageUrl,
    }

    // Buscar en PostgreSQL
    const db = await getDatabase()
    const result = await db.query(`
      SELECT * FROM investigadores 
      WHERE clerk_user_id = $1 OR correo = $2
      LIMIT 1
    `, [clerkUser.id, clerkData.email])
    
    const rows = Array.isArray(result) ? result : (result.rows || [])
    
    return NextResponse.json({
      success: true,
      clerk: clerkData,
      postgresql: {
        exists: rows.length > 0,
        data: rows.length > 0 ? rows[0] : null,
        searchedBy: {
          clerk_user_id: clerkUser.id,
          email: clerkData.email
        }
      },
      diagnosis: {
        userExistsInClerk: true,
        userExistsInPostgreSQL: rows.length > 0,
        clerkIdMatches: rows.length > 0 && rows[0].clerk_user_id === clerkUser.id,
        emailMatches: rows.length > 0 && rows[0].correo === clerkData.email,
        recommendation: rows.length === 0 
          ? "⚠️ Usuario no encontrado en PostgreSQL. Necesitas completar el registro o insertar los datos manualmente."
          : rows[0].clerk_user_id !== clerkUser.id
            ? "⚠️ Usuario encontrado pero clerk_user_id no coincide. Actualiza el clerk_user_id en la base de datos."
            : "✅ Todo correcto. El perfil debería mostrarse."
      }
    })
  } catch (error) {
    console.error("Error en debug-user:", error)
    return NextResponse.json({
      error: "Error interno",
      message: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

