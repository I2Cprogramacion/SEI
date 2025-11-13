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
    
    try {
      if (!query || query.length < 2) {
        // Si no hay query, mostrar todos los investigadores (limitados)
        const allInvestigadores = await db.obtenerInvestigadores();
        console.log(`[SEARCH API] Total investigadores obtenidos: ${allInvestigadores.length}`)
        
        // Filtrar solo los que tienen nombre_completo (más permisivo con activo)
        investigadores = allInvestigadores
          .filter((inv: any) => {
            const tieneNombre = inv.nombre_completo && inv.nombre_completo.trim() !== ''
            // Solo excluir si activo es explícitamente false, permitir undefined/null/true
            const estaActivo = inv.activo !== false
            return tieneNombre && estaActivo
          })
          .slice(0, limit || 50) // Limitar a 50 por defecto si no hay query
        
        console.log(`[SEARCH API] Investigadores después del filtro: ${investigadores.length}`)
      } else {
        // Buscar investigadores por nombre, email o institución
        investigadores = await db.buscarInvestigadores({
          termino: query,
          limite: limit
        });
        console.log(`[SEARCH API] Búsqueda con término "${query}": ${investigadores.length} resultados`)
      }
    } catch (error) {
      console.error("Error en búsqueda de investigadores:", error)
      return NextResponse.json(
        { error: "Error al buscar investigadores", detalles: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }

    // Formatear respuesta
    const resultados = investigadores.map((inv: any) => {
      // Generar slug si no existe
      let slug = inv.slug
      if (!slug || slug.trim() === '') {
        const nombreCompleto = inv.nombre_completo || inv.nombre || inv.nombreCompleto || 'investigador'
        const nombreSlug = nombreCompleto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
        slug = `${nombreSlug}-${inv.id}`
      }

      return {
        id: inv.id,
        nombre: inv.nombre_completo || inv.nombre || inv.nombreCompleto || 'Sin nombre',
        email: inv.correo || inv.email || '',
        institucion: inv.institucion || 'Sin institución',
        area: inv.area_investigacion || inv.area || 'Sin área',
        slug: slug
      }
    })

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
