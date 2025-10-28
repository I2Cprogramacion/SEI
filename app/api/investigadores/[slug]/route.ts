import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: "Slug es requerido" },
        { status: 400 }
      )
    }

    // Buscar por slug primero (todos los campos)
    let result = await sql`SELECT * FROM investigadores WHERE slug = ${slug} LIMIT 1`;
    // Si no se encontró por slug, intentar por id si el slug es tipo investigador-{id}
    if (result.length === 0 && slug.startsWith('investigador-')) {
      const idStr = slug.replace('investigador-', '');
      const id = parseInt(idStr);
      if (!isNaN(id)) {
        result = await sql`SELECT * FROM investigadores WHERE id = ${id} LIMIT 1`;
      }
    }
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Investigador no encontrado" },
        { status: 404 }
      )
    }
    // Retornar todos los campos tal cual
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

