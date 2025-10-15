import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API UPDATE CV - INICIO ===")
    const body = await request.json()
    const { cv_url } = body
    console.log("1. CV URL recibida:", cv_url)

    // Obtener email del usuario desde el header (enviado por el cliente)
    const userEmail = request.headers.get("x-user-email")
    console.log("2. Email de usuario:", userEmail)

    if (!userEmail) {
      console.log("❌ No se proporcionó email")
      return NextResponse.json(
        { error: "Email de usuario no proporcionado" },
        { status: 400 }
      )
    }

    if (!cv_url) {
      console.log("❌ No se proporcionó URL del CV")
      return NextResponse.json(
        { error: "URL del CV no proporcionada" },
        { status: 400 }
      )
    }

    console.log("3. Obteniendo conexión a la base de datos...")
    const db = await getDatabase()

    console.log("4. Ejecutando UPDATE...")
    // Actualizar el cv_url del investigador
    const result = await db.query(
      `UPDATE investigadores SET cv_url = ? WHERE correo = ?`,
      [cv_url, userEmail]
    )

    console.log("5. Resultado de UPDATE:", result)
    console.log("✅ CV actualizado exitosamente en la BD")

    return NextResponse.json({
      success: true,
      message: "CV actualizado exitosamente",
      cv_url,
      email: userEmail
    })
  } catch (error) {
    console.error("❌ Error al actualizar CV:", error)
    console.error("Detalles completos:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: "Error al actualizar el CV",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


