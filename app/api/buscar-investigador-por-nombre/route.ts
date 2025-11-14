import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

/**
 * API para buscar investigadores por nombre
 * Usado para asociar autores de publicaciones con perfiles de investigadores
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nombre = searchParams.get('nombre')
    
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json({ investigadores: [] })
    }

    const db = await getDatabase()
    
    // Búsqueda flexible: por nombre completo o partes del nombre
    const nombreBusqueda = `%${nombre.trim()}%`
    
    const query = `
      SELECT 
        id,
        clerk_user_id,
        nombre_completo,
        correo,
        slug,
        fotografia_url,
        institucion,
        nivel_investigador
      FROM investigadores
      WHERE 
        nombre_completo ILIKE $1
        AND activo = true
      ORDER BY 
        CASE 
          WHEN LOWER(nombre_completo) = LOWER($2) THEN 1
          WHEN LOWER(nombre_completo) LIKE LOWER($2) || '%' THEN 2
          ELSE 3
        END,
        nombre_completo
      LIMIT 10
    `
    
    const result = await db.query(query, [nombreBusqueda, nombre.trim()])
    const investigadores = Array.isArray(result) ? result : result.rows || []
    
    console.log(`🔍 [Buscar Investigador] Búsqueda: "${nombre}" → ${investigadores.length} resultados`)
    
    return NextResponse.json({ 
      investigadores: investigadores.map((inv: any) => ({
        id: inv.id,
        clerkUserId: inv.clerk_user_id,
        nombreCompleto: inv.nombre_completo,
        correo: inv.correo,
        slug: inv.slug,
        fotografiaUrl: inv.fotografia_url,
        institucion: inv.institucion,
        nivelInvestigador: inv.nivel_investigador
      }))
    })
  } catch (error) {
    console.error('❌ [Buscar Investigador] Error:', error)
    return NextResponse.json({ investigadores: [] })
  }
}
