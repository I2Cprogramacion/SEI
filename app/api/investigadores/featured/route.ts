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
      WHERE correo NOT LIKE '%admin%'
      ORDER BY RANDOM()
      LIMIT 5
    `

    // Transformar datos al formato esperado
    const featured = investigadores.map(inv => ({
      id: inv.id,
      name: inv.name || 'Sin nombre',
      title: inv.title || 'Investigador',
      institution: inv.institution || 'Sin institución',
      field: inv.field || 'Sin área',
      avatar: inv.avatar || null,
      slug: inv.slug || `investigador-${inv.id}`
    }))

    return NextResponse.json(featured)
  } catch (error) {
    return NextResponse.json(
      { error: "Error al cargar investigadores destacados" },
      { status: 500 }
    )
  }
}
