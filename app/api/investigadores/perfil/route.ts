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

    // Log detallado para comparar clerk_user_id
    console.log(`🔍 Buscando perfil para clerk_user_id: '${clerkUserId}' (len=${clerkUserId.length}) o correo: '${email}'`)
    // Mostrar bytes del clerk_user_id recibido
    console.log('clerkUserId bytes:', Array.from(Buffer.from(clerkUserId)).join(','));

    let result = await db.query(`
      SELECT 
        id,
        COALESCE(nombre_completo, '') AS nombre_completo,
        COALESCE(nombres, '') AS nombres,
        COALESCE(apellidos, '') AS apellidos,
        COALESCE(correo, '') AS correo,
        COALESCE(clerk_user_id, '') AS clerk_user_id,
        COALESCE(area_investigacion, '') AS area_investigacion,
        COALESCE(linea_investigacion, '') AS linea_investigacion,
        COALESCE(institucion, '') AS institucion,
        COALESCE(fotografia_url, '') AS fotografia_url,
        COALESCE(slug, '') AS slug,
        COALESCE(curp, '') AS curp,
        COALESCE(rfc, '') AS rfc,
        COALESCE(no_cvu, '') AS no_cvu,
        COALESCE(telefono, '') AS telefono,
        COALESCE(nacionalidad, '') AS nacionalidad,
        fecha_nacimiento,
        COALESCE(genero, '') AS genero,
        COALESCE(municipio, '') AS municipio,
        COALESCE(tipo_perfil, 'INVESTIGADOR') AS tipo_perfil,
        COALESCE(nivel_investigador, '') AS nivel_investigador,
        COALESCE(nivel_tecnologo, '') AS nivel_tecnologo,
        COALESCE(cv_url, '') AS cv_url,
        fecha_registro,
        COALESCE(origen, '') AS origen,
        COALESCE(es_admin, FALSE) AS es_admin,
        COALESCE(estado_nacimiento, '') AS estado_nacimiento,
        COALESCE(entidad_federativa, '') AS entidad_federativa,
        COALESCE(orcid, '') AS orcid,
        COALESCE(empleo_actual, '') AS empleo_actual,
        COALESCE(ultimo_grado_estudios, '') AS ultimo_grado_estudios,
        COALESCE(nivel_actual, '') AS nivel_actual,
        COALESCE(institucion_id, '') AS institucion_id,
        COALESCE(activo, TRUE) AS activo
      FROM investigadores 
      WHERE clerk_user_id = $1 OR correo = $2
      LIMIT 1
    `, [clerkUserId, email])
    let rows = Array.isArray(result) ? result : (result.rows || [])
    
    console.log(`📊 Resultados encontrados: ${rows.length}`)
    if (rows.length > 0) {
      console.log(`✅ Perfil encontrado:`);
      console.log(JSON.stringify(rows[0], null, 2));
      // Log detallado del clerk_user_id en la base de datos
      if (rows[0]?.clerk_user_id) {
        console.log('DB clerk_user_id:', rows[0].clerk_user_id, `(len=${rows[0].clerk_user_id.length})`);
        console.log('DB clerk_user_id bytes:', Array.from(Buffer.from(rows[0].clerk_user_id)).join(','));
      }
    } else {
      console.warn(`❌ No se encontró perfil con clerk_user_id='${clerkUserId}' o correo='${email}'.`);
    }
    
    if (rows.length === 0 && user?.id) {
      // Intentar buscar por id si no se encontró por los anteriores
  console.log(`🔄 Buscando por ID de usuario: '${user.id}'`)
      result = await db.query(`
        SELECT 
          id, nombre_completo, nombres, apellidos, curp, rfc, no_cvu, correo, telefono,
          ultimo_grado_estudios, empleo_actual, linea_investigacion,
          area_investigacion, nacionalidad, fecha_nacimiento, fotografia_url,
          genero, municipio, tipo_perfil, nivel_investigador, nivel_tecnologo,
          cv_url, fecha_registro, origen, clerk_user_id
        FROM investigadores 
        WHERE id = $1
        LIMIT 1
      `, [user.id])
      rows = Array.isArray(result) ? result : (result.rows || [])
    }
    if (rows.length === 0) {
  console.error(`❌ No se encontró perfil para usuario. clerk_user_id='${clerkUserId}', email='${email}', id='${user?.id}'`)
      return NextResponse.json({ 
        error: "Perfil no encontrado",
        message: "No se encontró un perfil de investigador asociado a este usuario"
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

    console.log(`✅ Retornando perfil exitosamente. Perfil completo:`, perfilCompleto);
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
