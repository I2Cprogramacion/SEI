import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * POST /api/admin/update-investigador
 * 
 * Actualiza el estado de admin/evaluador de un investigador
 * y sincroniza automáticamente a Clerk custom claims
 * 
 * Body:
 * {
 *   investigadorId: string
 *   es_admin: boolean
 *   es_evaluador: boolean
 * }
 * 
 * Retorna:
 * - 200: Updated and synced successfully
 * - 400: Missing required fields
 * - 401: User not authenticated
 * - 403: Current user not admin
 * - 404: Investigador not found
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [update-investigador] POST iniciado')
    
    // Verificar que el usuario actual es admin
    const currentUserObj = await currentUser()
    
    if (!currentUserObj) {
      console.warn('⚠️ [update-investigador] Usuario no autenticado')
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar que el usuario actual tiene permisos de admin
    const esSuperAdmin = currentUserObj.publicMetadata?.es_admin === true
    
    if (!esSuperAdmin) {
      console.warn('⚠️ [update-investigador] Usuario no es admin')
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar investigadores' },
        { status: 403 }
      )
    }
    
    // Obtener datos del body
    const body = await request.json()
    const { investigadorId, es_admin, es_evaluador } = body
    
    console.log('📦 [update-investigador] Body recibido:', {
      investigadorId,
      es_admin,
      es_evaluador
    })
    
    if (!investigadorId || typeof es_admin !== 'boolean' || typeof es_evaluador !== 'boolean') {
      console.warn('⚠️ [update-investigador] Campos faltantes o inválidos')
      return NextResponse.json(
        { error: 'investigadorId, es_admin, y es_evaluador son requeridos' },
        { status: 400 }
      )
    }
    
    // Actualizar en la BD
    console.log('🔄 [update-investigador] Actualizando en BD...')
    const result = await sql`
      UPDATE investigadores
      SET es_admin = ${es_admin}, es_evaluador = ${es_evaluador}
      WHERE id = ${investigadorId}
      RETURNING id, clerk_user_id, nombre_completo, correo, es_admin, es_evaluador
    `
    
    if (!result.rows || result.rows.length === 0) {
      console.warn('⚠️ [update-investigador] Investigador no encontrado:', investigadorId)
      return NextResponse.json(
        { error: 'Investigador no encontrado' },
        { status: 404 }
      )
    }
    
    const investigador = result.rows[0] as any
    console.log('✅ [update-investigador] BD actualizada:', {
      id: investigador.id,
      es_admin: investigador.es_admin,
      es_evaluador: investigador.es_evaluador
    })
    
    // Sincronizar a Clerk si el investigador tiene clerk_user_id
    if (investigador.clerk_user_id) {
      console.log('🔐 [update-investigador] Sincronizando a Clerk...')
      
      try {
        const clerkUrl = `https://api.clerk.com/v1/users/${investigador.clerk_user_id}`
        const clerkResponse = await fetch(clerkUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public_metadata: {
              es_admin: investigador.es_admin,
              es_evaluador: investigador.es_evaluador,
              sync_timestamp: new Date().toISOString()
            }
          })
        })
        
        if (!clerkResponse.ok) {
          const clerkError = await clerkResponse.text()
          console.error('❌ [update-investigador] Error en Clerk:', {
            status: clerkResponse.status,
            error: clerkError
          })
          // No fallar completamente si Clerk falla, pero logear el error
        } else {
          console.log('✅ [update-investigador] Sincronizado a Clerk exitosamente')
        }
        
      } catch (clerkError) {
        console.error('❌ [update-investigador] Error sincronizando a Clerk:', clerkError)
        // No fallar completamente si Clerk falla
      }
    } else {
      console.warn('⚠️ [update-investigador] Investigador sin clerk_user_id, no se sincronizó a Clerk')
    }
    
    // Retornar éxito
    return NextResponse.json(
      {
        success: true,
        message: 'Investigador actualizado y sincronizado',
        investigador: {
          id: investigador.id,
          nombre: investigador.nombre_completo,
          correo: investigador.correo,
          es_admin: investigador.es_admin,
          es_evaluador: investigador.es_evaluador
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('❌ [update-investigador] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: `Error al actualizar: ${errorMessage}` },
      { status: 500 }
    )
  }
}
