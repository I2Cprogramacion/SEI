import { NextResponse } from 'next/server'
import { verificarAdminOEvaluador } from '@/lib/auth/verificar-evaluador'

/**
 * API para verificar si el usuario tiene acceso (admin o evaluador)
 * GET /api/admin/verificar-acceso
 */
export async function GET() {
  try {
    const resultado = await verificarAdminOEvaluador()
    
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
            razon: resultado.usuario ? 'Usuario no tiene permisos' : 'Usuario no encontrado en BD'
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
      }
    })
  } catch (error) {
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
          fullError: errorMessage
        }
      },
      { status: 500 }
    )
  }
}

