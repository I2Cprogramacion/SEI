import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

export const dynamic = 'force-dynamic'

// GET /api/investigadores/conexiones
// Obtiene los investigadores con los que el usuario actual tiene conexión aceptada
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado", investigadores: [] },
        { status: 401 }
      )
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    if (!userEmail) {
      return NextResponse.json(
        { error: "Email no disponible", investigadores: [] },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    // Buscar el ID del investigador actual por email
    let investigadorActual
    try {
      investigadorActual = await sql`
        SELECT id FROM investigadores WHERE correo = ${userEmail} LIMIT 1
      `
    } catch (dbError) {
      console.log(`[CONEXIONES API] Error buscando investigador actual:`, dbError)
      // Permitir búsqueda sin usuario registrado
      investigadorActual = { rows: [] }
    }

    const miId = investigadorActual.rows[0]?.id || 0
    console.log(`[CONEXIONES API] miId = ${miId}`)

    // Obtener investigadores (todos registrados y activos)
    let investigadoresConectados
    
    try {
      if (query && query.length >= 2) {
        // Búsqueda con filtro de nombre - buscar entre TODOS los investigadores
        const searchPattern = `%${query}%`
        investigadoresConectados = await sql`
          SELECT DISTINCT 
            i.id,
            i.nombre_completo,
            i.correo,
            i.fotografia_url,
            i.slug
          FROM investigadores i
          WHERE (${miId} = 0 OR i.id != ${miId})
            AND i.activo IS NOT FALSE
            AND (
              LOWER(i.nombre_completo) LIKE LOWER(${searchPattern})
              OR LOWER(i.correo) LIKE LOWER(${searchPattern})
            )
          ORDER BY i.nombre_completo ASC
          LIMIT ${limit}
        `
      } else {
        // Sin filtro, obtener todos los investigadores activos
        investigadoresConectados = await sql`
          SELECT DISTINCT 
            i.id,
            i.nombre_completo,
            i.correo,
            i.fotografia_url,
            i.slug
          FROM investigadores i
          WHERE (${miId} = 0 OR i.id != ${miId})
            AND i.activo IS NOT FALSE
          ORDER BY i.nombre_completo ASC
          LIMIT ${limit}
        `
      }
    } catch (searchError) {
      console.error("[CONEXIONES API] Error en búsqueda SQL:", searchError)
      // No relanzar el error - devolver lista vacía con error específico
      console.log("[CONEXIONES API] Devolviendo lista vacía por error de búsqueda")
      return NextResponse.json({
        investigadores: [],
        total: 0,
        error: "Error en la búsqueda - intenta de nuevo"
      }, { status: 200 })
    }

    console.log(`[CONEXIONES API] Investigadores encontrados: ${investigadoresConectados.rows.length}`)

    // Formatear respuesta
    const resultados = investigadoresConectados.rows.map((inv: any) => {
      // Generar slug si no existe
      let slug = inv.slug
      if (!slug || slug.trim() === '') {
        const nombreCompleto = inv.nombre_completo || 'investigador'
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
        nombre: inv.nombre_completo || 'Sin nombre',
        email: inv.correo || '',
        foto: inv.fotografia_url || null,
        slug: slug
      }
    })

    return NextResponse.json({ 
      investigadores: resultados,
      total: resultados.length
    })

  } catch (error) {
    console.error("[CONEXIONES API ERROR]:", error)
    return NextResponse.json(
      { 
        error: "Error al obtener conexiones", 
        details: error instanceof Error ? error.message : String(error),
        investigadores: []
      },
      { status: 500 }
    )
  }
}

