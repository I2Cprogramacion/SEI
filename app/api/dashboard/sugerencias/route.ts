import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

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
      SELECT id, area, linea_investigacion 
      FROM investigadores 
      WHERE correo = ${email}
    `

    if (!miPerfil || miPerfil.rows.length === 0 || !miPerfil.rows[0]) {
      console.log(`⚠️ No hay perfil de investigador para sugerencias: ${email}`)
      return NextResponse.json([]) // Retornar array vacío en lugar de error
    }

    const perfil = miPerfil.rows[0]
    
    // Buscar investigadores relacionados (excluyendo al usuario actual)
    const sugerencias = await sql`
      SELECT 
        id,
        nombre_completo,
        correo,
        institucion,
        area,
        linea_investigacion,
        ultimo_grado_estudios
      FROM investigadores 
      WHERE id != ${perfil.id}
        AND (
          area = ${perfil.area || ''} OR 
          LOWER(linea_investigacion) LIKE ${`%${(perfil.linea_investigacion || '').toLowerCase().split(' ').slice(0, 3).join('%')}%`}
        )
      ORDER BY RANDOM()
      LIMIT 6
    `

    // Transformar los datos
    const sugerenciasFormateadas = sugerencias.rows.map((inv: any) => ({
      id: inv.id,
      name: inv.nombre_completo,
      email: inv.correo,
      institution: inv.institucion,
      area: inv.area,
      lineaInvestigacion: inv.linea_investigacion,
      fotografiaUrl: null, // Campo no existe en BD
      title: inv.ultimo_grado_estudios,
      slug: inv.nombre_completo?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() || `investigador-${inv.id}`,
      razonSugerencia: inv.area === perfil.area ? 'Área similar' : 'Intereses relacionados'
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
