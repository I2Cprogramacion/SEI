import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Por ahora, devolver array vacío hasta que se configure la base de datos correctamente
    return NextResponse.json([])
  } catch (error) {
    console.error("Error al obtener investigadores destacados:", error)
    return NextResponse.json(
      { error: "Error al cargar investigadores destacados" },
      { status: 500 }
    )
  }
}
