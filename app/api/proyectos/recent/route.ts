import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Obtener los 6 proyectos más recientes
    const query = `
      SELECT
        id,
        titulo,
        estado,
        categoria,
        fecha_inicio,
        COALESCE(slug, '') as slug
      FROM proyectos
      ORDER BY fecha_creacion DESC
      LIMIT 6
    `

    const rows = await db.query(query, [])
    
    // Si no hay resultados, devolver array vacío
    if (!rows || rows.length === 0) {
      return NextResponse.json([])
    }

    // Formatear los datos según lo que espera el componente
    const proyectos = rows.map((row: any) => {
      // Formatear la fecha de inicio
      let startDate = 'Sin fecha'
      if (row.fecha_inicio) {
        try {
          const date = new Date(row.fecha_inicio)
          if (!isNaN(date.getTime())) {
            startDate = date.toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }
        } catch (e) {
          // Si falla el formateo, usar la fecha original como string
          startDate = String(row.fecha_inicio)
        }
      }

      return {
        id: row.id,
        title: row.titulo || 'Sin título',
        status: row.estado || 'Sin estado',
        category: row.categoria || 'Sin categoría',
        startDate: startDate,
        slug: row.slug || ''
      }
    })

    return NextResponse.json(proyectos)
  } catch (error: any) {
    console.error("Error al obtener proyectos recientes:", error)
    console.error("Detalles del error:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    })
    return NextResponse.json(
      { 
        error: "Error al cargar proyectos recientes",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
