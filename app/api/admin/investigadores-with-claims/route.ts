import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

/**
 * GET /api/admin/investigadores-with-claims
 * 
 * Retorna investigadores de BD pero con su estado actual en Clerk
 * Útil para gestionar admins sin desincronización
 */
export async function GET() {
  try {
    // Verificar que es admin
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const esAdmin = user.publicMetadata?.es_admin === true
    if (!esAdmin) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 })
    }

    // Obtener investigadores de BD
    const investigadoresResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/investigadores?incluirInactivos=true`)
    
    if (!investigadoresResponse.ok) {
      throw new Error('Error obteniendo investigadores de BD')
    }

    const data = await investigadoresResponse.json()
    const listaInvestigadores = data.investigadores || data || []

    // Mapear al formato que necesitamos
    const investigadoresFormateados = listaInvestigadores.map((inv: any) => ({
      id: inv.id,
      nombre_completo: inv.nombre_completo || inv.nombre || 'Sin nombre',
      correo: inv.correo || inv.email || '',
      clerk_user_id: inv.clerk_user_id,
      es_admin_bd: inv.es_admin === true, // Valor en BD
      es_admin: inv.es_admin === true // Por ahora mismo que BD, pero marcamos que es de BD
    }))

    return NextResponse.json({
      investigadores: investigadoresFormateados,
      count: investigadoresFormateados.length
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [investigadores-with-claims] Error:', error)
    return NextResponse.json(
      { error: 'Error obteniendo investigadores' },
      { status: 500 }
    )
  }
}
