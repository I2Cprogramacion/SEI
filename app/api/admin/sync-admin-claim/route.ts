import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * Sincroniza es_admin de BD → Custom Claims de Clerk
 * Se ejecuta después de cambiar es_admin en BD
 * POST /api/admin/sync-admin-claim
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado'
      }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Sin email'
      }, { status: 400 })
    }

    console.log(`🔄 [sync-admin-claim] Sincronizando para: ${email}`)

    // 1. Obtener es_admin de BD
    const result = await sql`
      SELECT es_admin, es_evaluador FROM investigadores 
      WHERE LOWER(correo) = ${email}
      LIMIT 1
    `

    if (!result || result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado en BD'
      }, { status: 404 })
    }

    const investigador = result.rows[0]
    const esAdmin = investigador.es_admin === true
    const esEvaluador = investigador.es_evaluador === true

    // 2. Actualizar custom claims en Clerk
    const clerkUrl = `https://api.clerk.com/v1/users/${user.id}`
    const clerkResponse = await fetch(clerkUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          es_admin: esAdmin,
          es_evaluador: esEvaluador,
          sync_timestamp: new Date().toISOString()
        }
      })
    })

    if (!clerkResponse.ok) {
      const clerkError = await clerkResponse.text()
      console.error('❌ [sync-admin-claim] Error Clerk:', clerkError)
      return NextResponse.json({
        success: false,
        error: 'Error al actualizar Clerk'
      }, { status: 500 })
    }

    console.log(`✅ [sync-admin-claim] Sincronizado: es_admin=${esAdmin}, es_evaluador=${esEvaluador}`)

    return NextResponse.json({
      success: true,
      esAdmin,
      esEvaluador,
      message: 'Claims actualizados en Clerk'
    })

  } catch (error) {
    console.error('❌ [sync-admin-claim] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
