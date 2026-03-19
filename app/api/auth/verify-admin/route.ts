import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

/**
 * GET /api/auth/verify-admin
 * 
 * Verifica si el usuario tiene permisos de admin/evaluador 
 * directamente desde los Clerk custom claims (sin BD)
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener usuario actual de Clerk
    const user = await currentUser()
    
    // Si no hay usuario, no está autenticado
    if (!user) {
      return NextResponse.json(
        { tieneAcceso: false, error: 'No autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar si tiene custom claims de admin o evaluador
    const esAdmin = user.publicMetadata?.es_admin === true
    const esEvaluador = user.publicMetadata?.es_evaluador === true
    
    // Si no tiene permisos
    if (!esAdmin && !esEvaluador) {
      return NextResponse.json(
        { tieneAcceso: false, esAdmin: false, esEvaluador: false },
        { status: 403 }
      )
    }
    
    // Tiene permisos
    return NextResponse.json(
      {
        tieneAcceso: true,
        esAdmin,
        esEvaluador,
        usuario: {
          id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          nombre: user.firstName
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('❌ [verify-admin] Error:', error)
    return NextResponse.json(
      { tieneAcceso: false, error: 'Error al verificar' },
      { status: 500 }
    )
  }
}
