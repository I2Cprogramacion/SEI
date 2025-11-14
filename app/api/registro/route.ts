import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarRegistroPendiente } from "@/lib/db"
import { verifyJWT } from "@/lib/auth/verify-jwt"

/**
 * API para guardar un registro PENDIENTE de verificación
 * 
 * Este endpoint guarda los datos en una tabla temporal después de crear
 * el usuario en Clerk, pero ANTES de que verifique su email.
 * 
 * El registro completo en la tabla 'investigadores' ocurre en /api/completar-registro
 * después de que el usuario verifique su email.
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
    console.log("==================================================")
    console.log("📥 [REGISTRO PENDIENTE] DATOS RECIBIDOS:")
    console.log("   Clerk User ID:", data.clerk_user_id)
    console.log("   Correo:", data.correo)
    console.log("   Total campos:", Object.keys(data).length)
    console.log("==================================================")
    
    // VALIDACIÓN CRÍTICA: Debe tener clerk_user_id
    if (!data.clerk_user_id) {
      console.error("❌ [REGISTRO PENDIENTE] Falta clerk_user_id")
      return NextResponse.json(
        { 
          error: "No se recibió el ID de usuario de Clerk",
          details: "El usuario debe ser creado en Clerk primero"
        },
        { status: 400 }
      )
    }

    // VALIDACIÓN: Debe tener correo
    if (!data.correo) {
      console.error("❌ [REGISTRO PENDIENTE] Falta correo electrónico")
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }
    
    // Construir nombre_completo si no existe
    if (!data.nombre_completo && data.nombres && data.apellidos) {
      data.nombre_completo = `${data.nombres} ${data.apellidos}`.trim()
      console.log("✅ [REGISTRO PENDIENTE] nombre_completo construido:", data.nombre_completo)
    }
    
    // Validar que ahora sí tengamos nombre_completo
    if (!data.nombre_completo) {
      console.error("❌ [REGISTRO PENDIENTE] Falta nombre completo")
      return NextResponse.json({ error: "El nombre completo es obligatorio" }, { status: 400 })
    }

    // Añadir fecha de registro si no existe
    if (!data.fecha_registro) {
      data.fecha_registro = new Date().toISOString()
    }

    // ✅ SOLUCIÓN TEMPORAL: Guardar directo en investigadores
    // TODO: Volver a usar registros_pendientes cuando la tabla esté lista
    console.log("🔵 [REGISTRO] Guardando directamente en investigadores...")
    
    try {
      const { guardarInvestigador } = await import("@/lib/db")
      const resultado = await guardarInvestigador(data)
      
      if (resultado.success) {
        console.log("✅ [REGISTRO] Guardado exitosamente")
        console.log("   ID:", resultado.id)
        console.log("   Clerk User ID:", data.clerk_user_id)
        console.log("   Correo:", data.correo)
        
        return NextResponse.json({
          success: true,
          message: "Registro completado exitosamente",
          id: resultado.id
        })
      } else {
        console.error("❌ [REGISTRO] Error al guardar:", resultado.message)
        return NextResponse.json({
          success: false,
          message: resultado.message,
        }, { status: 409 })
      }
    } catch (dbError) {
      console.error("❌ [REGISTRO] Error crítico:", dbError)
      return NextResponse.json({
        error: `Error al guardar: ${dbError instanceof Error ? dbError.message : "Error desconocido"}`,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ [REGISTRO PENDIENTE] Error al procesar solicitud:", error)
    return NextResponse.json({
      error: `Error al procesar el registro: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
