import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarInvestigador, obtenerRegistroPendiente, eliminarRegistroPendiente } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

/**
 * API para completar el registro DESPUÉS de verificar el email en Clerk
 * 
 * Este endpoint:
 * 1. Recupera los datos de la tabla registros_pendientes
 * 2. Los guarda en la tabla investigadores (registro completo)
 * 3. Elimina el registro de la tabla registros_pendientes
 * 
 * Se llama SOLO cuando el usuario ha verificado su email en Clerk
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log("📥 ========== COMPLETANDO REGISTRO DESPUÉS DE VERIFICACIÓN ==========")
    
    // ============================================
    // VALIDACIÓN CRÍTICA: Verificar usuario autenticado
    // ============================================
    let authenticatedUserId: string | null = null
    try {
      const { userId } = await auth()
      authenticatedUserId = userId
    } catch (authError) {
      console.warn("⚠️ [COMPLETAR REGISTRO] No se pudo verificar usuario autenticado")
    }

    // Validar que clerk_user_id coincida con usuario autenticado
    if (authenticatedUserId && data.clerk_user_id !== authenticatedUserId) {
      console.error("❌ [COMPLETAR REGISTRO SEGURIDAD] Intento de completar registro con ID diferente", {
        autenticado: '****' + authenticatedUserId.slice(-4),
        solicitado: '****' + data.clerk_user_id.slice(-4)
      })
      return NextResponse.json(
        { 
          error: "El ID de usuario no coincide. No puedes completar el registro de otro usuario.",
          details: "Validación de seguridad fallida."
        },
        { status: 403 }
      )
    }
    
    // VALIDACIÓN CRÍTICA: Debe tener clerk_user_id
    if (!data.clerk_user_id) {
      console.error("❌ [COMPLETAR REGISTRO] Error: No se recibió clerk_user_id")
      return NextResponse.json(
        { 
          error: "No se recibió el ID de usuario de Clerk. El registro no puede completarse.",
          details: "El usuario debe estar verificado en Clerk antes de guardar en la base de datos."
        },
        { status: 400 }
      )
    }

    // ✅ PASO 1: Recuperar datos de la tabla registros_pendientes
    console.log("🔵 [COMPLETAR REGISTRO] Paso 1: Recuperando datos de tabla temporal...")
    
    let registroPendiente;
    try {
      registroPendiente = await obtenerRegistroPendiente(data.clerk_user_id)
    } catch (dbError: any) {
      console.error("❌ [COMPLETAR REGISTRO] Error al consultar BD:", dbError)
      return NextResponse.json(
        { 
          error: "Error al conectar con la base de datos",
          details: dbError.message || "Error de conexión"
        },
        { status: 500 }
      )
    }
    
    if (!registroPendiente) {
      console.error("❌ [COMPLETAR REGISTRO] No se encontró registro pendiente")
      console.error("   Posibles causas:")
      console.error("   1. El registro ya fue completado anteriormente")
      console.error("   2. El registro expiró (más de 24 horas)")
      console.error("   3. El clerk_user_id no coincide")
      
      return NextResponse.json(
        { 
          error: "No se encontró registro pendiente de verificación",
          details: "El registro puede haber expirado o ya fue completado. Por favor, intenta registrarte nuevamente."
        },
        { status: 404 }
      )
    }

    console.log("✅ [COMPLETAR REGISTRO] Registro pendiente encontrado")

    // Usar los datos del registro pendiente
    const datosRegistro = registroPendiente.datos_registro
    
    // Asegurar que tenga clerk_user_id
    datosRegistro.clerk_user_id = data.clerk_user_id
    
    // VALIDACIÓN: Debe tener correo
    if (!datosRegistro.correo) {
      console.error("❌ [COMPLETAR REGISTRO] Error: No se encontró correo en los datos")
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio" },
        { status: 400 }
      )
    }

    // VALIDACIÓN: Debe tener nombre completo
    const nombreCompleto = datosRegistro.nombre_completo || `${datosRegistro.nombres || ''} ${datosRegistro.apellidos || ''}`.trim()
    if (!nombreCompleto) {
      console.error("❌ [COMPLETAR REGISTRO] Error: No se encontró nombre completo")
      return NextResponse.json(
        { error: "El nombre completo es obligatorio" },
        { status: 400 }
      )
    }
    
    datosRegistro.nombre_completo = nombreCompleto

    console.log("📋 [COMPLETAR REGISTRO] Datos recuperados:", Object.keys(datosRegistro).length, "campos")

    // ✅ PASO 2: Guardar en la tabla investigadores (tabla definitiva)
    console.log("🔵 [COMPLETAR REGISTRO] Paso 2: Guardando en tabla investigadores...")
    
    try {
      const resultado = await guardarInvestigador(datosRegistro)
      
      if (resultado.success) {
        console.log("✅ [COMPLETAR REGISTRO] Guardado exitosamente en investigadores")
        
        // ✅ PASO 3: Eliminar de la tabla registros_pendientes
        console.log("🔵 [COMPLETAR REGISTRO] Paso 3: Limpiando tabla temporal...")
        
        const eliminado = await eliminarRegistroPendiente(data.clerk_user_id)
        
        if (eliminado) {
          console.log("✅ [COMPLETAR REGISTRO] Registro temporal eliminado")
        } else {
          console.warn("⚠️ [COMPLETAR REGISTRO] No se pudo eliminar el registro temporal")
        }
        
        console.log("🎉 ========== REGISTRO COMPLETADO EXITOSAMENTE ==========")
        
        return NextResponse.json({
          success: true,
          message: "Registro completado exitosamente",
          id: resultado.id,
        })
      } else {
        console.error("❌ [COMPLETAR REGISTRO] Error al guardar:", resultado.message)
        return NextResponse.json({
          success: false,
          message: resultado.message,
          duplicado: !resultado.success,
        }, { status: 409 })
      }
    } catch (dbError) {
      console.error("❌ [COMPLETAR REGISTRO] Error crítico al guardar:", dbError)
      return NextResponse.json({
        error: `Error al guardar en la base de datos: ${dbError instanceof Error ? dbError.message : "Error desconocido"}`,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ [COMPLETAR REGISTRO] Error al procesar solicitud:", error)
    return NextResponse.json({
      error: `Error al procesar el registro: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
