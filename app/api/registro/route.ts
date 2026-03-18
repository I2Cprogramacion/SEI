import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarRegistroPendiente } from "@/lib/db"
import { registroInvestigadorSchema } from "@/lib/validations/registro"
import { z } from "zod"

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
  try {
    const rawData = await request.json()
    
    console.log("📥 [REGISTRO API] Datos recibidos:", {
      curp: rawData.curp,
      rfc: rawData.rfc,
      no_cvu: rawData.no_cvu,
      nombre_completo: rawData.nombre_completo,
      correo: rawData.correo,
      clerk_user_id: rawData.clerk_user_id
    })
    
    // SEGURIDAD NIVEL 1: Remover campos admin que el usuario no debe poder establecer
    const camposProhibidos = ['es_admin', 'es_evaluador', 'activo', 'es_aprobado', 'aprobado']
    camposProhibidos.forEach(campo => delete rawData[campo])
    
    // SEGURIDAD NIVEL 2: Validación con Zod para asegurar estructura y tipos
    let data
    try {
      data = registroInvestigadorSchema.parse(rawData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        
        // Extraer TODOS los campos únicos que fallaron en la validación
        const camposConError = new Set<string>()
        error.errors.forEach(e => {
          const nombreCampo = String(e.path[0])
          if (nombreCampo) {
            camposConError.add(nombreCampo)
          }
        })
        
        console.error("❌ [REGISTRO] Campos con error (sin filtrar):", Array.from(camposConError))
        
        // Lista de campos obligatorios que el usuario debe completar
        const CAMPOS_OBLIGATORIOS = ['curp', 'rfc', 'no_cvu', 'nombre_completo', 'clerk_user_id', 'correo']
        
        // Filtrar solo los campos obligatorios
        const camposFaltantes = Array.from(camposConError).filter(campo => 
          CAMPOS_OBLIGATORIOS.includes(campo)
        )
        
        console.error("❌ [REGISTRO] Campos obligatorios con error:", camposFaltantes)
        console.error("❌ [REGISTRO] Todos los errores:", error.errors.map(e => ({
          campo: String(e.path[0]),
          mensaje: e.message,
          codigo: e.code
        })))
        
        return NextResponse.json({
          error: "Datos de registro inválidos",
          message: camposFaltantes.length > 0 
            ? `Los siguientes campos son obligatorios y no pueden estar vacíos: ${camposFaltantes.join(', ')}. Por favor, completa todos estos campos para continuar.`
            : "Verifica que todos los datos sean correctos. Es posible que algunos campos obligatorios estén faltando.",
          details: errorDetails,
          camposFaltantes: camposFaltantes,
          todosLosErrores: error.errors.map(e => ({
            campo: e.path.join('.'),
            mensaje: e.message,
            codigo: e.code
          }))
        }, { status: 400 })
      }
      throw error
    }
    
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
    
    try {
      const { guardarInvestigador } = await import("@/lib/db")
      
      console.log("📝 [REGISTRO] Datos a guardar:")
      console.log(`   - Email: ${data.correo}`)
      console.log(`   - Clerk User ID: ${data.clerk_user_id}`)
      console.log(`   - Nombre completo: ${data.nombre_completo}`)
      
      const resultado = await guardarInvestigador(data)
      
      if (resultado.success) {
        console.log("✅ [REGISTRO] Guardado exitosamente en PostgreSQL")
        console.log(`   - ID de investigador: ${resultado.id}`)
        
        return NextResponse.json({
          success: true,
          message: "Registro completado exitosamente",
          id: resultado.id,
          clerk_user_id: data.clerk_user_id,
          correo: data.correo
        })
      } else {
        console.error("❌ [REGISTRO] Error al guardar")
        return NextResponse.json({
          success: false,
          message: resultado.message || 'Error al guardar en la base de datos'
        }, { status: 409 })
      }
    } catch (dbError) {
      console.error("❌ [REGISTRO] Error crítico en guardarInvestigador")
      console.error("   Tipo:", dbError instanceof Error ? dbError.constructor.name : typeof dbError)
      console.error("   Mensaje:", dbError instanceof Error ? dbError.message : String(dbError))
      
      // Detectar errores específicos y dar mensajes útiles
      let mensajeUsuario = "Error al guardar en la base de datos"
      const mensajeError = dbError instanceof Error ? dbError.message : String(dbError)
      
      if (mensajeError.includes('value too long for type character varying(13)')) {
        mensajeUsuario = "El RFC debe tener máximo 13 caracteres. Por favor, verifica que tu RFC sea correcto."
      } else if (mensajeError.includes('value too long for type character varying(18)')) {
        mensajeUsuario = "La CURP debe tener exactamente 18 caracteres. Por favor, verifica que tu CURP sea correcta."
      } else if (mensajeError.includes('duplicate key')) {
        mensajeUsuario = "Ya existe un registro con estos datos (CURP, RFC o correo duplicado)."
      }
      
      return NextResponse.json({
        error: mensajeUsuario,
        errorTecnico: mensajeError,
        type: dbError instanceof Error ? dbError.constructor.name : typeof dbError
      }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ [REGISTRO PENDIENTE] Error al procesar solicitud:", error)
    return NextResponse.json({
      error: `Error al procesar el registro: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
