import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const institucion = searchParams.get('institucion') || 'all'
    const actividad = searchParams.get('actividad') || 'all'
    const orden = searchParams.get('orden') || 'investigadores'
    const direccion = searchParams.get('direccion') || 'desc'
    
    const db = await getDatabase()
    
    // Query simplificada para evitar problemas de compatibilidad
    let areasQuery = `
      SELECT 
        COALESCE(area, area_investigacion, 'Sin especificar') as nombre,
        COALESCE(area, area_investigacion, 'Sin especificar') as area,
        COUNT(DISTINCT id) as investigadores,
        COUNT(DISTINCT CASE WHEN proyectos_investigacion IS NOT NULL AND proyectos_investigacion != '' THEN id END) as proyectos,
        COUNT(DISTINCT CASE WHEN articulos IS NOT NULL AND articulos != '' THEN id END) as publicaciones,
        COUNT(DISTINCT institucion) as instituciones
      FROM investigadores 
      WHERE (area IS NOT NULL AND area != '') 
         OR (area_investigacion IS NOT NULL AND area_investigacion != '')
    `
    
    const params: any[] = []
    
    // Agregar filtro de búsqueda
    if (search) {
      areasQuery += ` AND (
        LOWER(COALESCE(area, area_investigacion, 'Sin especificar')) LIKE ? OR
        LOWER(especialidad) LIKE ? OR
        LOWER(disciplina) LIKE ? OR
        LOWER(linea_investigacion) LIKE ?
      )`
      const searchParam = `%${search.toLowerCase()}%`
      params.push(searchParam, searchParam, searchParam, searchParam)
    }
    
    // Agregar filtro por institución
    if (institucion !== 'all') {
      areasQuery += ` AND LOWER(institucion) = ?`
      params.push(institucion.toLowerCase())
    }
    
    areasQuery += ` GROUP BY COALESCE(area, area_investigacion, 'Sin especificar')`
    
    // Agregar ordenamiento
    const ordenMap: { [key: string]: string } = {
      'investigadores': 'investigadores',
      'proyectos': 'proyectos', 
      'publicaciones': 'publicaciones',
      'instituciones': 'instituciones',
      'nombre': 'nombre'
    }
    
    const direccionSQL = direccion === 'asc' ? 'ASC' : 'DESC'
    areasQuery += ` ORDER BY ${ordenMap[orden] || 'investigadores'} ${direccionSQL}, nombre ASC`
    
    console.log('Ejecutando query:', areasQuery)
    console.log('Parámetros:', params)
    
    const areas = await db.query(areasQuery, params)
    console.log('Resultados obtenidos:', areas.length)
    
    // Obtener subcampos/especialidades por área
    const subcamposQuery = `
      SELECT 
        COALESCE(area, area_investigacion, 'Sin especificar') as area,
        GROUP_CONCAT(DISTINCT especialidad, ', ') as especialidades,
        GROUP_CONCAT(DISTINCT disciplina, ', ') as disciplinas,
        GROUP_CONCAT(DISTINCT linea_investigacion, ', ') as lineas_investigacion
      FROM investigadores 
      WHERE (area IS NOT NULL AND area != '') 
         OR (area_investigacion IS NOT NULL AND area_investigacion != '')
        AND (especialidad IS NOT NULL AND especialidad != '')
      GROUP BY COALESCE(area, area_investigacion, 'Sin especificar')
    `
    
    const subcampos = await db.query(subcamposQuery)
    
    // Crear mapa de subcampos por área
    const subcamposMap = new Map()
    subcampos.forEach((item: any) => {
      const especialidades = item.especialidades ? item.especialidades.split(', ').filter(Boolean) : []
      const disciplinas = item.disciplinas ? item.disciplinas.split(', ').filter(Boolean) : []
      const lineas = item.lineas_investigacion ? item.lineas_investigacion.split(', ').filter(Boolean) : []
      
      subcamposMap.set(item.area, {
        especialidades: [...new Set(especialidades)].slice(0, 4),
        disciplinas: [...new Set(disciplinas)].slice(0, 4),
        lineas: [...new Set(lineas)].slice(0, 4)
      })
    })
    
    // Formatear datos con estadísticas calculadas
    let camposFormateados = areas.map((area: any) => {
      const subcamposData = subcamposMap.get(area.area) || { especialidades: [], disciplinas: [], lineas: [] }
      
      // Calcular nivel de actividad basado en investigadores y proyectos
      const actividad = Math.min(100, Math.round((area.investigadores * 2 + area.proyectos * 3 + area.publicaciones * 1.5) / 2))
      
      // Generar slug
      const slug = area.area
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      // Asignar colores basados en el área
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
      const colorIndex = areas.indexOf(area) % colores.length
      
      return {
        id: areas.indexOf(area) + 1,
        nombre: area.nombre,
        descripcion: `Área de investigación con ${area.investigadores} investigadores activos en ${area.instituciones} instituciones`,
        investigadores: parseInt(area.investigadores) || 0,
        proyectos: parseInt(area.proyectos) || 0,
        publicaciones: parseInt(area.publicaciones) || 0,
        instituciones: parseInt(area.instituciones) || 0,
        crecimiento: actividad,
        tendencia: actividad > 70 ? "up" : actividad > 40 ? "stable" : "down",
        subcampos: subcamposData.especialidades.length > 0 
          ? subcamposData.especialidades 
          : subcamposData.disciplinas.length > 0 
            ? subcamposData.disciplinas 
            : subcamposData.lineas.slice(0, 4),
        color: colores[colorIndex],
        slug: slug,
        instituciones_lista: area.instituciones_lista,
        dias_promedio_registro: 0
      }
    })
    
    // Aplicar filtro por nivel de actividad
    if (actividad !== 'all') {
      camposFormateados = camposFormateados.filter(campo => {
        switch (actividad) {
          case 'alto':
            return campo.crecimiento >= 70
          case 'medio':
            return campo.crecimiento >= 40 && campo.crecimiento < 70
          case 'bajo':
            return campo.crecimiento < 40
          default:
            return true
        }
      })
    }
    
    // Obtener opciones de filtros
    const institucionesQuery = `
      SELECT DISTINCT institucion 
      FROM investigadores 
      WHERE institucion IS NOT NULL AND institucion != ''
      ORDER BY institucion
    `
    const instituciones = await db.query(institucionesQuery)
    
    // Estadísticas generales
    const totalInvestigadores = camposFormateados.reduce((sum, campo) => sum + campo.investigadores, 0)
    const totalProyectos = camposFormateados.reduce((sum, campo) => sum + campo.proyectos, 0)
    const totalPublicaciones = camposFormateados.reduce((sum, campo) => sum + campo.publicaciones, 0)
    
    return NextResponse.json({
      campos: camposFormateados,
      estadisticas: {
        totalCampos: camposFormateados.length,
        totalInvestigadores,
        totalProyectos,
        totalPublicaciones
      },
      filtros: {
        instituciones: instituciones.map((inst: any) => inst.institucion),
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
        search,
        institucion,
        actividad,
        orden,
        direccion
      }
    })
    
  } catch (error) {
    console.error("Error al obtener campos de investigación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
