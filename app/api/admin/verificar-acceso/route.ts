import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

/**
 * DEPRECATED: This endpoint is kept for backwards compatibility
 * It now uses Clerk claims instead of BD queries for instant verification
 */
export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'No autenticado'
      }, { status: 401 })
    }
    
    // Use Clerk claims directly (no BD query needed)
    const esAdmin = user.publicMetadata?.es_admin === true
    const esEvaluador = user.publicMetadata?.es_evaluador === true
    
    if (!esAdmin && !esEvaluador) {
      return NextResponse.json({
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Sin permisos de admin'
      }, { status: 403 })
    }
    
    return NextResponse.json({
      tieneAcceso: true,
      esAdmin,
      esEvaluador,
      usuario: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        nombre: user.firstName
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('❌ [verificar-acceso] Error:', error)
    return NextResponse.json({
      tieneAcceso: false,
      error: 'Error verificando acceso'
    }, { status: 500 })
  }
}

