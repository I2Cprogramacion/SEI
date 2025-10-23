import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const area = searchParams.get('area') || 'all'
    const institucion = searchParams.get('institucion') || 'all'
    const ubicacion = searchParams.get('ubicacion') || 'all'

    // Por ahora, devolver arrays vacíos hasta que se configure la base de datos correctamente
    return NextResponse.json({
      investigadores: [],
      filtros: {
        areas: [],
        instituciones: [],
        ubicaciones: []
      }
    })

  } catch (error) {
    console.error("Error al obtener investigadores:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}