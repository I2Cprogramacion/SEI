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

    if (!email) {
      return NextResponse.json({ error: "No se pudo obtener el email del usuario" }, { status: 400 })
    }

  const db = await getDatabase()

    // Buscar solo por correo
    const result = await db.query(`
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
        COALESCE(cv_url, '') AS cv_url,
        dictamen_url,
        sni_url,
        COALESCE(es_admin, false) AS es_admin,
        COALESCE(activo, true) AS activo
      FROM investigadores 
      WHERE correo = $1
      LIMIT 1
    `, [email]);
    const rows = Array.isArray(result) ? result : (result.rows || []);

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "Perfil no encontrado",
        message: "No se encontró un perfil de investigador asociado a este correo"
      }, { status: 404 })
    }

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
    return NextResponse.json({
      error: `Error al obtener el perfil: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
