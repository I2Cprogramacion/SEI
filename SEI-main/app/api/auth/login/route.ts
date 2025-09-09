import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verificarCredenciales } from "@/lib/db"
import * as jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Intento de login para:", email)

    // Validar datos obligatorios
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      )
    }

    // Verificar credenciales en la base de datos
    const resultado = await verificarCredenciales(email, password)

    if (resultado.success) {
      // Generar JWT
      const token = jwt.sign(
        {
          id: resultado.user.id,
          email: resultado.user.email,
          nombre: resultado.user.nombre
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "7d" }
      )
      console.log("Login exitoso, token generado:", token)
      return NextResponse.json({
        success: true,
        message: "Login exitoso",
        user: resultado.user,
        token
      })
    } else {
      // Credenciales incorrectas
      return NextResponse.json(
        { error: resultado.message },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
