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
    
    
    const result = await db.query(query, [clerkUserId, email])
    const rows = Array.isArray(result) ? result : (result.rows || [])
    
    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "Perfil no encontrado",
        message: "No se encontró un perfil de investigador asociado a este correo"
      }, { status: 404 })
    }

  // ...existing code...

    return NextResponse.json({
      success: true,
  data: rows[0]
    })

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "Perfil no encontrado",
        message: "No se encontró un perfil de investigador asociado a este correo"
      }, { status: 404 })
    }

  // ...existing code...

    return NextResponse.json({
      success: true,
      data: investigador
    })
  } catch (error) {
    return NextResponse.json({
      error: `Error al obtener el perfil: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
