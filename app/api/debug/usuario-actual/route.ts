import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

/**
 * GET /api/debug/usuario-actual
 * Endpoint de debug para verificar qué datos tiene el usuario logueado en Clerk
 * y qué registros existen en la base de datos
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ 
        error: "No autenticado",
        status: "sin_login"
      }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    const clerkUserId = user.id

    console.log("🔍 [DEBUG] Info de usuario en Clerk:")
    console.log(`   - Clerk User ID: ${clerkUserId}`)
    console.log(`   - Email: ${userEmail}`)
    console.log(`   - Email verified: ${user.emailAddresses[0]?.verification?.status}`)

    // Buscar por email exacto
    const resultEmail = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores 
      WHERE correo = ${userEmail}
      LIMIT 1
    `

    // Buscar por email case-insensitive
    const resultEmailLower = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores 
      WHERE LOWER(correo) = LOWER(${userEmail})
      LIMIT 1
    `

    // Buscar por clerk_user_id
    const resultClerkId = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores 
      WHERE clerk_user_id = ${clerkUserId}
      LIMIT 1
    `

    // Listar primeros 5 registros para verificar estructura
    const firstRecords = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores 
      ORDER BY id DESC
      LIMIT 5
    `

    return NextResponse.json({
      success: true,
      clerk_info: {
        clerk_user_id: clerkUserId,
        email: userEmail,
        email_verified: user.emailAddresses[0]?.verification?.status
      },
      database_results: {
        busqueda_email_exacto: {
          encontrado: resultEmail.rows.length > 0,
          resultado: resultEmail.rows[0] || null
        },
        busqueda_email_case_insensitive: {
          encontrado: resultEmailLower.rows.length > 0,
          resultado: resultEmailLower.rows[0] || null
        },
        busqueda_clerk_user_id: {
          encontrado: resultClerkId.rows.length > 0,
          resultado: resultClerkId.rows[0] || null
        }
      },
      ultimos_5_registros: firstRecords.rows,
      diagnostico: {
        problema: !resultEmail.rows.length && !resultEmailLower.rows.length && !resultClerkId.rows.length,
        causa_posible: resultEmail.rows.length === 0 && resultEmailLower.rows.length > 0 
          ? "Email guardado con diferentes mayúsculas"
          : resultClerkId.rows.length === 0
          ? "clerk_user_id no está guardado correctamente"
          : "Registro no encontrado"
      }
    })
  } catch (error) {
    console.error('Error en debug:', error)
    return NextResponse.json(
      { 
        error: "Error al obtener información de debug",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
