import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verificarCredenciales } from "@/lib/db"
import { send2FACode } from "@/lib/email-2fa"

// Simulación: en producción usar Redis o DB temporal
const codes: Record<string, { code: string; expires: number; user: any }> = {};

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
      // Generar código 2FA y enviar por email
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      codes[resultado.user.email] = {
        code,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutos
        user: resultado.user
      };
      await send2FACode(resultado.user.email, code);
      return NextResponse.json({
        success: false,
        pending_2fa: true,
        message: "Código de verificación enviado al email"
      });
    } else {
      // Credenciales incorrectas
      return NextResponse.json(
        { error: resultado.message },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
