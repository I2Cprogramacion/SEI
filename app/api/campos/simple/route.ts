import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Query muy simple para obtener áreas básicas
    const areasQuery = `
      SELECT 
        COALESCE(area_investigacion, 'Sin especificar') as nombre,
        COUNT(DISTINCT id) as investigadores,
        COUNT(DISTINCT institucion) as instituciones
      FROM investigadores 
      WHERE area_investigacion IS NOT NULL AND area_investigacion != ''
      GROUP BY COALESCE(area_investigacion, 'Sin especificar')
      ORDER BY investigadores DESC
    `
    
    console.log('Ejecutando query simple:', areasQuery)
    
    const areas = await db.query(areasQuery)
    console.log('Resultados obtenidos:', areas.length)
    
    // Formatear datos básicos
    const camposFormateados = areas.map((area: any, index: number) => {
      const slug = area.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      const colores = [
        'bg-blue-100 text-blue-800',
        'bg-purple-100 text-purple-800', 
        'bg-green-100 text-green-800',
        'bg-orange-100 text-orange-800',
        'bg-teal-100 text-teal-800',
        'bg-indigo-100 text-indigo-800',
        'bg-pink-100 text-pink-800',
        'bg-lime-100 text-lime-800'
      ]
      const colorIndex = index % colores.length
      
      return {
        id: index + 1,
        nombre: area.nombre,
        descripcion: `Área de investigación con ${area.investigadores} investigadores activos`,
        investigadores: parseInt(area.investigadores) || 0,
        proyectos: 0,
        publicaciones: 0,
        instituciones: parseInt(area.instituciones) || 0,
        crecimiento: Math.min(100, Math.round(area.investigadores * 5)),
        tendencia: "up" as const,
        subcampos: [],
        color: colores[colorIndex],
        slug: slug,
        instituciones_lista: '',
        dias_promedio_registro: 0
      }
    })
    
    // Estadísticas generales
    const totalInvestigadores = camposFormateados.reduce((sum, campo) => sum + campo.investigadores, 0)
    const totalProyectos = 0
    const totalPublicaciones = 0
    
    return NextResponse.json({
      campos: camposFormateados,
      estadisticas: {
        totalCampos: camposFormateados.length,
        totalInvestigadores,
        totalProyectos,
        totalPublicaciones
      },
      filtros: {
        instituciones: [],
        nivelesActividad: [
          { valor: 'alto', etiqueta: 'Alta actividad (70%+)', color: 'text-green-600' },
          { valor: 'medio', etiqueta: 'Actividad media (40-69%)', color: 'text-yellow-600' },
          { valor: 'bajo', etiqueta: 'Baja actividad (<40%)', color: 'text-red-600' }
        ],
        ordenamiento: [
          { valor: 'investigadores', etiqueta: 'Por número de investigadores' },
          { valor: 'proyectos', etiqueta: 'Por número de proyectos' },
          { valor: 'publicaciones', etiqueta: 'Por número de publicaciones' },
          { valor: 'instituciones', etiqueta: 'Por número de instituciones' },
          { valor: 'nombre', etiqueta: 'Por nombre alfabético' }
        ]
      },
      parametros: {
        search: '',
        institucion: 'all',
        actividad: 'all',
        orden: 'investigadores',
        direccion: 'desc'
      }
    })
    
  } catch (error) {
    console.error("Error al obtener campos de investigación:", error)
    return NextResponse.json(
      { 
        error: "Error interno del servidor", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
