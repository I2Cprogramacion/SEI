import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

export async function GET(request: NextRequest) {
  try {
    // Obtener el usuario autenticado de Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("==================================================")
    console.log("🔍 DASHBOARD: Buscando perfil de usuario")
    console.log("==================================================")
    console.log("Clerk User ID:", user.id)
    console.log("Clerk Email:", user.emailAddresses[0]?.emailAddress)
    console.log("==================================================")

    const email = user.emailAddresses[0]?.emailAddress
    const clerkUserId = user.id

    if (!email) {
      return NextResponse.json({ error: "No se pudo obtener el email del usuario" }, { status: 400 })
    }

    // Obtener datos del investigador desde PostgreSQL
    const db = await getDatabase()
    
    // Buscar primero por clerk_user_id (más confiable), luego por email
    const query = `
      SELECT 
        id, nombre_completo, curp, rfc, no_cvu, correo, telefono,
        ultimo_grado_estudios, empleo_actual, linea_investigacion,
        area_investigacion, nacionalidad, fecha_nacimiento, fotografia_url,
        cv_url, fecha_registro, origen, clerk_user_id
      FROM investigadores 
      WHERE clerk_user_id = $1 OR correo = $2
      LIMIT 1
    `
    
    console.log("🔍 Ejecutando query con:")
    console.log("  clerk_user_id:", clerkUserId)
    console.log("  correo:", email)
    
    const result = await db.query(query, [clerkUserId, email])
    const rows = Array.isArray(result) ? result : (result.rows || [])
    
    console.log("📊 Resultados encontrados:", rows.length)
    if (rows.length > 0) {
      console.log("✅ Usuario encontrado:", {
        id: rows[0].id,
        nombre: rows[0].nombre_completo,
        correo: rows[0].correo,
        clerk_user_id: rows[0].clerk_user_id
      })
    } else {
      console.log("❌ No se encontró usuario con clerk_user_id:", clerkUserId, "ni correo:", email)
    }
    console.log("==")

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "Perfil no encontrado",
        message: "No se encontró un perfil de investigador asociado a este correo"
      }, { status: 404 })
    }

    const investigador = rows[0]

    return NextResponse.json({
      success: true,
      data: investigador
    })
  } catch (error) {
    console.error("Error al obtener perfil del investigador:", error)
    return NextResponse.json({
      error: `Error al obtener el perfil: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
