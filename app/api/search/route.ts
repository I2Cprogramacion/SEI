import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

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

    const db = await getDatabase()
    
    // Construir query dinámico con filtros
    let whereConditions = []
    let queryParams: any[] = []
    let paramIndex = 1

    // Condición de búsqueda general
    const searchPattern = `%${query.toLowerCase()}%`
    whereConditions.push(`(
      LOWER(nombre_completo) LIKE $${paramIndex} OR
      LOWER(area) LIKE $${paramIndex + 1} OR
      LOWER(area_investigacion) LIKE $${paramIndex + 2} OR
      LOWER(linea_investigacion) LIKE $${paramIndex + 3} OR
      LOWER(institucion) LIKE $${paramIndex + 4}
    )`)
    queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
    paramIndex += 5

    // Filtro por área
    if (areaFilter !== 'all') {
      whereConditions.push(`(area = $${paramIndex} OR area_investigacion = $${paramIndex})`)
      queryParams.push(areaFilter)
      paramIndex++
    }

    // Filtro por institución
    if (institucionFilter !== 'all') {
      whereConditions.push(`institucion = $${paramIndex}`)
      queryParams.push(institucionFilter)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Buscar investigadores con filtros
    const investigadoresQuery = `
      SELECT 
        id,
        nombre_completo,
        correo,
        institucion,
        area,
        area_investigacion,
        linea_investigacion,
        fotografia_url,
        ultimo_grado_estudios,
        slug
      FROM investigadores 
      ${whereClause}
      ORDER BY nombre_completo ASC
      LIMIT 50
    `
    
    const investigadores = await db.query(investigadoresQuery, queryParams)

    // Transformar investigadores al formato esperado
    const investigadoresFormateados = investigadores.map((inv: any) => ({
      id: inv.id,
      nombre: inv.nombre_completo,
      email: inv.correo,
      institucion: inv.institucion || 'Institución no especificada',
      area: inv.area || inv.area_investigacion || 'Investigación',
      lineaInvestigacion: inv.linea_investigacion,
      fotografiaUrl: inv.fotografia_url,
      ultimoGradoEstudios: inv.ultimo_grado_estudios,
      slug: inv.slug || inv.nombre_completo?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() || `investigador-${inv.id}`,
      keywords: [inv.area, inv.area_investigacion].filter(Boolean)
    }))

    // Buscar proyectos (extraer de los campos de investigadores)
    let proyectos: any[] = []
    try {
      const proyectosData = await db.query(`
        SELECT id, nombre_completo, proyectos_investigacion, area, institucion
        FROM investigadores 
        WHERE proyectos_investigacion IS NOT NULL AND proyectos_investigacion != ''
      `)

      proyectosData.forEach(inv => {
        if (inv.proyectos_investigacion) {
          const proyectosTexto = inv.proyectos_investigacion.split('\n').filter((p: string) => p.trim())
          proyectosTexto.forEach((proyectoTexto: string, index: number) => {
            if (proyectoTexto.toLowerCase().includes(query.toLowerCase())) {
              proyectos.push({
                id: `${inv.id}_proyecto_${index}`,
                titulo: proyectoTexto.trim(),
                investigador: inv.nombre_completo,
                institucion: inv.institucion || 'Institución no especificada',
                area: inv.area || 'Investigación',
                slug: `proyecto-${inv.id}-${index}`,
                keywords: [inv.area].filter(Boolean)
              })
            }
          })
        }
      })
    } catch (error) {
      console.error("Error al buscar proyectos:", error)
    }

    // Buscar publicaciones
    let publicaciones: any[] = []
    try {
      const publicacionesData = await db.query(`
        SELECT id, titulo, autor, institucion, editorial, año_creacion, doi, resumen, palabras_clave, categoria, tipo
        FROM publicaciones 
        WHERE (
          LOWER(titulo) LIKE ? OR 
          LOWER(autor) LIKE ? OR 
          LOWER(institucion) LIKE ? OR
          LOWER(editorial) LIKE ? OR
          LOWER(resumen) LIKE ? OR
          LOWER(palabras_clave) LIKE ? OR
          LOWER(categoria) LIKE ? OR
          LOWER(tipo) LIKE ? OR
          LOWER(doi) LIKE ?
        )
        ORDER BY titulo ASC
        LIMIT 50
      `, [
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`
      ])

      publicaciones = publicacionesData.map(pub => ({
        id: pub.id,
        titulo: pub.titulo,
        investigador: pub.autor,
        institucion: pub.institucion || 'Institución no especificada',
        area: pub.categoria || 'Publicación',
        slug: `publicacion-${pub.id}`,
        keywords: ['Publicación', pub.categoria, pub.tipo, pub.doi].filter(Boolean)
      }))
    } catch (error) {
      console.error("Error al buscar publicaciones:", error)
    }

    // Combinar proyectos y publicaciones
    const todosProyectos = [...proyectos, ...publicaciones]

    // Filtrar resultados según el tipo
    let resultado = {
      investigadores: type === 'all' || type === 'investigadores' ? investigadoresFormateados : [],
      proyectos: type === 'all' || type === 'proyectos' || type === 'publicaciones' ? todosProyectos : [],
      total: 0
    }

    resultado.total = resultado.investigadores.length + resultado.proyectos.length

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error al buscar:", error)
    return NextResponse.json({ 
      investigadores: [], 
      proyectos: [], 
      total: 0,
      error: "Error al realizar la búsqueda" 
    }, { status: 500 })
  }
}
