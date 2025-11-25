import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const searchTerm = searchParams.get('search') || ''
  const institucion = searchParams.get('institucion') || 'all'
  const actividad = searchParams.get('actividad') || 'all'
  const orden = searchParams.get('orden') || 'investigadores'
  const direccion = searchParams.get('direccion') || 'desc'
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
    const totalQuery = `SELECT COUNT(*) as total FROM investigadores WHERE COALESCE(activo, true) = true`
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
    
    // Si hay datos, intentar obtener áreas reales con líneas de investigación
    // Primero obtener las áreas con sus líneas de investigación agrupadas
    let areasQuery: string
    let queryParams: any[] = []
    
    if (institucion !== 'all') {
      areasQuery = `
        SELECT 
          COALESCE(area_investigacion, 'Sin especificar') as nombre,
          COUNT(DISTINCT inv.id) as investigadores,
          COUNT(DISTINCT inv.institucion) as instituciones,
          STRING_AGG(DISTINCT inv.linea_investigacion, ', ') FILTER (WHERE inv.linea_investigacion IS NOT NULL AND inv.linea_investigacion != '') as lineas_investigacion
        FROM investigadores inv
        WHERE inv.area_investigacion IS NOT NULL AND inv.area_investigacion != ''
        AND LOWER(TRIM(inv.institucion)) = LOWER(TRIM($1))
        AND COALESCE(inv.activo, true) = true
        GROUP BY area_investigacion
        ORDER BY investigadores DESC
      `
      queryParams = [institucion]
    } else {
      areasQuery = `
        SELECT 
          COALESCE(area_investigacion, 'Sin especificar') as nombre,
          COUNT(DISTINCT inv.id) as investigadores,
          COUNT(DISTINCT inv.institucion) as instituciones,
          STRING_AGG(DISTINCT inv.linea_investigacion, ', ') FILTER (WHERE inv.linea_investigacion IS NOT NULL AND inv.linea_investigacion != '') as lineas_investigacion
        FROM investigadores inv
        WHERE inv.area_investigacion IS NOT NULL AND inv.area_investigacion != ''
        AND COALESCE(inv.activo, true) = true
        GROUP BY area_investigacion
        ORDER BY investigadores DESC
      `
    }
    
    console.log('Obteniendo áreas reales...')
    console.log('Query SQL:', areasQuery)
    console.log('Parámetros de búsqueda:', { searchTerm, institucion, actividad, orden, direccion })
    console.log('Query params:', queryParams)
    
    let areas
    try {
      areas = await db.query(areasQuery, queryParams)
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
    
    // Formatear datos reales y extraer líneas de investigación
    let camposFormateados = areas.map((area: any, index: number) => {
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
        
        const actividadCalculada = Math.min(100, Math.round(area.investigadores * 5))
        
        // Procesar líneas de investigación: pueden venir como string separado por comas
        let lineasInvestigacion: string[] = []
        if (area.lineas_investigacion) {
          // Separar por comas y limpiar, eliminando duplicados
          const lineasSet = new Set<string>()
          area.lineas_investigacion
            .split(',')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0)
            .forEach((l: string) => lineasSet.add(l))
          lineasInvestigacion = Array.from(lineasSet)
        }
        
        return {
          id: index + 1,
          nombre: area.nombre,
          descripcion: `Área de investigación con ${area.investigadores} investigadores activos en ${area.instituciones} instituciones`,
          investigadores: parseInt(area.investigadores) || 0,
          proyectos: 0,
          publicaciones: 0,
          instituciones: parseInt(area.instituciones) || 0,
          crecimiento: actividadCalculada,
          tendencia: actividadCalculada > 70 ? "up" : actividadCalculada > 40 ? "stable" : "down",
          subcampos: lineasInvestigacion, // Usar líneas de investigación como subcampos
          color: colores[colorIndex],
          slug: slug,
          instituciones_lista: '',
          dias_promedio_registro: 0,
          lineas_investigacion: lineasInvestigacion // Agregar campo adicional para búsqueda
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
          dias_promedio_registro: 0,
          lineas_investigacion: []
        }
      }
    })
    
    // Aplicar filtro de búsqueda si hay término de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim()
      camposFormateados = camposFormateados.filter((campo: any) => {
        // Buscar en nombre del campo
        const nombreMatch = campo.nombre.toLowerCase().includes(searchLower)
        
        // Buscar en descripción
        const descripcionMatch = campo.descripcion.toLowerCase().includes(searchLower)
        
        // Buscar en líneas de investigación
        const lineasMatch = campo.lineas_investigacion && campo.lineas_investigacion.some((linea: string) => 
          linea.toLowerCase().includes(searchLower)
        )
        
        // Buscar en subcampos (que también son líneas de investigación)
        const subcamposMatch = campo.subcampos && campo.subcampos.some((subcampo: string) =>
          subcampo.toLowerCase().includes(searchLower)
        )
        
        return nombreMatch || descripcionMatch || lineasMatch || subcamposMatch
      })
    }
    
    // Aplicar filtro de actividad
    if (actividad !== 'all') {
      camposFormateados = camposFormateados.filter((campo: any) => {
        if (actividad === 'alto') return campo.crecimiento >= 70
        if (actividad === 'medio') return campo.crecimiento >= 40 && campo.crecimiento < 70
        if (actividad === 'bajo') return campo.crecimiento < 40
        return true
      })
    }
    
    // Aplicar ordenamiento
    camposFormateados.sort((a: any, b: any) => {
      let comparison = 0
      if (orden === 'investigadores') {
        comparison = a.investigadores - b.investigadores
      } else if (orden === 'proyectos') {
        comparison = a.proyectos - b.proyectos
      } else if (orden === 'publicaciones') {
        comparison = a.publicaciones - b.publicaciones
      } else if (orden === 'instituciones') {
        comparison = a.instituciones - b.instituciones
      } else if (orden === 'nombre') {
        comparison = a.nombre.localeCompare(b.nombre)
      }
      return direccion === 'desc' ? -comparison : comparison
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
          search: searchTerm,
          institucion: institucion,
          actividad: actividad,
          orden: orden,
          direccion: direccion
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
