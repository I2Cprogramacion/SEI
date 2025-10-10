import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

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

    const db = await getDatabase()
    
    // Obtener datos del investigador actual
    const miPerfil = await db.query(
      `SELECT id, area, area_investigacion, linea_investigacion 
       FROM investigadores 
       WHERE correo = $1`,
      [email]
    )

    if (!miPerfil || miPerfil.length === 0) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
    }

    const perfil = miPerfil[0]
    
    // Buscar investigadores relacionados (excluyendo al usuario actual)
    const sugerencias = await db.query(
      `SELECT 
        id,
        nombre_completo,
        correo,
        institucion,
        area,
        area_investigacion,
        linea_investigacion,
        fotografia_url,
        ultimo_grado_estudios,
        slug
      FROM investigadores 
      WHERE id != $1
        AND (
          area = $2 OR 
          area_investigacion = $3 OR
          LOWER(linea_investigacion) LIKE $4
        )
      ORDER BY RANDOM()
      LIMIT 6`,
      [
        perfil.id,
        perfil.area || '',
        perfil.area_investigacion || '',
        `%${(perfil.linea_investigacion || '').toLowerCase().split(' ').slice(0, 3).join('%')}%`
      ]
    )

    // Transformar los datos
    const sugerenciasFormateadas = sugerencias.map((inv: any) => ({
      id: inv.id,
      name: inv.nombre_completo,
      email: inv.correo,
      institution: inv.institucion,
      area: inv.area || inv.area_investigacion,
      lineaInvestigacion: inv.linea_investigacion,
      fotografiaUrl: inv.fotografia_url,
      title: inv.ultimo_grado_estudios,
      slug: inv.slug || inv.nombre_completo?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() || `investigador-${inv.id}`,
      razonSugerencia: inv.area === perfil.area || inv.area_investigacion === perfil.area_investigacion
        ? 'Área similar'
        : 'Intereses relacionados'
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
