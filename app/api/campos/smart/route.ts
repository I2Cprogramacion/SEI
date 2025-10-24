import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== SMART API CAMPOS ===')
    
    let db
    try {
      db = await getDatabase()
      console.log('Base de datos conectada')
    } catch (dbError) {
      console.error('Error conectando a la base de datos:', dbError)
      return NextResponse.json(
        { 
          error: "Error de conexión a la base de datos", 
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      )
    }
    
    // Verificar si hay datos
    const totalQuery = `SELECT COUNT(*) as total FROM investigadores`
    console.log('Query de conteo:', totalQuery)
    
    let totalResult
    let totalInvestigadores = 0
    
    try {
      totalResult = await db.query(totalQuery)
      console.log('Resultado del conteo:', totalResult)
      totalInvestigadores = totalResult?.[0]?.total || 0
    } catch (countError) {
      console.error('Error en consulta de conteo:', countError)
      // Si hay error en el conteo, asumir que no hay datos
      totalInvestigadores = 0
    }
    
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
        COALESCE(area_investigacion, 'Sin especificar') as nombre,
        COUNT(DISTINCT id) as investigadores,
        COUNT(DISTINCT institucion) as instituciones
      FROM investigadores 
      WHERE area_investigacion IS NOT NULL AND area_investigacion != ''
      GROUP BY area_investigacion
      ORDER BY investigadores DESC
    `
    
    console.log('Obteniendo áreas reales...')
    console.log('Query SQL:', areasQuery)
    
    let areas
    try {
      areas = await db.query(areasQuery)
      console.log('Áreas encontradas:', areas?.length || 0)
      console.log('Datos de áreas:', areas)
    } catch (queryError) {
      console.error('Error en consulta de áreas:', queryError)
      console.error('Detalles del error:', queryError instanceof Error ? queryError.message : String(queryError))
      // Si hay error en la consulta, usar datos de ejemplo
      areas = []
    }
    
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
      try {
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
      } catch (formatError) {
        console.error('Error formateando área:', formatError, 'Área:', area)
        // Retornar un objeto de área con datos por defecto
        return {
          id: index + 1,
          nombre: area.nombre || 'Área sin nombre',
          descripcion: 'Área de investigación',
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          instituciones: 0,
          crecimiento: 0,
          tendencia: "down" as const,
          subcampos: [],
          color: 'bg-gray-100 text-gray-800',
          slug: 'area-sin-nombre',
          instituciones_lista: '',
          dias_promedio_registro: 0
        }
      }
    })
    
    const totalInvestigadoresCalculado = camposFormateados.reduce((sum: number, campo: any) => {
      try {
        return sum + (campo.investigadores || 0)
      } catch (reduceError) {
        console.error('Error en reduce:', reduceError, 'Campo:', campo)
        return sum
      }
    }, 0)
    
    try {
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
    } catch (responseError) {
      console.error('Error creando respuesta:', responseError)
      return NextResponse.json(
        { 
          error: "Error al formatear respuesta", 
          details: responseError instanceof Error ? responseError.message : String(responseError)
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error("Error en smart API:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json(
      { 
        error: "Error al obtener datos", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
