import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    const db = await getDatabase()
    let investigadores: any[] = [];
    if (!query || query.length < 2) {
      // Si no hay query, mostrar todos los investigadores
      investigadores = await db.obtenerInvestigadores();
    } else {
      // Buscar investigadores por nombre, email o institución
      investigadores = await db.buscarInvestigadores({
        termino: query,
        limite: limit
      });
    }

    // Formatear respuesta
  const resultados = investigadores.map((inv: any) => ({
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
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
