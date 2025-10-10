import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const db = await getDatabase()
    
    // Primero obtener el investigador actual
    const investigador = await db.query(
      `SELECT id, area, area_investigacion, linea_investigacion 
       FROM investigadores 
       WHERE slug = $1 OR 
             LOWER(REPLACE(REPLACE(nombre_completo, ' ', '-'), '.', '')) = $1`,
      [slug.toLowerCase()]
    )

    if (!investigador || investigador.length === 0) {
      return NextResponse.json({ error: "Investigador no encontrado" }, { status: 404 })
    }

    const invActual = investigador[0]
    
    // Buscar investigadores relacionados por área o línea de investigación
    const relacionados = await db.query(
      `SELECT 
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
      WHERE id != $1
        AND (
          area = $2 OR 
          area_investigacion = $3 OR
          LOWER(linea_investigacion) LIKE $4
        )
      LIMIT 6`,
      [
        invActual.id,
        invActual.area || '',
        invActual.area_investigacion || '',
        `%${(invActual.linea_investigacion || '').toLowerCase().split(' ').slice(0, 3).join('%')}%`
      ]
    )

    // Transformar los datos para enviar al frontend
    const investigadoresRelacionados = relacionados.map((inv: any) => ({
      id: inv.id,
      name: inv.nombre_completo,
      email: inv.correo,
      institution: inv.institucion,
      area: inv.area || inv.area_investigacion,
      lineaInvestigacion: inv.linea_investigacion,
      fotografiaUrl: inv.fotografia_url,
      title: inv.ultimo_grado_estudios,
      slug: inv.slug || inv.nombre_completo?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() || `investigador-${inv.id}`
    }))

    return NextResponse.json(investigadoresRelacionados)
  } catch (error) {
    console.error("Error al obtener investigadores relacionados:", error)
    return NextResponse.json(
      { error: "Error al obtener investigadores relacionados" },
      { status: 500 }
    )
  }
}
