import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const db = await getDatabase()
    const results = []

    // Buscar investigadores
    try {
      const investigadoresQuery = `
        SELECT 
          id,
          nombre_completo as title,
          area as description,
          'investigador' as type,
          CONCAT('/investigadores/', slug) as href
        FROM investigadores 
        WHERE LOWER(nombre_completo) LIKE ? 
           OR LOWER(area) LIKE ? 
           OR LOWER(especialidad) LIKE ?
        LIMIT 5
      `
      const investigadores = await db.query(investigadoresQuery, [
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`,
        `%${query.toLowerCase()}%`
      ])
      
      investigadores.forEach((inv: any) => {
        results.push({
          id: `inv-${inv.id}`,
          title: inv.title,
          description: inv.description || 'Investigador',
          type: 'investigador',
          href: inv.href
        })
      })
    } catch (error) {
      console.log('Error buscando investigadores:', error)
    }

    // Buscar proyectos (datos de ejemplo por ahora)
    try {
      const proyectosEjemplo = [
        {
          id: 'proj-1',
          title: 'Inteligencia Artificial en Salud',
          description: 'Proyecto de investigación en IA médica',
          type: 'proyecto',
          href: '/proyectos/ia-salud'
        },
        {
          id: 'proj-2', 
          title: 'Energías Renovables',
          description: 'Desarrollo de tecnologías solares',
          type: 'proyecto',
          href: '/proyectos/energias-renovables'
        }
      ]
      
      const proyectosFiltrados = proyectosEjemplo.filter(proj => 
        proj.title.toLowerCase().includes(query.toLowerCase()) ||
        proj.description.toLowerCase().includes(query.toLowerCase())
      )
      
      results.push(...proyectosFiltrados)
    } catch (error) {
      console.log('Error buscando proyectos:', error)
    }

    // Buscar instituciones
    try {
      const institucionesQuery = `
        SELECT DISTINCT institucion as title
        FROM investigadores 
        WHERE LOWER(institucion) LIKE ?
        LIMIT 3
      `
      const instituciones = await db.query(institucionesQuery, [`%${query.toLowerCase()}%`])
      
      instituciones.forEach((inst: any, index: number) => {
        results.push({
          id: `inst-${index}`,
          title: inst.title,
          description: 'Institución de investigación',
          type: 'institucion',
          href: '/instituciones'
        })
      })
    } catch (error) {
      console.log('Error buscando instituciones:', error)
    }

    return NextResponse.json({ 
      results: results.slice(0, 10), // Limitar a 10 resultados
      query 
    })
    
  } catch (error) {
    console.error("Error en búsqueda global:", error)
    return NextResponse.json(
      { 
        error: "Error en búsqueda", 
        results: []
      },
      { status: 500 }
    )
  }
}