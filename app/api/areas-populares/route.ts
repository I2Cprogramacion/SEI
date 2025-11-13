import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

const colors = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
  "bg-yellow-100 text-yellow-800",
  "bg-red-100 text-red-800",
]

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '6')

    // Obtener áreas de investigación con conteos
    const areasQuery = `
      SELECT 
        COALESCE(area_investigacion, area, 'Sin especificar') as nombre,
        COUNT(DISTINCT id) as investigadores,
        COUNT(DISTINCT CASE 
          WHEN proyectos_investigacion IS NOT NULL 
            AND proyectos_investigacion != '' 
            AND trim(proyectos_investigacion) != '' 
          THEN id 
        END) as proyectos
      FROM investigadores
      WHERE activo IS NOT FALSE
        AND nombre_completo IS NOT NULL
        AND nombre_completo != ''
        AND (
          (area_investigacion IS NOT NULL AND area_investigacion != '' AND trim(area_investigacion) != '')
          OR (area IS NOT NULL AND area != '' AND trim(area) != '')
        )
      GROUP BY COALESCE(area_investigacion, area, 'Sin especificar')
      HAVING COUNT(DISTINCT id) > 0
      ORDER BY investigadores DESC, proyectos DESC
      LIMIT $1
    `

    const areasResult = await db.query(areasQuery, [limit])
    const areasRows = Array.isArray(areasResult) ? areasResult : areasResult.rows

    const areasPopulares = areasRows.map((row: any, index: number) => ({
      nombre: row.nombre || 'Sin especificar',
      investigadores: parseInt(String(row.investigadores)) || 0,
      proyectos: parseInt(String(row.proyectos)) || 0,
      color: colors[index % colors.length]
    }))

    return NextResponse.json(areasPopulares)

  } catch (error) {
    console.error("Error al obtener áreas populares:", error)
    return NextResponse.json(
      [],
      { status: 500 }
    )
  }
}

