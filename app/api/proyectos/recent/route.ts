import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Obtener 5 proyectos más recientes de PostgreSQL
    const proyectos = await sql`
      SELECT 
        id,
        titulo as title,
        COALESCE(estado, 'Activo') as status,
        COALESCE(categoria, area_investigacion, 'Investigación') as category,
        TO_CHAR(COALESCE(fecha_inicio, fecha_registro), 'Mon YYYY') as "startDate",
        COALESCE(slug, LOWER(REGEXP_REPLACE(titulo, '[^a-zA-Z0-9\\s]', '', 'g'))) as slug
      FROM proyectos
      WHERE titulo IS NOT NULL
      ORDER BY COALESCE(fecha_inicio, fecha_registro) DESC
      LIMIT 5
    `

    // Transformar datos al formato esperado
    const recent = proyectos.map(proy => ({
      id: proy.id,
      title: proy.title,
      status: proy.status,
      category: proy.category,
      startDate: proy.startDate || 'Fecha no disponible',
      slug: proy.slug
    }))

    return NextResponse.json(recent)
  } catch (error) {
    console.error("Error al obtener proyectos recientes:", error)
    return NextResponse.json(
      { error: "Error al cargar proyectos recientes" },
      { status: 500 }
    )
  }
}
