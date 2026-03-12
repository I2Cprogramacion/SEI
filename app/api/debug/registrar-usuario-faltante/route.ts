import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

/**
 * POST /api/debug/registrar-usuario-faltante
 * Si el usuario está logueado en Clerk pero no existe en la BD, lo crea automáticamente
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ 
        error: "No autenticado"
      }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    const clerkUserId = user.id
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.firstName || userEmail || "Usuario"

    if (!userEmail) {
      return NextResponse.json({ 
        error: "No se encontró email en Clerk" 
      }, { status: 400 })
    }

    console.log("🔵 [REGISTRAR USUARIO FALTANTE] Intentando crear registro para:", userEmail)

    // Verificar si ya existe
    const existing = await sql`
      SELECT id FROM investigadores 
      WHERE LOWER(correo) = LOWER(${userEmail}) 
      OR clerk_user_id = ${clerkUserId}
      LIMIT 1
    `

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: "El usuario ya existe en la base de datos",
        id: existing.rows[0].id
      })
    }

    // Crear registro mínimo
    const result = await sql`
      INSERT INTO investigadores (
        correo,
        clerk_user_id,
        nombre_completo,
        fecha_registro,
        activo,
        es_admin,
        es_aprobado
      ) VALUES (
        ${userEmail},
        ${clerkUserId},
        ${fullName},
        ${new Date().toISOString()},
        true,
        false,
        false
      )
      RETURNING id, correo, nombre_completo
    `

    if (result.rows.length > 0) {
      console.log("✅ [REGISTRAR USUARIO FALTANTE] Usuario creado:", result.rows[0].id)
      return NextResponse.json({
        success: true,
        message: "Registro creado exitosamente",
        usuario: result.rows[0]
      })
    } else {
      throw new Error("No se pudo crear el registro")
    }
  } catch (error) {
    console.error('Error registrando usuario faltante:', error)
    return NextResponse.json(
      { 
        error: "Error al crear registro",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
