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
    
    // Buscar primero por clerk_user_id, luego por correo, y finalmente por id si existe
    let result = await db.query(`
      SELECT 
        id,
        COALESCE(nombre_completo, '') AS nombre_completo,
        COALESCE(nombres, '') AS nombres,
        COALESCE(apellidos, '') AS apellidos,
        COALESCE(correo, '') AS correo,
        COALESCE(clerk_user_id, '') AS clerk_user_id,
        COALESCE(area_investigacion, '') AS area_investigacion,
        COALESCE(institucion, '') AS institucion,
        COALESCE(fotografia_url, '') AS fotografia_url,
        COALESCE(slug, '') AS slug,
        COALESCE(curp, '') AS curp,
        COALESCE(rfc, '') AS rfc,
        COALESCE(no_cvu, '') AS no_cvu,
        COALESCE(telefono, '') AS telefono,
        COALESCE(nacionalidad, '') AS nacionalidad,
        fecha_nacimiento,
        COALESCE(cv_url, '') AS cv_url,
        fecha_registro,
        COALESCE(origen, '') AS origen,
        COALESCE(es_admin, FALSE) AS es_admin,
        COALESCE(estado_nacimiento, '') AS estado_nacimiento,
        COALESCE(entidad_federativa, '') AS entidad_federativa,
        COALESCE(orcid, '') AS orcid,
        COALESCE(empleo_actual, '') AS empleo_actual,
        COALESCE(nivel_actual, '') AS nivel_actual,
        COALESCE(institucion_id, '') AS institucion_id,
        COALESCE(activo, TRUE) AS activo
      FROM investigadores 
      WHERE clerk_user_id = $1 OR correo = $2
      LIMIT 1
    `, [clerkUserId, email])
    let rows = Array.isArray(result) ? result : (result.rows || [])
    if (rows.length === 0 && user?.id) {
      // Intentar buscar por id si no se encontró por los anteriores
      result = await db.query(`
        SELECT 
          id, nombre_completo, curp, rfc, no_cvu, correo, telefono,
          ultimo_grado_estudios, empleo_actual, linea_investigacion,
          area_investigacion, nacionalidad, fecha_nacimiento, fotografia_url,
          cv_url, fecha_registro, origen, clerk_user_id
        FROM investigadores 
        WHERE id = $1
        LIMIT 1
      `, [user.id])
      rows = Array.isArray(result) ? result : (result.rows || [])
    }
    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "Perfil no encontrado",
        message: "No se encontró un perfil de investigador asociado a este usuario"
      }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    return NextResponse.json({
      error: `Error al obtener el perfil: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
