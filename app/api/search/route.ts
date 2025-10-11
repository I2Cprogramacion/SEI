import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const areaFilter = searchParams.get('area') || 'all'
    const institucionFilter = searchParams.get('institucion') || 'all'
    
    if (!query.trim()) {
      return NextResponse.json({ 
        investigadores: [], 
        proyectos: [], 
        total: 0 
      })
    }

    const searchPattern = `%${query.toLowerCase()}%`
    
    let investigadores: any[] = []
    let proyectos: any[] = []

    // Buscar investigadores si type es 'all' o 'investigadores'
    if (type === 'all' || type === 'investigadores') {
      let investigadoresQuery = sql`
        SELECT 
          id,
          nombre_completo as nombre,
          correo,
          institucion,
          COALESCE(area, area_investigacion) as area,
          linea_investigacion,
          fotografia_url,
          ultimo_grado_estudios,
          slug
        FROM investigadores 
        WHERE (
          LOWER(nombre_completo) LIKE ${searchPattern} OR
          LOWER(COALESCE(area, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(area_investigacion, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(linea_investigacion, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(institucion, '')) LIKE ${searchPattern}
        )
      `

      // Aplicar filtros adicionales
      if (areaFilter !== 'all') {
        investigadoresQuery = sql`
          SELECT 
            id,
            nombre_completo as nombre,
            correo,
            institucion,
            COALESCE(area, area_investigacion) as area,
            linea_investigacion,
            fotografia_url,
            ultimo_grado_estudios,
            slug
          FROM investigadores 
          WHERE (
            LOWER(nombre_completo) LIKE ${searchPattern} OR
            LOWER(COALESCE(area, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(area_investigacion, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(linea_investigacion, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(institucion, '')) LIKE ${searchPattern}
          )
          AND (area = ${areaFilter} OR area_investigacion = ${areaFilter})
        `
      }

      if (institucionFilter !== 'all') {
        investigadoresQuery = sql`
          SELECT 
            id,
            nombre_completo as nombre,
            correo,
            institucion,
            COALESCE(area, area_investigacion) as area,
            linea_investigacion,
            fotografia_url,
            ultimo_grado_estudios,
            slug
          FROM investigadores 
          WHERE (
            LOWER(nombre_completo) LIKE ${searchPattern} OR
            LOWER(COALESCE(area, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(area_investigacion, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(linea_investigacion, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(institucion, '')) LIKE ${searchPattern}
          )
          AND institucion = ${institucionFilter}
        `
      }

      investigadoresQuery = sql`
        ${investigadoresQuery}
        ORDER BY nombre_completo ASC
        LIMIT 50
      `

      const resultInv = await investigadoresQuery

      investigadores = resultInv.map((inv: any) => ({
        id: inv.id,
        nombre: inv.nombre,
        email: inv.correo,
        institucion: inv.institucion || 'Institución no especificada',
        area: inv.area || 'Investigación',
        lineaInvestigacion: inv.linea_investigacion,
        fotografiaUrl: inv.fotografia_url,
        ultimoGradoEstudios: inv.ultimo_grado_estudios,
        slug: inv.slug || `investigador-${inv.id}`,
        keywords: [inv.area].filter(Boolean)
      }))
    }

    // Buscar proyectos si type es 'all' o 'proyectos'
    if (type === 'all' || type === 'proyectos') {
      const resultProyectos = await sql`
        SELECT 
          id,
          titulo,
          investigador_principal,
          institucion,
          COALESCE(categoria, area_investigacion, 'Investigación') as area,
          slug
        FROM proyectos
        WHERE (
          LOWER(titulo) LIKE ${searchPattern} OR
          LOWER(COALESCE(descripcion, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(investigador_principal, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(institucion, '')) LIKE ${searchPattern}
        )
        ORDER BY titulo ASC
        LIMIT 50
      `

      proyectos = resultProyectos.map((proy: any) => ({
        id: proy.id,
        titulo: proy.titulo,
        investigador: proy.investigador_principal || 'Sin asignar',
        institucion: proy.institucion || 'Institución no especificada',
        area: proy.area,
        slug: proy.slug || `proyecto-${proy.id}`,
        keywords: [proy.area].filter(Boolean)
      }))
    }

    const total = investigadores.length + proyectos.length

    return NextResponse.json({
      investigadores,
      proyectos,
      total
    })
  } catch (error) {
    console.error("Error en búsqueda:", error)
    return NextResponse.json(
      { 
        investigadores: [], 
        proyectos: [], 
        total: 0,
        error: "Error al realizar la búsqueda"
      },
      { status: 500 }
    )
  }
}
