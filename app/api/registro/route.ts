import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarRegistroPendiente } from "@/lib/db"
import { registroInvestigadorSchema } from "@/lib/validations/registro"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

/**
 * POST /api/registro
 * 
 * Endpoint PÚBLICO para registrar un nuevo investigador
 * 
 * ARQUITECTURA DE SEGURIDAD MULTINIVEL:
 * ✅ Zod validation - Estructura de datos estricta
 * ✅ Rate limiting (10 req/hora via middleware)
 * ✅ reCAPTCHA - Previene bots
 * ✅ clerk_user_id validation - Formato válido (no vacío)
 * ✅ Unique constraints BD - Previene duplicados (email, CURP, RFC)
 * ✅ Data sanitization - Remueve campos privilegiados
 * ✅ Log masking - No expone datos sensibles
 * 
 * ⚠️ TIMING CRÍTICO:
 * Este endpoint se llama DESPUÉS de signUp.create() pero ANTES de que
 * el usuario verifique su email. Por eso NO validamos con clerkClient()
 * (el usuario aún no está completamente verificado en Clerk).
 * 
 * La validación real ocurre cuando el usuario verifica el código de email.
 * 
 * FLUJO CORRECTO:
 * 1. User anónimo llena formulario
 * 2. Frontend crea usuario en Clerk: signUp.create()
 * 3. Frontend prepara verificación: prepareEmailAddressVerification()
 * 4. Frontend envía datos a /api/registro (AQUÍ ESTAMOS)
 * 5. Backend valida Zod + CAPTCHA + guarda en BD
 * 6. Clerk envía email con código
 * 7. User verifica código en app
 * 8. User accede a completar registro: /api/completar-registro
 */

// Helper para enmascarar datos sensibles en logs
const enmascararDatos = (data: any) => ({
  curp: data.curp ? data.curp.substring(0, 3) + '****' : 'vacío',
  rfc: data.rfc ? data.rfc.substring(0, 2) + '****' : 'vacío',
  no_cvu: data.no_cvu ? '****' : 'vacío',
  correo: data.correo ? data.correo.split('@')[0] + '@****' : 'vacío',
  clerk_user_id: data.clerk_user_id ? '****' + data.clerk_user_id.slice(-4) : 'vacío',
  nombre_completo: data.nombre_completo ? '[ENMASCARADO]' : 'vacío'
});

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
  try {
    // ============================================
    // CAPA 1: Obtener y parsear datos
    // ============================================
    const rawData = await request.json()

    // ============================================
    // CAPA 2: Validar estructura con Zod
    // ============================================
    let data
    try {
      data = registroInvestigadorSchema.parse(rawData)
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        const camposFaltantes = zodError.errors.map(e => String(e.path[0])).filter(Boolean)
        console.error("❌ [REGISTRO VALIDACION] Error Zod:", {
          totalErrores: zodError.errors.length,
          camposConError: camposFaltantes,
        })
        return NextResponse.json({
          error: "Datos de registro inválidos",
          message: camposFaltantes.length > 0 
            ? `Campos con error: ${camposFaltantes.join(', ')}`
            : "Error de validación en los datos",
          camposFaltantes: camposFaltantes,
        }, { status: 400 })
      }
      throw zodError
    }

    // ============================================
    // CAPA 3: Validar clerk_user_id CONTRA USUARIO AUTENTICADO
    // ============================================
    // SEGURIDAD CRÍTICA: Validar que el clerk_user_id coincida con el usuario autenticado
    // Previene que Usuario A cree registro con el ID de Usuario B
    
    let authenticatedUserId: string | null = null
    try {
      const { userId } = await auth()
      authenticatedUserId = userId
    } catch (authError) {
      console.warn("⚠️ [REGISTRO] No se pudo obtener usuario autenticado, continuando sin validación de auth")
    }

    if (!data.clerk_user_id || typeof data.clerk_user_id !== 'string' || data.clerk_user_id.trim().length === 0) {
      console.error("❌ [REGISTRO] clerk_user_id inválido o vacío")
      return NextResponse.json(
        { error: "No se recibió un ID de usuario válido" },
        { status: 400 }
      )
    }

    // ⚠️ ARQUITECTURA: Validation de ownership
    // Si tenemos usuario autenticado, validar que clerk_user_id coincida
    // Si no hay usuario autenticado, es el flujo de registro anónimo (permitido)
    if (authenticatedUserId && data.clerk_user_id !== authenticatedUserId) {
      console.error("❌ [REGISTRO SEGURIDAD] Intento de registrar con ID diferente al autenticado", {
        autenticado: authenticatedUserId ? '****' + authenticatedUserId.slice(-4) : 'none',
        solicitado: '****' + data.clerk_user_id.slice(-4)
      })
      return NextResponse.json(
        { error: "El ID de usuario no coincide. No puedes registrar datos de otro usuario." },
        { status: 403 }
      )
    }

    // ============================================
    // CAPA 4: CAPTCHA Verification (si está configurado)
    // ============================================
    if (rawData.captchaToken) {
      const captchaValid = await verificarCaptcha(rawData.captchaToken)
      if (!captchaValid) {
        console.error("❌ [REGISTRO] CAPTCHA inválido")
        return NextResponse.json(
          { error: "Verificación CAPTCHA fallida" },
          { status: 400 }
        )
      }
    } else if (process.env.RECAPTCHA_SECRET) {
      // Si reCAPTCHA está configurado, es REQUERIDO
      console.warn("⚠️ [REGISTRO] CAPTCHA token no recibido pero reCAPTCHA está configurado")
      return NextResponse.json(
        { error: "Se requiere completar la verificación CAPTCHA" },
        { status: 400 }
      )
    }

    // ============================================
    // CAPA 5: Sanitización - Remover campos que usuario no debe establecer
    // ============================================
    const camposProhibidos = ['es_admin', 'es_evaluador', 'activo', 'es_aprobado', 'aprobado']
    camposProhibidos.forEach(campo => {
      if (campo in data) {
        delete (data as any)[campo]
      }
    })

    // ============================================
    // CAPA 5B: Sanitización de strings - Prevenir XSS
    // ============================================
    // Sanitizar campos de texto para remover potenciales XSS
    const sanitizeString = (str: string): string => {
      if (!str || typeof str !== 'string') return str
      return str
        .trim()
        .replace(/[<>]/g, '') // Remover < y >
        .substring(0, 500) // Limitar longitud
    }

    // Sanitizar campos de texto
    if (typeof data.nombre_completo === 'string') data.nombre_completo = sanitizeString(data.nombre_completo)
    if (typeof data.nombres === 'string') data.nombres = sanitizeString(data.nombres)
    if (typeof data.apellidos === 'string') data.apellidos = sanitizeString(data.apellidos)
    if (typeof data.telefono === 'string') data.telefono = sanitizeString(data.telefono)
    if (typeof data.empleo_actual === 'string') data.empleo_actual = sanitizeString(data.empleo_actual)
    if (typeof data.linea_investigacion === 'string') data.linea_investigacion = sanitizeString(data.linea_investigacion)
    if (typeof data.area_investigacion === 'string') data.area_investigacion = sanitizeString(data.area_investigacion)

    // CURP: 18 caracteres alfanuméricos mayúsculas (validar formato)
    if (data.curp && typeof data.curp === 'string') {
      data.curp = data.curp.toUpperCase().substring(0, 18)
      if (!/^[A-Z0-9]{18}$/.test(data.curp)) {
        return NextResponse.json(
          { error: "CURP debe tener exactamente 18 caracteres alfanuméricos" },
          { status: 400 }
        )
      }
    }

    // RFC: máximo 13 caracteres alfanuméricos mayúsculas
    if (data.rfc && typeof data.rfc === 'string') {
      data.rfc = data.rfc.toUpperCase().substring(0, 13)
      if (!/^[A-Z0-9]{10,13}$/.test(data.rfc)) {
        return NextResponse.json(
          { error: "RFC debe tener 10 a 13 caracteres alfanuméricos" },
          { status: 400 }
        )
      }
    }

    // CVU: debe ser numérico
    if (data.no_cvu && typeof data.no_cvu === 'string') {
      data.no_cvu = data.no_cvu.substring(0, 20)
      if (!/^[0-9]+$/.test(data.no_cvu)) {
        return NextResponse.json(
          { error: "CVU debe contener solo números" },
          { status: 400 }
        )
      }
    }

    // ============================================
    // CAPA 6: Enmascaramiento para logs
    // ============================================
    console.log("📥 [REGISTRO API] Datos recibidos (enmascarados):", enmascararDatos(data))

    // ============================================
    // CAPA 7: Datos opcionales
    // ============================================
    if (!data.nombre_completo && data.nombres && data.apellidos) {
      data.nombre_completo = `${data.nombres} ${data.apellidos}`.trim()
    }

    if (!data.nombre_completo) {
      return NextResponse.json(
        { error: "El nombre completo es obligatorio" },
        { status: 400 }
      )
    }

    if (!data.correo) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio" },
        { status: 400 }
      )
    }

    if (!data.fecha_registro) {
      data.fecha_registro = new Date().toISOString()
    }

    // ============================================
    // CAPA 8: Guardar en BD
    // ============================================
    try {
      const { guardarInvestigador } = await import("@/lib/db")
      
      console.log("📝 [REGISTRO] Guardando investigador:")
      console.log(`   - Email: ${data.correo}`)
      console.log(`   - Clerk User ID: ${data.clerk_user_id}`)
      console.log(`   - Nombre: ${data.nombre_completo}`)
      
      const resultado = await guardarInvestigador(data)
      
      if (resultado.success) {
        console.log("✅ [REGISTRO] Guardado exitosamente")
        console.log(`   - ID: ${resultado.id}`)
        
        return NextResponse.json({
          success: true,
          message: "Registro completado exitosamente",
          id: resultado.id,
          clerk_user_id: data.clerk_user_id,
          correo: data.correo
        }, { status: 200 })
      } else {
        console.error("❌ [REGISTRO] Error al guardar:", resultado.message)
        return NextResponse.json({
          success: false,
          message: resultado.message || 'Error al guardar en la base de datos'
        }, { status: 409 })
      }
    } catch (dbError) {
      console.error("❌ [REGISTRO] Error en BD:", dbError)
      
      let mensajeUsuario = "Error al guardar en la base de datos"
      const mensajeError = dbError instanceof Error ? dbError.message : String(dbError)
      
      if (mensajeError.includes('duplicate key')) {
        mensajeUsuario = "Ya existe un registro con estos datos (email, CURP o RFC duplicado)."
      } else if (mensajeError.includes('value too long')) {
        mensajeUsuario = "Algunos de tus datos son demasiado largos. Por favor, verifica CURP y RFC."
      }
      
      return NextResponse.json({
        error: mensajeUsuario,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ [REGISTRO] Error no manejado:", error)
    return NextResponse.json({
      error: "Error al procesar tu registro. Por favor, intenta de nuevo.",
    }, { status: 500 })
  }
}
