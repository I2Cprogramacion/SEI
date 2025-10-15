import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoria = searchParams.get('categoria') || 'all'
    const estado = searchParams.get('estado') || 'all'
    const institucion = searchParams.get('institucion') || 'all'

    const db = await getDatabase()
    
    // Construir query base
    let query = `
      SELECT 
        id,
        titulo,
        descripcion,
        investigador_principal_id,
        investigador_principal,
        fecha_inicio,
        fecha_fin,
        estado,
        area_investigacion,
        categoria,
        presupuesto,
        fuente_financiamiento,
        institucion,
        slug
      FROM proyectos
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Agregar filtros con sintaxis PostgreSQL
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`
      query += ` AND (
        LOWER(titulo) LIKE $${paramIndex} OR 
        LOWER(descripcion) LIKE $${paramIndex + 1} OR 
        LOWER(investigador_principal) LIKE $${paramIndex + 2} OR
        LOWER(institucion) LIKE $${paramIndex + 3}
      )`
      params.push(searchParam, searchParam, searchParam, searchParam)
      paramIndex += 4
    }

    if (categoria !== 'all') {
      query += ` AND categoria = $${paramIndex}`
      params.push(categoria)
      paramIndex += 1
    }

    if (estado !== 'all') {
      query += ` AND estado = $${paramIndex}`
      params.push(estado)
      paramIndex += 1
    }

    if (institucion !== 'all') {
      query += ` AND institucion = $${paramIndex}`
      params.push(institucion)
      paramIndex += 1
    }

    query += ` ORDER BY fecha_inicio DESC NULLS LAST`

    // Ejecutar query
    const result = await db.query(query, params)
    const proyectos = Array.isArray(result) ? result : (result.rows || [])

    // Formatear respuesta
    const proyectosFormateados = proyectos.map((proyecto: any) => ({
      id: proyecto.id,
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      autor: {
        nombre: proyecto.investigador_principal,
        institucion: proyecto.institucion,
        email: null,
        telefono: null
      },
      categoria: proyecto.categoria || proyecto.area_investigacion,
      estado: proyecto.estado,
      fechaInicio: proyecto.fecha_inicio,
      fechaFin: proyecto.fecha_fin,
      presupuesto: proyecto.presupuesto,
      palabrasClave: [],
      objetivos: [],
      resultados: [],
      metodologia: null,
      impacto: null,
      colaboradores: [],
      financiamiento: proyecto.fuente_financiamiento,
      slug: proyecto.slug || proyecto.titulo?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))

    // Obtener opciones únicas para filtros
    const categorias = [...new Set(proyectos.map((p: any) => p.categoria || p.area_investigacion).filter(Boolean))]
    const estados = [...new Set(proyectos.map((p: any) => p.estado).filter(Boolean))]
    const instituciones = [...new Set(proyectos.map((p: any) => p.institucion).filter(Boolean))]

    return NextResponse.json({
      proyectos: proyectosFormateados,
      filtros: {
        categorias: categorias.sort(),
        estados: estados.sort(),
        instituciones: instituciones.sort()
      }
    })

  } catch (error) {
    console.error("Error al obtener proyectos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}