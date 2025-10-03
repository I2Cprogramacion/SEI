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
        institucion,
        area,
        telefono,
        orcid,
        nivel,
        nacionalidad,
        estado_nacimiento,
        municipio,
        entidad_federativa
      FROM investigadores 
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Agregar filtros
    if (search) {
      query += ` AND (
        LOWER(nombre_completo) LIKE $${paramIndex} OR 
        LOWER(correo) LIKE $${paramIndex} OR 
        LOWER(institucion) LIKE $${paramIndex} OR 
        LOWER(area) LIKE $${paramIndex} OR
        LOWER(nivel) LIKE $${paramIndex}
      )`
      params.push(`%${search.toLowerCase()}%`)
      paramIndex++
    }

    if (area !== 'all') {
      query += ` AND area = $${paramIndex}`
      params.push(area)
      paramIndex++
    }

    if (institucion !== 'all') {
      query += ` AND institucion = $${paramIndex}`
      params.push(institucion)
      paramIndex++
    }

    if (ubicacion !== 'all') {
      query += ` AND (estado_nacimiento = $${paramIndex} OR entidad_federativa = $${paramIndex})`
      params.push(ubicacion)
      paramIndex++
    }

    query += ` ORDER BY nombre_completo ASC`

    // Ejecutar query
    const investigadores = await db.query(query, params)

    // Formatear respuesta
    const investigadoresFormateados = investigadores.map((inv: any) => ({
      id: inv.id,
      nombre: inv.nombre_completo,
      email: inv.correo,
      institucion: inv.institucion,
      area: inv.area,
      telefono: inv.telefono,
      orcid: inv.orcid,
      nivel: inv.nivel,
      nacionalidad: inv.nacionalidad,
      estadoNacimiento: inv.estado_nacimiento,
      municipio: inv.municipio,
      entidadFederativa: inv.entidad_federativa,
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