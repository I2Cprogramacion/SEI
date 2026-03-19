import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * GET /api/debug/sync-me-to-db
 * 
 * Sincroniza el estado actual del usuario en Clerk → BD
 * Útil para que la BD refleje el estado real en Clerk
 */
export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener estado actual de Clerk
    const esAdmin = user.publicMetadata?.es_admin === true
    const esEvaluador = user.publicMetadata?.es_evaluador === true
    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Sin email' }, { status: 400 })
    }

    // Actualizar BD con el estado actual de Clerk
    const result = await sql`
      UPDATE investigadores
      SET es_admin = ${esAdmin}, es_evaluador = ${esEvaluador}
      WHERE LOWER(correo) = ${email}
      RETURNING id, nombre_completo, correo, es_admin, es_evaluador
    `

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado en BD',
        email: email,
        clerkClaims: { es_admin: esAdmin, es_evaluador: esEvaluador }
      }, { status: 404 })
    }

    const investigador = result.rows[0] as any

    return NextResponse.json({
      success: true,
      message: 'BD sincronizada con Clerk',
      investigador: {
        id: investigador.id,
        nombre: investigador.nombre_completo,
        correo: investigador.correo,
        es_admin: investigador.es_admin,
        es_evaluador: investigador.es_evaluador
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [sync-me-to-db] Error:', error)
    return NextResponse.json({
      error: String(error)
    }, { status: 500 })
  }
}
