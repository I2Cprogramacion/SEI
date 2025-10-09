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
        entidad_federativa
      FROM investigadores 
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Agregar filtros (usando ? para SQLite)
    if (search) {
      query += ` AND (
        LOWER(nombre_completo) LIKE ? OR 
        LOWER(correo) LIKE ? OR 
        LOWER(institucion) LIKE ? OR 
        LOWER(area) LIKE ? OR
        LOWER(nivel) LIKE ?
      )`
      const searchParam = `%${search.toLowerCase()}%`
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam)
    }

    if (area !== 'all') {
      query += ` AND area = ?`
      params.push(area)
    }

    if (institucion !== 'all') {
      query += ` AND institucion = ?`
      params.push(institucion)
    }

    if (ubicacion !== 'all') {
      query += ` AND (estado_nacimiento = ? OR entidad_federativa = ?)`
      params.push(ubicacion, ubicacion)
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
      nombre: inv.nombre_completo,
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
      slug: inv.nombre_completo?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `investigador-${inv.id}`
    }))

    // Obtener opciones únicas para filtros
    const areas = await db.query(`
      SELECT DISTINCT area 
      FROM investigadores 
      WHERE area IS NOT NULL AND area != ''
      ORDER BY area
    `)

    const instituciones = await db.query(`
      SELECT DISTINCT institucion 
      FROM investigadores 
      WHERE institucion IS NOT NULL AND institucion != ''
      ORDER BY institucion
    `)

    const ubicaciones = await db.query(`
      SELECT DISTINCT estado_nacimiento, entidad_federativa
      FROM investigadores 
      WHERE (estado_nacimiento IS NOT NULL AND estado_nacimiento != '') 
         OR (entidad_federativa IS NOT NULL AND entidad_federativa != '')
      ORDER BY COALESCE(estado_nacimiento, entidad_federativa)
    `)

    return NextResponse.json({
      investigadores: investigadoresFormateados,
      filtros: {
        areas: areas.map((a: any) => a.area),
        instituciones: instituciones.map((i: any) => i.institucion),
        ubicaciones: ubicaciones.map((u: any) => u.estado_nacimiento || u.entidad_federativa)
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