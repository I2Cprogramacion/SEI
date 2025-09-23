import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Por ahora, devolver array vacío ya que no hay convocatorias reales
    // En el futuro, esto podría conectarse a una base de datos de convocatorias
    const convocatorias: any[] = []
    
    return NextResponse.json({ convocatorias })
  } catch (error) {
    console.error("Error al obtener convocatorias:", error)
    return NextResponse.json({ 
      convocatorias: [],
      error: "Error al obtener las convocatorias" 
    }, { status: 500 })
  }
}
