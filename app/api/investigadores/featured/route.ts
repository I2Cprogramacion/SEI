import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Obtener 5 investigadores aleatorios con datos completos de PostgreSQL
    const investigadores = await sql`
      SELECT 
        id,
        nombre_completo as name,
        COALESCE(ultimo_grado_estudios, empleo_actual, 'Investigador') as title,
        COALESCE(institucion, 'Sin institución') as institution,
        COALESCE(area, area_investigacion, 'Sin especificar') as field,
        fotografia_url as avatar,
        slug
      FROM investigadores
      WHERE nombre_completo IS NOT NULL
        AND correo NOT LIKE '%admin%'
        AND slug IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 5
    `

    // Transformar datos al formato esperado
    const featured = investigadores.map(inv => ({
      id: inv.id,
      name: inv.name,
      title: inv.title,
      institution: inv.institution,
      field: inv.field,
      avatar: inv.avatar,
      slug: inv.slug
    }))

    return NextResponse.json(featured)
  } catch (error) {
    console.error("Error al obtener investigadores destacados:", error)
    return NextResponse.json(
      { error: "Error al cargar investigadores destacados" },
      { status: 500 }
    )
  }
}
