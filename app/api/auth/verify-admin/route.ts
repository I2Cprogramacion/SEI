import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

/**
 * GET /api/auth/verify-admin
 * 
 * Verifica si el usuario tiene permisos de admin/evaluador 
 * directamente desde los Clerk custom claims (sin BD)
 * 
 * Retorna:
 * - 200: User authenticated and verified claims
 * - 401: User not authenticated
 * - 403: User authenticated but no admin permissions
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [verify-admin] GET iniciado')
    
    // Obtener usuario actual de Clerk
    const user = await currentUser()
    console.log('👤 [verify-admin] Usuario de Clerk:', {
      id: user?.id,
      email: user?.emailAddresses?.[0]?.emailAddress,
      esAdmin: user?.publicMetadata?.es_admin,
      esEvaluador: user?.publicMetadata?.es_evaluador,
    })
    
    // Si no hay usuario, no está autenticado
    if (!user) {
      console.warn('⚠️ [verify-admin] Usuario no autenticado')
      return NextResponse.json(
        { 
          tieneAcceso: false,
          error: 'No autenticado',
          source: 'clerk'
        },
        { status: 401 }
      )
    }
    
    // Verificar si tiene custom claims de admin o evaluador
    const esAdmin = user.publicMetadata?.es_admin === true
    const esEvaluador = user.publicMetadata?.es_evaluador === true
    
    console.log('🔐 [verify-admin] Permisos verificados:', {
      esAdmin,
      esEvaluador,
      hasAccess: esAdmin || esEvaluador
    })
    
    // Si no tiene permisos
    if (!esAdmin && !esEvaluador) {
      console.warn('⚠️ [verify-admin] Usuario sin permisos de admin/evaluador')
      return NextResponse.json(
        {
          tieneAcceso: false,
          esAdmin: false,
          esEvaluador: false,
          error: 'No tienes permisos de administrador',
          source: 'clerk',
          debugInfo: {
            userId: user.id,
            userEmail: user.emailAddresses?.[0]?.emailAddress,
            publicMetadata: user.publicMetadata
          }
        },
        { status: 403 }
      )
    }
    
    // Tiene permisos
    console.log('✅ [verify-admin] Acceso concedido')
    return NextResponse.json(
      {
        tieneAcceso: true,
        esAdmin,
        esEvaluador,
        source: 'clerk',
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
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      {
        tieneAcceso: false,
        error: `Error al verificar permisos: ${errorMessage}`,
        source: 'clerk'
      },
      { status: 500 }
    )
  }
}
