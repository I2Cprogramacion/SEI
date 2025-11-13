import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '4')

    // Intentar obtener desde la tabla institutions primero
    let institucionesDestacadas: any[] = []
    
    try {
      const institutionsQuery = `
        SELECT 
          i.id,
          i.nombre,
          i.areas_investigacion,
          COUNT(DISTINCT inv.id) as investigadores,
          COUNT(DISTINCT CASE 
            WHEN inv.proyectos_investigacion IS NOT NULL 
              AND inv.proyectos_investigacion != '' 
              AND trim(inv.proyectos_investigacion) != '' 
            THEN inv.id 
          END) as proyectos
        FROM institutions i
        LEFT JOIN investigadores inv ON LOWER(TRIM(inv.institucion)) = LOWER(TRIM(i.nombre))
        WHERE i.activo IS NOT FALSE
        GROUP BY i.id, i.nombre, i.areas_investigacion
        HAVING COUNT(DISTINCT inv.id) > 0
        ORDER BY investigadores DESC, proyectos DESC
        LIMIT $1
      `
      
      const institutionsResult = await db.query(institutionsQuery, [limit])
      const institutionsRows = Array.isArray(institutionsResult) 
        ? institutionsResult 
        : institutionsResult.rows

      // Obtener áreas para cada institución desde investigadores
      const institucionesConAreas = await Promise.all(
        institutionsRows.map(async (row: any) => {
          // Parsear áreas de investigación si es JSON
          let areas: string[] = []
          try {
            if (row.areas_investigacion) {
              if (typeof row.areas_investigacion === 'string') {
                const parsed = JSON.parse(row.areas_investigacion)
                areas = Array.isArray(parsed) ? parsed : []
              } else if (Array.isArray(row.areas_investigacion)) {
                areas = row.areas_investigacion
              }
            }
          } catch (e) {
            // Si no es JSON, intentar como string simple
            areas = row.areas_investigacion ? [row.areas_investigacion] : []
          }

          // Si no hay áreas desde la tabla, obtenerlas desde investigadores
          if (areas.length === 0) {
            try {
              const areasQuery = `
                SELECT DISTINCT COALESCE(area_investigacion, area) as area
                FROM investigadores
                WHERE LOWER(TRIM(institucion)) = LOWER(TRIM($1))
                  AND (area_investigacion IS NOT NULL OR area IS NOT NULL)
                  AND COALESCE(area_investigacion, area) != ''
                LIMIT 5
              `
              const areasResult = await db.query(areasQuery, [row.nombre])
              const areasRows = Array.isArray(areasResult) ? areasResult : areasResult.rows
              areas = areasRows.map((a: any) => a.area).filter(Boolean)
            } catch (e) {
              console.log("Error obteniendo áreas para institución:", e)
            }
          }

          return {
            nombre: row.nombre || 'Sin nombre',
            investigadores: parseInt(String(row.investigadores)) || 0,
            proyectos: parseInt(String(row.proyectos)) || 0,
            areas: areas.slice(0, 5) // Limitar a 5 áreas
          }
        })
      )

      institucionesDestacadas = institucionesConAreas

    } catch (error) {
      // Si falla, obtener desde investigadores directamente
      console.log("Obteniendo instituciones desde investigadores:", error)
      
      const invQuery = `
        SELECT 
          institucion as nombre,
          COUNT(DISTINCT id) as investigadores,
          COUNT(DISTINCT CASE 
            WHEN proyectos_investigacion IS NOT NULL 
              AND proyectos_investigacion != '' 
              AND trim(proyectos_investigacion) != '' 
            THEN id 
          END) as proyectos,
          ARRAY_AGG(DISTINCT COALESCE(area_investigacion, area)) FILTER (
            WHERE COALESCE(area_investigacion, area) IS NOT NULL 
              AND COALESCE(area_investigacion, area) != ''
          ) as areas
        FROM investigadores
        WHERE activo IS NOT FALSE
          AND nombre_completo IS NOT NULL
          AND nombre_completo != ''
          AND institucion IS NOT NULL
          AND institucion != ''
          AND trim(institucion) != ''
        GROUP BY institucion
        HAVING COUNT(DISTINCT id) > 0
        ORDER BY investigadores DESC, proyectos DESC
        LIMIT $1
      `

      const invResult = await db.query(invQuery, [limit])
      const invRows = Array.isArray(invResult) ? invResult : invResult.rows

      institucionesDestacadas = invRows.map((row: any) => {
        let areas: string[] = []
        if (row.areas && Array.isArray(row.areas)) {
          areas = row.areas.filter((a: any) => a && a.trim() !== '')
        }

        return {
          nombre: row.nombre || 'Sin nombre',
          investigadores: parseInt(String(row.investigadores)) || 0,
          proyectos: parseInt(String(row.proyectos)) || 0,
          areas: areas.slice(0, 5) // Limitar a 5 áreas
        }
      })
    }

    return NextResponse.json(institucionesDestacadas)

  } catch (error) {
    console.error("Error al obtener instituciones destacadas:", error)
    return NextResponse.json(
      [],
      { status: 500 }
    )
  }
}

