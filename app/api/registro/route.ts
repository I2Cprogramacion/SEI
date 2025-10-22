import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarInvestigador } from "@/lib/db"
import { verifyJWT } from "@/lib/auth/verify-jwt"

/**
 * Verifica el token de reCAPTCHA con Google
 */
async function verificarCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET
  
  if (!secretKey) {
    console.error("❌ RECAPTCHA_SECRET no está configurada en las variables de entorno")
    return false
  }

  try {
    console.log("🔍 Verificando CAPTCHA con Google...")
    
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    
    console.log("📊 Respuesta de Google reCAPTCHA:", {
      success: data.success,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      score: data.score,
      action: data.action,
      error_codes: data["error-codes"],
    })

    if (!data.success) {
      console.error("❌ CAPTCHA inválido. Error codes:", data["error-codes"])
      return false
    }

    console.log("✅ CAPTCHA verificado exitosamente")
    return true
  } catch (error) {
    console.error("❌ Error al verificar CAPTCHA con Google:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  // Permitir registro abierto, pero si se envía token, verificarlo
  const authHeader = request.headers.get("authorization")
  let payload = null
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "")
    payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }
  }
  try {
    const data = await request.json()
    console.log("Datos recibidos para registro:", data)

    // 🔒 VERIFICAR CAPTCHA PRIMERO
    const captchaToken = data.captchaToken || data.recaptcha
    
    if (!captchaToken) {
      console.error("❌ No se recibió token de CAPTCHA")
      return NextResponse.json(
        { 
          error: "Token de CAPTCHA no proporcionado",
          message: "Por favor, completa el CAPTCHA para continuar"
        },
        { status: 400 }
      )
    }

    const captchaValido = await verificarCaptcha(captchaToken)
    
    if (!captchaValido) {
      console.error("❌ CAPTCHA inválido o expirado")
      return NextResponse.json(
        {
          error: "CAPTCHA inválido o expirado",
          message: "Por favor, marca el CAPTCHA nuevamente e intenta de nuevo"
        },
        { status: 400 }
      )
    }

    console.log("✅ CAPTCHA verificado correctamente, continuando con el registro...")
    // Validar datos obligatorios
    if (!data.nombre_completo) {
      console.error("Falta el nombre completo")
      return NextResponse.json({ error: "El nombre completo es obligatorio" }, { status: 400 })
    }
    if (!data.correo) {
      console.error("Falta el correo electrónico")
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }
    // Añadir fecha de registro si no existe
    if (!data.fecha_registro) {
      data.fecha_registro = new Date().toISOString()
    }
    // Si el campo es 'password', hashearla antes de guardar
    if (data.password) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    try {
      const resultado = await guardarInvestigador(data)
      console.log("Resultado del guardado:", resultado)
      if (resultado.success) {
        return NextResponse.json({
          success: true,
          message: resultado.message,
          id: resultado.id,
        })
      } else {
        // Error de duplicado o validación
        return NextResponse.json({
          success: false,
          message: resultado.message,
          duplicado: !resultado.success,
        }, { status: 409 }) // 409 Conflict para duplicados
      }
    } catch (dbError) {
      console.error("Error al guardar en la base de datos:", dbError)
      return NextResponse.json({
        error: `Error al guardar en la base de datos: ${dbError instanceof Error ? dbError.message : "Error desconocido"}`,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al procesar el registro:", error)
    return NextResponse.json({
      error: `Error al procesar el registro: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
