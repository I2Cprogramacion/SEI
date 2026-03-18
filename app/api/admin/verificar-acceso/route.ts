import { NextResponse } from 'next/server'
import { verificarAdminOEvaluador } from '@/lib/auth/verificar-evaluador'

/**
 * API para verificar si el usuario tiene acceso (admin o evaluador)
 * GET /api/admin/verificar-acceso
 */
export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    steps: [] as string[]
  }
  
  try {
    debugInfo.steps.push('Iniciando verificación')
    console.log('⏱️ [API verificar-acceso] Iniciando verificación...')
    
    // Timeout de 10 segundos para evitar que se quede colgado
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout en verificarAdminOEvaluador')), 10000)
    )
    
    debugInfo.steps.push('Llamando a verificarAdminOEvaluador')
    const resultado = await Promise.race([
      verificarAdminOEvaluador(),
      timeoutPromise
    ]) as any
    
    debugInfo.steps.push('Resultado recibido')
    console.log('📋 [API verificar-acceso] Resultado:', {
      tieneAcceso: resultado.tieneAcceso,
      esAdmin: resultado.esAdmin,
      esEvaluador: resultado.esEvaluador,
      usuario: resultado.usuario?.correo,
      redirect: resultado.redirect
    })
    
    if (!resultado.tieneAcceso) {
      return NextResponse.json(
        { 
          tieneAcceso: false,
          esAdmin: false,
          esEvaluador: false,
          error: resultado.redirect === '/iniciar-sesion' ? 'No autenticado' : 'Acceso denegado',
          debug: {
            redirect: resultado.redirect,
            usuarioEncontrado: !!resultado.usuario,
            razon: resultado.usuario ? 'Usuario no tiene permisos' : 'Usuario no encontrado en BD',
            debugInfo
          }
        },
        { status: resultado.redirect === '/iniciar-sesion' ? 401 : 403 }
      )
    }

    return NextResponse.json({
      tieneAcceso: true,
      esAdmin: resultado.esAdmin,
      esEvaluador: resultado.esEvaluador,
      usuario: {
        id: resultado.usuario?.id,
        nombre: resultado.usuario?.nombre_completo,
        email: resultado.usuario?.correo
      },
      debugInfo
    })
  } catch (error) {
    debugInfo.steps.push(`Error capturado: ${error instanceof Error ? error.message : String(error)}`)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [API] Error al verificar acceso:', error)
    console.error('❌ [API] Error completo:', JSON.stringify(error, null, 2))
    
    return NextResponse.json(
      { 
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Error al verificar permisos',
        debug: {
          errorMessage,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          fullError: errorMessage,
          debugInfo
        }
      },
      { status: 500 }
    )
  }
}

