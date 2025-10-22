import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== SMART API CAMPOS ===')
    
    const db = await getDatabase()
    console.log('Base de datos conectada')
    
    // Verificar si hay datos
    const totalQuery = `SELECT COUNT(*) as total FROM investigadores`
    const totalResult = await db.query(totalQuery)
    const totalInvestigadores = totalResult?.[0]?.total || 0
    
    console.log('Total investigadores en BD:', totalInvestigadores)
    
    if (totalInvestigadores === 0) {
      console.log('No hay investigadores en la base de datos')
      
      // Retornar datos de ejemplo cuando no hay datos reales
      const camposEjemplo = [
        {
          id: 1,
          nombre: "Ciencias de la Computación",
          descripcion: "Área de investigación con datos de ejemplo",
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          instituciones: 0,
          crecimiento: 0,
          tendencia: "down" as const,
          subcampos: ["Inteligencia Artificial", "Machine Learning"],
          color: "bg-blue-100 text-blue-800",
          slug: "ciencias-computacion",
          instituciones_lista: "",
          dias_promedio_registro: 0
        },
        {
          id: 2,
          nombre: "Ingeniería",
          descripcion: "Área de investigación con datos de ejemplo",
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          instituciones: 0,
          crecimiento: 0,
          tendencia: "down" as const,
          subcampos: ["Ingeniería Civil", "Ingeniería Industrial"],
          color: "bg-green-100 text-green-800",
          slug: "ingenieria",
          instituciones_lista: "",
          dias_promedio_registro: 0
        }
      ]
      
      return NextResponse.json({
        campos: camposEjemplo,
        estadisticas: {
          totalCampos: 2,
          totalInvestigadores: 0,
          totalProyectos: 0,
          totalPublicaciones: 0
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
        },
        mensaje: "No hay investigadores registrados en la base de datos. Mostrando campos de ejemplo."
      })
    }
    
    // Si hay datos, intentar obtener áreas reales
    const areasQuery = `
      SELECT 
        COALESCE(area, area_investigacion, 'Sin especificar') as nombre,
        COUNT(DISTINCT id) as investigadores,
        COUNT(DISTINCT institucion) as instituciones
      FROM investigadores 
      WHERE (area IS NOT NULL AND area != '') 
         OR (area_investigacion IS NOT NULL AND area_investigacion != '')
      GROUP BY COALESCE(area, area_investigacion, 'Sin especificar')
      ORDER BY investigadores DESC
    `
    
    console.log('Obteniendo áreas reales...')
    const areas = await db.query(areasQuery)
    console.log('Áreas encontradas:', areas?.length || 0)
    
    if (!areas || areas.length === 0) {
      console.log('No se encontraron áreas, usando datos de ejemplo')
      
      // Si no hay áreas específicas, crear una área general
      const camposGenerales = [
        {
          id: 1,
          nombre: "Investigación General",
          descripcion: `Área general con ${totalInvestigadores} investigadores registrados`,
          investigadores: totalInvestigadores,
          proyectos: 0,
          publicaciones: 0,
          instituciones: 1,
          crecimiento: Math.min(100, Math.round(totalInvestigadores * 5)),
          tendencia: "up" as const,
          subcampos: ["Investigación", "Desarrollo"],
          color: "bg-blue-100 text-blue-800",
          slug: "investigacion-general",
          instituciones_lista: "",
          dias_promedio_registro: 0
        }
      ]
      
      return NextResponse.json({
        campos: camposGenerales,
        estadisticas: {
          totalCampos: 1,
          totalInvestigadores,
          totalProyectos: 0,
          totalPublicaciones: 0
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
        },
        mensaje: "Se encontraron investigadores pero sin áreas específicas definidas."
      })
    }
    
    // Formatear datos reales
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
      
      const actividad = Math.min(100, Math.round(area.investigadores * 5))
      
      return {
        id: index + 1,
        nombre: area.nombre,
        descripcion: `Área de investigación con ${area.investigadores} investigadores activos en ${area.instituciones} instituciones`,
        investigadores: parseInt(area.investigadores) || 0,
        proyectos: 0,
        publicaciones: 0,
        instituciones: parseInt(area.instituciones) || 0,
        crecimiento: actividad,
        tendencia: actividad > 70 ? "up" : actividad > 40 ? "stable" : "down",
        subcampos: [],
        color: colores[colorIndex],
        slug: slug,
        instituciones_lista: '',
        dias_promedio_registro: 0
      }
    })
    
    const totalInvestigadoresCalculado = camposFormateados.reduce((sum, campo) => sum + campo.investigadores, 0)
    
    return NextResponse.json({
      campos: camposFormateados,
      estadisticas: {
        totalCampos: camposFormateados.length,
        totalInvestigadores: totalInvestigadoresCalculado,
        totalProyectos: 0,
        totalPublicaciones: 0
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
      },
      mensaje: "Datos reales obtenidos de la base de datos."
    })
    
  } catch (error) {
    console.error("Error en smart API:", error)
    return NextResponse.json(
      { 
        error: "Error al obtener datos", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
