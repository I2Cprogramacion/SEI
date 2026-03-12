import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

/**
 * GET /api/investigadores/actual
 * Obtiene los datos del investigador actual basado en su email o clerk_user_id de Clerk
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    const clerkUserId = user.id

    if (!userEmail && !clerkUserId) {
      return NextResponse.json({ error: "Email y Clerk ID no disponibles" }, { status: 400 })
    }

    console.log(`🔍 Buscando investigador para: email=${userEmail}, clerkUserId=${clerkUserId}`)

    let result = null

    // Intento 1: Buscar por email (case-insensitive)
    if (userEmail) {
      result = await sql`
        SELECT 
          id,
          nombre_completo,
          correo,
          slug,
          fotografia_url,
          institucion,
          area_investigacion,
          clerk_user_id
        FROM investigadores 
        WHERE LOWER(correo) = LOWER(${userEmail}) 
        LIMIT 1
      `
    }

    // Intento 2: Si no se encontró por email, buscar por clerk_user_id
    if (result?.rows.length === 0 && clerkUserId) {
      console.log(`⚠️ No encontrado por email. Intentando con clerk_user_id...`)
      result = await sql`
        SELECT 
          id,
          nombre_completo,
          correo,
          slug,
          fotografia_url,
          institucion,
          area_investigacion,
          clerk_user_id
        FROM investigadores 
        WHERE clerk_user_id = ${clerkUserId}
        LIMIT 1
      `
    }

    if (!result || result.rows.length === 0) {
      console.error(`❌ No se encontró investigador. Email: ${userEmail}, ClerkID: ${clerkUserId}`)
      return NextResponse.json(
        { 
          error: "No se encontró un investigador con este usuario. Por favor, completa tu registro.",
          email: userEmail,
          clerkUserId: clerkUserId
        },
        { status: 404 }
      )
    }

    console.log(`✅ Investigador encontrado: ${result.rows[0].nombre_completo}`)

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
