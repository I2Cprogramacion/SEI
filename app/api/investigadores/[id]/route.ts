import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadorPorId } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de investigador inválido" }, { status: 400 })
    }

    // Obtener el investigador por ID
    const investigador = await obtenerInvestigadorPorId(id)

    if (!investigador) {
      return NextResponse.json({ error: "Investigador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(investigador)
  } catch (error) {
    console.error(`Error al obtener investigador con ID ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener el investigador" }, { status: 500 })
  }
}
