import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({ investigadores: [] })
    }

    const db = await getDatabase()
    
    // Buscar investigadores por nombre, email o institución
    const investigadores = await db.buscarInvestigadores({
      termino: query,
      limite: limit
    })

    // Formatear respuesta
    const resultados = investigadores.map(inv => ({
      id: inv.id,
      nombre: inv.nombre || inv.nombreCompleto || 'Sin nombre',
      email: inv.email,
      institucion: inv.institucion || 'Sin institución',
      area: inv.area || 'Sin área'
    }))

    return NextResponse.json({ 
      investigadores: resultados,
      total: resultados.length
    })

  } catch (error) {
    console.error("Error en búsqueda de investigadores:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
