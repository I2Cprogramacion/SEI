import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * POST /api/admin/sync-investigador-clerk
 * 
 * Fuerza la sincronización de claims de un investigador
 * específico a Clerk (útil cuando es_admin cambia sin
 * ejecutar sync-admin-claim automáticamente)
 * 
 * Solo admin puede usar este endpoint
 * 
 * Body:
 * {
 *   investigadorId?: string  (si no se proporciona, sincroniza el usuario actual)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [sync-investigador-clerk] POST iniciado')
    
    // Verificar que el usuario actual es admin
    const currentUserObj = await currentUser()
    
    if (!currentUserObj) {
      console.warn('⚠️ [sync-investigador-clerk] Usuario no autenticado')
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar que el usuario actual tiene permisos de admin
    const esSuperAdmin = currentUserObj.publicMetadata?.es_admin === true
    
    if (!esSuperAdmin) {
      console.warn('⚠️ [sync-investigador-clerk] Usuario no es admin')
      return NextResponse.json(
        { error: 'No tienes permisos' },
        { status: 403 }
      )
    }
    
    // Obtener investigadorId del body (si no, sincronizar el usuario actual)
    const body = await request.json()
    const { investigadorId } = body
    
    let whereClause = ''
    let queryParams: any[] = []
    
    if (investigadorId) {
      whereClause = 'WHERE id = $1'
      queryParams = [investigadorId]
      console.log('📋 [sync-investigador-clerk] Sincronizando investigador específico:', investigadorId)
    } else {
      // Sincronizar el usuario actual
      const userEmail = currentUserObj.emailAddresses?.[0]?.emailAddress?.toLowerCase()
      if (!userEmail) {
        return NextResponse.json(
          { error: 'No se pudo obtener email del usuario' },
          { status: 400 }
        )
      }
      whereClause = 'WHERE LOWER(correo) = $1'
      queryParams = [userEmail]
      console.log('📋 [sync-investigador-clerk] Sincronizando usuario actual:', userEmail)
    }
    
    // Obtener investigador de BD
    const query = `
      SELECT id, nombre_completo, correo, clerk_user_id, es_admin, es_evaluador 
      FROM investigadores 
      ${whereClause}
      LIMIT 1
    `
    
    const result = await sql.query(query, queryParams)
    
    if (!result.rows || result.rows.length === 0) {
      console.warn('⚠️ [sync-investigador-clerk] Investigador no encontrado')
      return NextResponse.json(
        { error: 'Investigador no encontrado' },
        { status: 404 }
      )
    }
    
    const investigador = result.rows[0] as any
    console.log('🔍 [sync-investigador-clerk] Investigador encontrado:', {
      id: investigador.id,
      nombre: investigador.nombre_completo,
      es_admin: investigador.es_admin,
      es_evaluador: investigador.es_evaluador,
      clerkUserId: investigador.clerk_user_id
    })
    
    if (!investigador.clerk_user_id) {
      console.warn('⚠️ [sync-investigador-clerk] Investigador sin clerk_user_id')
      return NextResponse.json(
        { 
          error: 'Este investigador no está vinculado con Clerk',
          investigador: {
            id: investigador.id,
            nombre: investigador.nombre_completo,
            correo: investigador.correo
          }
        },
        { status: 400 }
      )
    }
    
    // Sincronizar a Clerk
    console.log('🔐 [sync-investigador-clerk] Enviando a Clerk...')
    const clerkUrl = `https://api.clerk.com/v1/users/${investigador.clerk_user_id}`
    const clerkResponse = await fetch(clerkUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          es_admin: investigador.es_admin === true,
          es_evaluador: investigador.es_evaluador === true,
          sync_timestamp: new Date().toISOString()
        }
      })
    })
    
    if (!clerkResponse.ok) {
      const clerkError = await clerkResponse.text()
      console.error('❌ [sync-investigador-clerk] Error en Clerk:', {
        status: clerkResponse.status,
        error: clerkError
      })
      return NextResponse.json(
        { error: `Error al sincronizar a Clerk: ${clerkError}` },
        { status: 500 }
      )
    }
    
    console.log('✅ [sync-investigador-clerk] Sincronización exitosa')
    
    return NextResponse.json(
      {
        success: true,
        message: 'Investigador sincronizado a Clerk',
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
    console.error('❌ [sync-investigador-clerk] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: `Error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
