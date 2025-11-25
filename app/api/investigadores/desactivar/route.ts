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
    console.log("🔴 Desactivando perfil para clerk_user_id:", clerkUserId)
    
    const db = await getDatabase()
    
    // Verificar el estado actual antes de actualizar
    const checkQuery = `SELECT id, nombre_completo, activo FROM investigadores WHERE clerk_user_id = $1`
    const beforeUpdate = await db.query(checkQuery, [clerkUserId])
    console.log("📊 Estado ANTES de desactivar:", beforeUpdate.rows[0])
    
    // Actualizar el campo activo a false
    const updateQuery = `UPDATE investigadores SET activo = FALSE WHERE clerk_user_id = $1 RETURNING id, nombre_completo, activo`
    const result = await db.query(updateQuery, [clerkUserId])
    
    console.log("✅ Estado DESPUÉS de desactivar:", result.rows[0])
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "No se encontró el investigador" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Perfil desactivado",
      data: result.rows[0]
    })
  } catch (error) {
    console.error("❌ Error al desactivar perfil:", error)
    return NextResponse.json({ 
      error: `Error al desactivar el perfil: ${error instanceof Error ? error.message : "Error desconocido"}` 
    }, { status: 500 })
  }
}
