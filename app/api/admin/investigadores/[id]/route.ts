import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/investigadores/[id]
 * Obtiene todos los datos de un investigador (solo para admins)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: "Email no encontrado" }, { status: 400 })
    }

    // Verificar que el usuario sea admin
    const db = await getDatabase()
    const adminCheck = await db.query(
      `SELECT es_admin FROM investigadores WHERE LOWER(correo) = $1 LIMIT 1`,
      [email.toLowerCase()]
    )
    
    const adminRows = Array.isArray(adminCheck) ? adminCheck : (adminCheck.rows || [])
    if (adminRows.length === 0 || !adminRows[0].es_admin) {
      return NextResponse.json({ error: "No autorizado - Solo admins" }, { status: 403 })
    }

    // Obtener el investigador por ID o slug
    const { id } = params
    const isNumeric = /^\d+$/.test(id)
    
    const query = `
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
        COALESCE(nacionalidad, 'Mexicana') AS nacionalidad,
        fecha_nacimiento,
        COALESCE(ultimo_grado_estudios, '') AS ultimo_grado_estudios,
        COALESCE(grado_maximo_estudios, '') AS grado_maximo_estudios,
        COALESCE(empleo_actual, '') AS empleo_actual,
        COALESCE(linea_investigacion, '') AS linea_investigacion,
        COALESCE(area_investigacion, '') AS area_investigacion,
        COALESCE(institucion, '') AS institucion,
        COALESCE(departamento, '') AS departamento,
        COALESCE(sitio_web, '') AS sitio_web,
        COALESCE(slug, '') AS slug,
        COALESCE(cv_url, '') AS cv_url,
        dictamen_url,
        sni_url,
        COALESCE(orcid, '') AS orcid,
        COALESCE(nivel, '') AS nivel,
        COALESCE(nivel_investigador, '') AS nivel_investigador,
        COALESCE(nivel_sni, '') AS nivel_sni,
        COALESCE(disciplina, '') AS disciplina,
        COALESCE(especialidad, '') AS especialidad,
        COALESCE(sni, '') AS sni,
        anio_sni,
        COALESCE(tipo_perfil, 'INVESTIGADOR') AS tipo_perfil,
        COALESCE(nivel_tecnologo, '') AS nivel_tecnologo,
        nivel_tecnologo_id,
        COALESCE(experiencia_docente, '') AS experiencia_docente,
        COALESCE(experiencia_laboral, '') AS experiencia_laboral,
        COALESCE(proyectos_investigacion, '') AS proyectos_investigacion,
        COALESCE(proyectos_vinculacion, '') AS proyectos_vinculacion,
        COALESCE(libros, '') AS libros,
        COALESCE(capitulos_libros, '') AS capitulos_libros,
        COALESCE(articulos, '') AS articulos,
        COALESCE(premios_distinciones, '') AS premios_distinciones,
        COALESCE(idiomas, '') AS idiomas,
        COALESCE(colaboracion_internacional, '') AS colaboracion_internacional,
        COALESCE(colaboracion_nacional, '') AS colaboracion_nacional,
        COALESCE(domicilio, '') AS domicilio,
        COALESCE(cp, '') AS cp,
        COALESCE(estado_nacimiento, '') AS estado_nacimiento,
        COALESCE(municipio, '') AS municipio,
        COALESCE(entidad_federativa, '') AS entidad_federativa,
        COALESCE(genero, '') AS genero,
        COALESCE(es_admin, false) AS es_admin,
        COALESCE(activo, true) AS activo,
        COALESCE(perfil_publico, true) AS perfil_publico
      FROM investigadores
      WHERE ${isNumeric ? 'id = $1' : 'slug = $1'}
      LIMIT 1
    `

    const result = await db.query(query, [isNumeric ? Number(id) : id])
    const rows = Array.isArray(result) ? result : (result.rows || [])

    if (rows.length === 0) {
      return NextResponse.json({ error: "Investigador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error al obtener investigador:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/investigadores/[id]
 * Actualiza un investigador (solo para admins)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: "Email no encontrado" }, { status: 400 })
    }

    // Verificar que el usuario sea admin
    const db = await getDatabase()
    const adminCheck = await db.query(
      `SELECT es_admin FROM investigadores WHERE LOWER(correo) = $1 LIMIT 1`,
      [email.toLowerCase()]
    )
    
    const adminRows = Array.isArray(adminCheck) ? adminCheck : (adminCheck.rows || [])
    if (adminRows.length === 0 || !adminRows[0].es_admin) {
      return NextResponse.json({ error: "No autorizado - Solo admins" }, { status: 403 })
    }

    const { id } = params
    const isNumeric = /^\d+$/.test(id)
    const data = await request.json()

    // Validar que haya datos para actualizar
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 })
    }

    // Campos permitidos para actualizar (incluyendo campos de admin)
    const camposPermitidos = [
      'nombre_completo', 'nombres', 'apellidos', 'curp', 'rfc', 'no_cvu', 'telefono',
      'ultimo_grado_estudios', 'grado_maximo_estudios', 'empleo_actual',
      'linea_investigacion', 'area_investigacion', 'disciplina', 'especialidad',
      'nacionalidad', 'fecha_nacimiento', 'genero', 'municipio',
      'estado_nacimiento', 'entidad_federativa', 'fotografia_url',
      'institucion_id', 'institucion', 'departamento', 'ubicacion', 'sitio_web',
      'orcid', 'nivel', 'nivel_investigador', 'nivel_actual_id', 'fecha_asignacion_nivel',
      'tipo_perfil', 'nivel_sni', 'sni', 'anio_sni', 'nivel_tecnologo', 'nivel_tecnologo_id',
      'experiencia_docente', 'experiencia_laboral', 'proyectos_investigacion',
      'proyectos_vinculacion', 'libros', 'capitulos_libros', 'articulos',
      'premios_distinciones', 'idiomas', 'colaboracion_internacional',
      'colaboracion_nacional', 'domicilio', 'cp',
      // Campos exclusivos de admin
      'es_admin', 'activo', 'perfil_publico', 'correo'
    ]

    // Construir query dinámicamente
    const camposActualizar: string[] = []
    const valores: any[] = []
    let paramCount = 1

    Object.keys(data).forEach(key => {
      if (camposPermitidos.includes(key) && data[key] !== undefined) {
        let valor = data[key]
        
        // Convertir strings vacíos a null para campos opcionales
        if (valor === "" && (
          key.includes('fecha') ||
          key.includes('_id') ||
          key === 'orcid' ||
          key === 'nivel' ||
          key === 'anio_sni'
        )) {
          valor = null
        }
        
        // Convertir anio_sni a número
        if (key === 'anio_sni' && valor && typeof valor === 'string') {
          valor = parseInt(valor, 10)
          if (isNaN(valor)) {
            valor = null
          }
        }
        
        // Convertir booleanos si vienen como strings
        if ((key === 'es_admin' || key === 'activo' || key === 'perfil_publico') && typeof valor === 'string') {
          valor = valor === 'true' || valor === '1'
        }
        
        camposActualizar.push(`${key} = $${paramCount}`)
        valores.push(valor)
        paramCount++
      }
    })

    if (camposActualizar.length === 0) {
      return NextResponse.json({
        error: "No hay campos válidos para actualizar"
      }, { status: 400 })
    }

    // Agregar el ID al final para el WHERE
    valores.push(isNumeric ? Number(id) : id)

    const query = `
      UPDATE investigadores
      SET ${camposActualizar.join(', ')}
      WHERE ${isNumeric ? 'id' : 'slug'} = $${paramCount}
      RETURNING id, nombre_completo, correo, es_admin, activo
    `

    const result = await db.query(query, valores)
    const rows = Array.isArray(result) ? result : (result.rows || [])
    const rowCount = Array.isArray(result) ? result.length : (result.rowCount || 0)

    if (rowCount === 0) {
      return NextResponse.json({
        error: "No se encontró el investigador para actualizar"
      }, { status: 404 })
    }

    const actualizado = rows[0]

    return NextResponse.json({
      success: true,
      message: `✅ Perfil de ${actualizado.nombre_completo} actualizado exitosamente`,
      data: actualizado
    })
  } catch (error) {
    console.error("Error al actualizar investigador:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}
