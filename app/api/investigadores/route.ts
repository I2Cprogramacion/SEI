import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const area = searchParams.get('area') || 'all'
    const institucion = searchParams.get('institucion') || 'all'
    const ubicacion = searchParams.get('ubicacion') || 'all'

    const db = await getDatabase()
    
    // Construir query base
    let query = `
      SELECT 
        id,
        nombre_completo,
        nombres,
        apellidos,
        correo,
        curp,
        rfc,
        no_cvu,
        telefono,
        institucion,
        area,
        area_investigacion,
        linea_investigacion,
        fotografia_url,
        ultimo_grado_estudios,
        grado_maximo_estudios,
        empleo_actual,
        orcid,
        nivel,
        nacionalidad,
        fecha_nacimiento,
        estado_nacimiento,
        municipio,
        entidad_federativa,
        slug,
        clerk_user_id
      FROM investigadores 
      WHERE TRIM(COALESCE(nombre_completo, '')) != ''
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Agregar filtros (PostgreSQL usa $1, $2, etc)
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`
      query += ` AND (
        LOWER(nombre_completo) LIKE $${paramIndex} OR 
        LOWER(nombres) LIKE $${paramIndex + 1} OR
        LOWER(apellidos) LIKE $${paramIndex + 2} OR
        LOWER(correo) LIKE $${paramIndex + 3} OR 
        LOWER(institucion) LIKE $${paramIndex + 4} OR
        LOWER(empleo_actual) LIKE $${paramIndex + 5} OR 
        LOWER(area) LIKE $${paramIndex + 6} OR
        LOWER(area_investigacion) LIKE $${paramIndex + 7} OR
        LOWER(linea_investigacion) LIKE $${paramIndex + 8} OR
        LOWER(nivel) LIKE $${paramIndex + 9}
      )`
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam)
      paramIndex += 10
    }

    if (area !== 'all') {
      query += ` AND (area = $${paramIndex} OR area_investigacion = $${paramIndex})`
      params.push(area)
      paramIndex += 1
    }

    if (institucion !== 'all') {
      query += ` AND (institucion = $${paramIndex} OR empleo_actual = $${paramIndex})`
      params.push(institucion)
      paramIndex += 1
    }

    if (ubicacion !== 'all') {
      query += ` AND (estado_nacimiento = $${paramIndex} OR entidad_federativa = $${paramIndex})`
      params.push(ubicacion)
      paramIndex += 1
    }

    query += ` ORDER BY nombre_completo ASC`

    // Ejecutar query
    const investigadores = await db.query(query, params)

    // Helper para limpiar valores null/undefined/vacíos
    const cleanValue = (value: any) => {
      if (!value || value === 'N/A' || value.toString().trim() === '') {
        return null
      }
      return value.toString().trim()
    }

    // Formatear respuesta
    const investigadoresFormateados = investigadores.map((inv: any) => ({
      id: inv.id,
      nombre: cleanValue(inv.nombre_completo) || `${cleanValue(inv.nombres) || ''} ${cleanValue(inv.apellidos) || ''}`.trim(),
      email: inv.correo,
      curp: cleanValue(inv.curp),
      rfc: cleanValue(inv.rfc),
      noCvu: cleanValue(inv.no_cvu),
      telefono: cleanValue(inv.telefono),
      institucion: cleanValue(inv.institucion),
      area: cleanValue(inv.area) || cleanValue(inv.area_investigacion),
      areaInvestigacion: cleanValue(inv.area_investigacion),
      lineaInvestigacion: cleanValue(inv.linea_investigacion),
      fotografiaUrl: cleanValue(inv.fotografia_url),
      ultimoGradoEstudios: cleanValue(inv.ultimo_grado_estudios) || cleanValue(inv.grado_maximo_estudios),
      empleoActual: cleanValue(inv.empleo_actual),
      orcid: cleanValue(inv.orcid),
      nivel: cleanValue(inv.nivel),
      nacionalidad: cleanValue(inv.nacionalidad),
      fechaNacimiento: cleanValue(inv.fecha_nacimiento),
      estadoNacimiento: cleanValue(inv.estado_nacimiento),
      municipio: cleanValue(inv.municipio),
      entidadFederativa: cleanValue(inv.entidad_federativa),
      slug: cleanValue(inv.slug) || `investigador-${inv.id}`
    }))

    // Obtener opciones únicas para filtros
    const areas = await db.query(`
      SELECT DISTINCT COALESCE(area, area_investigacion) as area
      FROM investigadores 
      WHERE (area IS NOT NULL AND area != '') 
         OR (area_investigacion IS NOT NULL AND area_investigacion != '')
      ORDER BY area
    `)

    const instituciones = await db.query(`
      SELECT DISTINCT COALESCE(institucion, empleo_actual) as institucion
      FROM investigadores 
      WHERE (institucion IS NOT NULL AND institucion != '')
         OR (empleo_actual IS NOT NULL AND empleo_actual != '')
      ORDER BY institucion
    `)

    const ubicaciones = await db.query(`
      SELECT DISTINCT 
        COALESCE(estado_nacimiento, entidad_federativa) as ubicacion
      FROM investigadores 
      WHERE (estado_nacimiento IS NOT NULL AND estado_nacimiento != '') 
         OR (entidad_federativa IS NOT NULL AND entidad_federativa != '')
      ORDER BY ubicacion
    `)

    return NextResponse.json({
      investigadores: investigadoresFormateados,
      filtros: {
        areas: areas.map((a: any) => a.area),
        instituciones: instituciones.map((i: any) => i.institucion),
        ubicaciones: ubicaciones.map((u: any) => u.ubicacion)
      }
    })

  } catch (error) {
    console.error("Error al obtener investigadores:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}