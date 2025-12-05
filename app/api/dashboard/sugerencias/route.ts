import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

// Forzar rendering dinámico (usa Clerk auth)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Cache de sugerencias por 1 hora
export const revalidate = 3600

export async function GET(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json({ error: "No se pudo obtener el email del usuario" }, { status: 400 })
    }
    
    // Obtener datos del investigador actual
    const miPerfil = await sql`
      SELECT id, area_investigacion, linea_investigacion 
      FROM investigadores 
      WHERE correo = ${email}
    `

    if (!miPerfil || miPerfil.rows.length === 0 || !miPerfil.rows[0]) {
      console.log(`⚠️ No hay perfil de investigador para sugerencias`)
      return NextResponse.json([]) // Retornar array vacío en lugar de error
    }

    const perfil = miPerfil.rows[0]
    
    // Extraer palabras clave de la línea de investigación
    const palabrasClave = (perfil.linea_investigacion || '')
      .toLowerCase()
      .split(' ')
      .filter((p: string) => p.length > 3)
      .slice(0, 3)
    
    const patronBusqueda = palabrasClave.length > 0 
      ? `%${palabrasClave.join('%')}%` 
      : '%'
    
    // Buscar investigadores relacionados con sistema de scoring
    // Excluir conexiones ya establecidas y solicitudes pendientes
    const sugerencias = await sql`
      WITH conexiones_existentes AS (
        SELECT 
          CASE 
            WHEN investigador_id = ${perfil.id} THEN conectado_con_id
            ELSE investigador_id
          END as id_conexion
        FROM conexiones
        WHERE (investigador_id = ${perfil.id} OR conectado_con_id = ${perfil.id})
          AND estado IN ('aceptada', 'pendiente')
      )
      SELECT 
        id,
        nombre_completo,
        correo,
        institucion,
        area_investigacion,
        linea_investigacion,
        ultimo_grado_estudios,
        fotografia_url,
        (
          CASE WHEN area_investigacion = ${perfil.area_investigacion || ''} THEN 10 ELSE 0 END +
          CASE WHEN LOWER(linea_investigacion) LIKE ${patronBusqueda} THEN 8 ELSE 0 END +
          CASE WHEN ultimo_grado_estudios ILIKE '%doctorado%' THEN 3 ELSE 0 END
        ) as relevancia_score
      FROM investigadores 
      WHERE id != ${perfil.id}
        AND id NOT IN (SELECT id_conexion FROM conexiones_existentes)
        AND (
          area_investigacion = ${perfil.area_investigacion || ''} OR 
          LOWER(linea_investigacion) LIKE ${patronBusqueda}
        )
      ORDER BY relevancia_score DESC, RANDOM()
      LIMIT 6
    `

    // Transformar los datos
    const sugerenciasFormateadas = sugerencias.rows.map((inv: any) => ({
      id: inv.id,
      name: inv.nombre_completo,
      email: inv.correo,
      institution: inv.institucion,
      area: inv.area_investigacion,
      lineaInvestigacion: inv.linea_investigacion,
      fotografiaUrl: inv.fotografia_url || null,
      title: inv.ultimo_grado_estudios,
      slug: inv.nombre_completo?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() || `investigador-${inv.id}`,
      razonSugerencia: inv.area_investigacion === perfil.area_investigacion ? 'Área similar' : 'Intereses relacionados',
      relevanciaScore: inv.relevancia_score || 0
    }))

    return NextResponse.json(sugerenciasFormateadas)
  } catch (error) {
    console.error("Error al obtener sugerencias:", error)
    return NextResponse.json(
      { error: "Error al obtener sugerencias de colaboración" },
      { status: 500 }
    )
  }
}
