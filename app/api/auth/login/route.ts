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
      // En desarrollo, saltar 2FA si no hay SMTP configurado
      const skipTwoFA = process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST;
      
      if (skipTwoFA) {
        // Login directo sin 2FA en desarrollo
        const response = NextResponse.json({
          success: true,
          user: {
            id: resultado.user.id,
            email: resultado.user.email,
            nombre: resultado.user.nombre_completo,
            rol: resultado.user.rol,
          },
          message: "Login exitoso (2FA deshabilitado en desarrollo)"
        });

        // Crear cookie de sesión
        response.cookies.set('auth-token', resultado.user.id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        return response;
      }

      // Generar código 2FA y enviar por email (solo en producción o con SMTP configurado)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      codes[resultado.user.email] = {
        code,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutos
        user: resultado.user
      };
      
      try {
        await send2FACode(resultado.user.email, code);
        return NextResponse.json({
          success: false,
          pending_2fa: true,
          message: "Código de verificación enviado al email"
        });
      } catch (emailError) {
        console.error("Error enviando email 2FA:", emailError);
        return NextResponse.json(
          { error: "Error al enviar código de verificación. Contacta al administrador." },
          { status: 500 }
        );
      }
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
