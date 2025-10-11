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

    if (!email) {
      return NextResponse.json({ error: "No se pudo obtener el email del usuario" }, { status: 400 })
    }

    // Obtener datos del investigador desde PostgreSQL
    const db = await getDatabase()
    const query = `
      SELECT 
        id, nombre_completo, curp, rfc, no_cvu, correo, telefono,
        ultimo_grado_estudios, empleo_actual, linea_investigacion,
        area_investigacion, nacionalidad, fecha_nacimiento, fotografia_url,
        fecha_registro, origen
      FROM investigadores 
      WHERE correo = $1
    `
    
    const result = await db.query(query, [email])
    const rows = Array.isArray(result) ? result : (result.rows || [])

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
