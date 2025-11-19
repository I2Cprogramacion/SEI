import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

/**
 * GET /api/investigadores/actual
 * Obtiene los datos del investigador actual basado en su email de Clerk
 * Sin usar clerk_user_id, solo email
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress

    if (!userEmail) {
      return NextResponse.json({ error: "Email no disponible" }, { status: 400 })
    }

    // Buscar investigador por email
    const result = await sql`
      SELECT 
        id,
        nombre_completo,
        correo,
        slug,
        fotografia_url,
        institucion,
        area_investigacion
      FROM investigadores 
      WHERE correo = ${userEmail} 
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          error: "No se encontró un investigador con este email",
          email: userEmail 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      investigador: result.rows[0]
    })
  } catch (error) {
    console.error('Error obteniendo investigador actual:', error)
    return NextResponse.json(
      { error: "Error al obtener datos del investigador" },
      { status: 500 }
    )
  }
}
