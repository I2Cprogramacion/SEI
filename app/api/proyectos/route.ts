import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoria = searchParams.get('categoria') || 'all'
    const estado = searchParams.get('estado') || 'all'
    const institucion = searchParams.get('institucion') || 'all'

    // Leer proyectos del archivo JSON
    const proyectosPath = path.join(process.cwd(), 'data', 'proyectos.json')
    let proyectos: any[] = []
    
    try {
      const proyectosData = fs.readFileSync(proyectosPath, 'utf8')
      proyectos = JSON.parse(proyectosData)
    } catch (error) {
      console.error("Error al leer proyectos:", error)
      return NextResponse.json({
        proyectos: [],
        filtros: {
          categorias: [],
          estados: [],
          instituciones: []
        }
      })
    }

    // Filtrar proyectos
    let proyectosFiltrados = proyectos

    if (search) {
      const searchLower = search.toLowerCase()
      proyectosFiltrados = proyectosFiltrados.filter(proyecto => 
        proyecto.titulo?.toLowerCase().includes(searchLower) ||
        proyecto.descripcion?.toLowerCase().includes(searchLower) ||
        proyecto.autor?.nombreCompleto?.toLowerCase().includes(searchLower) ||
        proyecto.autor?.instituto?.toLowerCase().includes(searchLower) ||
        proyecto.categoria?.toLowerCase().includes(searchLower) ||
        proyecto.palabrasClave?.some((keyword: string) => keyword.toLowerCase().includes(searchLower))
      )
    }

    if (categoria !== 'all') {
      proyectosFiltrados = proyectosFiltrados.filter(proyecto => proyecto.categoria === categoria)
    }

    if (estado !== 'all') {
      proyectosFiltrados = proyectosFiltrados.filter(proyecto => proyecto.estado === estado)
    }

    if (institucion !== 'all') {
      proyectosFiltrados = proyectosFiltrados.filter(proyecto => proyecto.autor?.instituto === institucion)
    }

    // Formatear respuesta
    const proyectosFormateados = proyectosFiltrados.map((proyecto: any) => ({
      id: proyecto.id,
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      autor: {
        nombre: proyecto.autor?.nombreCompleto,
        institucion: proyecto.autor?.instituto,
        email: proyecto.autor?.email,
        telefono: proyecto.autor?.telefono
      },
      categoria: proyecto.categoria,
      estado: proyecto.estado,
      fechaInicio: proyecto.fechaInicio,
      fechaFin: proyecto.fechaFin,
      presupuesto: proyecto.presupuesto,
      palabrasClave: proyecto.palabrasClave || [],
      objetivos: proyecto.objetivos || [],
      resultados: proyecto.resultados || [],
      metodologia: proyecto.metodologia,
      impacto: proyecto.impacto,
      colaboradores: proyecto.colaboradores || [],
      financiamiento: proyecto.financiamiento,
      slug: proyecto.slug
    }))

    // Obtener opciones únicas para filtros
    const categorias = [...new Set(proyectos.map(p => p.categoria).filter(Boolean))]
    const estados = [...new Set(proyectos.map(p => p.estado).filter(Boolean))]
    const instituciones = [...new Set(proyectos.map(p => p.autor?.instituto).filter(Boolean))]

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