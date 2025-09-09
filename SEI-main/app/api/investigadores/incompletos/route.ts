import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los investigadores
    const investigadores = await obtenerInvestigadores()

    // Filtrar investigadores con CURP no detectado o vacío
    const investigadoresIncompletos = investigadores.filter(inv => 
      !inv.curp || inv.curp === '' || inv.curp === 'NO DETECTADO'
    )

    return NextResponse.json(investigadoresIncompletos)
  } catch (error) {
    console.error("Error al obtener investigadores incompletos:", error)
    return NextResponse.json({ error: "Error al obtener los investigadores incompletos" }, { status: 500 })
  }
}
