import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase, getCurrentConfigString } from "@/lib/database-config"

export async function GET(request: NextRequest) {
  try {
    // Obtener el usuario autenticado de Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    const clerkUserId = user.id

    if (!email && !clerkUserId) {
      return NextResponse.json({ error: "No se pudo obtener el email o ID del usuario" }, { status: 400 })
    }

    console.log(`🔍 [PERFIL] Buscando perfil para: email=${email}, clerkUserId=${clerkUserId}`)

    const db = await getDatabase()

    // Intento 1: Buscar por email (case-insensitive)
    let result: any = null
    if (email) {
      result = await db.query(`
        SELECT 
          id,
          COALESCE(nombre_completo, '') AS nombre_completo,
          COALESCE(nombres, '') AS nombres,
          COALESCE(apellidos, '') AS apellidos,
          COALESCE(correo, '') AS correo,
          COALESCE(clerk_user_id, '') AS clerk_user_id,
          COALESCE(curp, '') AS curp,
          COALESCE(rfc, '') AS rfc,
          COALESCE(no_cvu, '') AS no_cvu,
          COALESCE(telefono, '') AS telefono,
          COALESCE(fotografia_url, '') AS fotografia_url,
          COALESCE(nacionalidad, '') AS nacionalidad,
          fecha_nacimiento,
          COALESCE(ultimo_grado_estudios, '') AS ultimo_grado_estudios,
          COALESCE(grado_maximo_estudios, '') AS grado_maximo_estudios,
          COALESCE(genero, '') AS genero,
          COALESCE(municipio, '') AS municipio,
          COALESCE(estado_nacimiento, '') AS estado_nacimiento,
          COALESCE(entidad_federativa, '') AS entidad_federativa,
          COALESCE(institucion_id, '') AS institucion_id,
          COALESCE(institucion, '') AS institucion,
          COALESCE(departamento, '') AS departamento,
          COALESCE(ubicacion, '') AS ubicacion,
          COALESCE(sitio_web, '') AS sitio_web,
          COALESCE(empleo_actual, '') AS empleo_actual,
          COALESCE(linea_investigacion, '') AS linea_investigacion,
          COALESCE(area_investigacion, '') AS area_investigacion,
          COALESCE(disciplina, '') AS disciplina,
          COALESCE(especialidad, '') AS especialidad,
          COALESCE(orcid, '') AS orcid,
          COALESCE(nivel, '') AS nivel,
          COALESCE(nivel_investigador, '') AS nivel_investigador,
          COALESCE(nivel_actual_id, '') AS nivel_actual_id,
          fecha_asignacion_nivel,
          COALESCE(tipo_perfil, 'INVESTIGADOR') AS tipo_perfil,
          COALESCE(nivel_sni, '') AS nivel_sni,
          COALESCE(sni, '') AS sni,
          anio_sni,
          COALESCE(nivel_tecnologo, '') AS nivel_tecnologo,
          COALESCE(nivel_tecnologo_id, '') AS nivel_tecnologo_id,
          COALESCE(cv_url, '') AS cv_url,
          dictamen_url,
          sni_url,
          COALESCE(es_admin, false) AS es_admin,
          COALESCE(es_evaluador, false) AS es_evaluador,
          COALESCE(activo, true) AS activo
        FROM investigadores 
        WHERE LOWER(correo) = LOWER($1)
        LIMIT 1
      `, [email])
    }

    let rows = Array.isArray(result) ? result : (result?.rows || [])

    // Intento 2: Si no se encontró por email, buscar por clerk_user_id
    if (rows.length === 0 && clerkUserId) {
      console.log(`⚠️ [PERFIL] No encontrado por email. Intentando con clerk_user_id...`)
      result = await db.query(`
        SELECT 
          id,
          COALESCE(nombre_completo, '') AS nombre_completo,
          COALESCE(nombres, '') AS nombres,
          COALESCE(apellidos, '') AS apellidos,
          COALESCE(correo, '') AS correo,
          COALESCE(clerk_user_id, '') AS clerk_user_id,
          COALESCE(curp, '') AS curp,
          COALESCE(rfc, '') AS rfc,
          COALESCE(no_cvu, '') AS no_cvu,
          COALESCE(telefono, '') AS telefono,
          COALESCE(fotografia_url, '') AS fotografia_url,
          COALESCE(nacionalidad, '') AS nacionalidad,
          fecha_nacimiento,
          COALESCE(ultimo_grado_estudios, '') AS ultimo_grado_estudios,
          COALESCE(grado_maximo_estudios, '') AS grado_maximo_estudios,
          COALESCE(genero, '') AS genero,
          COALESCE(municipio, '') AS municipio,
          COALESCE(estado_nacimiento, '') AS estado_nacimiento,
          COALESCE(entidad_federativa, '') AS entidad_federativa,
          COALESCE(institucion_id, '') AS institucion_id,
          COALESCE(institucion, '') AS institucion,
          COALESCE(departamento, '') AS departamento,
          COALESCE(ubicacion, '') AS ubicacion,
          COALESCE(sitio_web, '') AS sitio_web,
          COALESCE(empleo_actual, '') AS empleo_actual,
          COALESCE(linea_investigacion, '') AS linea_investigacion,
          COALESCE(area_investigacion, '') AS area_investigacion,
          COALESCE(disciplina, '') AS disciplina,
          COALESCE(especialidad, '') AS especialidad,
          COALESCE(orcid, '') AS orcid,
          COALESCE(nivel, '') AS nivel,
          COALESCE(nivel_investigador, '') AS nivel_investigador,
          COALESCE(nivel_actual_id, '') AS nivel_actual_id,
          fecha_asignacion_nivel,
          COALESCE(tipo_perfil, 'INVESTIGADOR') AS tipo_perfil,
          COALESCE(nivel_sni, '') AS nivel_sni,
          COALESCE(sni, '') AS sni,
          anio_sni,
          COALESCE(nivel_tecnologo, '') AS nivel_tecnologo,
          COALESCE(nivel_tecnologo_id, '') AS nivel_tecnologo_id,
          COALESCE(cv_url, '') AS cv_url,
          dictamen_url,
          sni_url,
          COALESCE(es_admin, false) AS es_admin,
          COALESCE(es_evaluador, false) AS es_evaluador,
          COALESCE(activo, true) AS activo
        FROM investigadores 
        WHERE clerk_user_id = $1
        LIMIT 1
      `, [clerkUserId])
      rows = Array.isArray(result) ? result : (result?.rows || [])
    }

    if (rows.length === 0) {
      console.error(`❌ [PERFIL] No encontrado. Email: ${email}, ClerkID: ${clerkUserId}`)
      return NextResponse.json({ 
        error: "Perfil no encontrado",
        message: "No se encontró un perfil de investigador asociado a este correo"
      }, { status: 404 })
    }

    console.log(`✅ [PERFIL] Perfil encontrado para: ${rows[0].nombre_completo}`)

    // Lógica de perfil completo: solo si los campos clave están llenos
    const perfil = rows[0];
    const camposClave = [
      'nombre_completo', 'correo', 'empleo_actual', 'cv_url',
      'area_investigacion', 'linea_investigacion', 'telefono',
      'nacionalidad', 'genero', 'municipio'
    ];
    const perfilCompleto = camposClave.every(
      (campo) => perfil[campo] && typeof perfil[campo] === 'string' && perfil[campo].trim() !== ''
    );

    return NextResponse.json({
      success: true,
      data: { ...perfil, perfil_completo: perfilCompleto }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ [PERFIL] Error al obtener el perfil:`, {
      error: errorMessage,
      email: user?.emailAddresses[0]?.emailAddress,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({
      success: false,
      error: `Error al obtener el perfil: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
