import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verificarCredenciales } from "@/lib/db"

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
      // Login exitoso - crear respuesta con cookies
      const response = NextResponse.json({
        success: true,
        message: "Login exitoso",
        user: resultado.user
      })
      
      // Configurar cookies de autenticación
      // Cookie con token de autenticación (simulado)
      response.cookies.set('auth-token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      })
      
      // Cookie con datos del usuario (para el middleware)
      response.cookies.set('user-data', JSON.stringify(resultado.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      })
      
      return response
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
