import { NextResponse } from 'next/server'
import { verificarAdminOEvaluador } from '@/lib/auth/verificar-evaluador'

/**
 * API para verificar si el usuario tiene acceso (admin o evaluador)
 * GET /api/admin/verificar-acceso
 */
export async function GET() {
  try {
    const resultado = await verificarAdminOEvaluador()
    
    if (!resultado.tieneAcceso) {
      return NextResponse.json(
        { 
          tieneAcceso: false,
          esAdmin: false,
          esEvaluador: false,
          error: resultado.redirect === '/iniciar-sesion' ? 'No autenticado' : 'Acceso denegado'
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
    console.error('❌ [API] Error al verificar acceso:', error)
    return NextResponse.json(
      { 
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Error al verificar permisos',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

