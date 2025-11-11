import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Por ahora, devolver array vacío hasta que se configure la base de datos correctamente
    return NextResponse.json([])
  } catch (error) {
    console.error("Error al obtener proyectos recientes:", error)
    return NextResponse.json(
      { error: "Error al cargar proyectos recientes" },
      { status: 500 }
    )
  }
}
