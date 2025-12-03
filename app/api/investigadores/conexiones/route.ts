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
    const investigadorActual = await sql`
      SELECT id FROM investigadores WHERE correo = ${userEmail} LIMIT 1
    `

    if (investigadorActual.rows.length === 0) {
      console.log(`[CONEXIONES API] Usuario no encontrado en BD: ${userEmail}`)
      return NextResponse.json({ 
        investigadores: [],
        total: 0,
        mensaje: "No se encontró tu perfil de investigador. Por favor completa tu registro."
      })
    }

    const miId = investigadorActual.rows[0].id
    console.log(`[CONEXIONES API] Usuario ID: ${miId}, Email: ${userEmail}`)

    // Obtener investigadores conectados (conexiones aceptadas en ambas direcciones)
    let investigadoresConectados
    
    if (query && query.length >= 2) {
      // Búsqueda con filtro de nombre
      const searchPattern = `%${query}%`
      investigadoresConectados = await sql`
        SELECT DISTINCT 
          i.id,
          i.nombre_completo,
          i.correo,
          i.institucion,
          i.area_investigacion,
          i.slug
        FROM investigadores i
        INNER JOIN conexiones c ON (
          (c.investigador_id = ${miId} AND c.investigador_destino_id = i.id)
          OR 
          (c.investigador_destino_id = ${miId} AND c.investigador_id = i.id)
        )
        WHERE c.estado = 'aceptada'
          AND i.id != ${miId}
          AND i.activo != false
          AND (
            LOWER(i.nombre_completo) LIKE LOWER(${searchPattern})
            OR LOWER(i.correo) LIKE LOWER(${searchPattern})
            OR LOWER(i.institucion) LIKE LOWER(${searchPattern})
          )
        ORDER BY i.nombre_completo ASC
        LIMIT ${limit}
      `
    } else {
      // Sin filtro, obtener todos los conectados
      investigadoresConectados = await sql`
        SELECT DISTINCT 
          i.id,
          i.nombre_completo,
          i.correo,
          i.institucion,
          i.area_investigacion,
          i.slug
        FROM investigadores i
        INNER JOIN conexiones c ON (
          (c.investigador_id = ${miId} AND c.investigador_destino_id = i.id)
          OR 
          (c.investigador_destino_id = ${miId} AND c.investigador_id = i.id)
        )
        WHERE c.estado = 'aceptada'
          AND i.id != ${miId}
          AND i.activo != false
        ORDER BY i.nombre_completo ASC
        LIMIT ${limit}
      `
    }

    console.log(`[CONEXIONES API] Conexiones encontradas: ${investigadoresConectados.rows.length}`)

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
        institucion: inv.institucion || 'Sin institución',
        area: inv.area_investigacion || 'Sin área',
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

