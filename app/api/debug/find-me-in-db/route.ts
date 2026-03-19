import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * GET /api/debug/find-me-in-db
 * 
 * Busca al usuario actual en la BD investigadores
 * Muestra si existe y qué datos tiene
 */
export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    const clerkUserId = user.id

    console.log('🔍 Buscando en BD:', { email, clerkUserId })

    // Búsqueda 1: Por email
    let result = await sql`
      SELECT id, nombre_completo, correo, es_admin, es_evaluador, clerk_user_id
      FROM investigadores 
      WHERE LOWER(correo) = ${email}
      LIMIT 1
    `

    if (result.rows && result.rows.length > 0) {
      const investigador = result.rows[0] as any
      return NextResponse.json({
        encontrado: true,
        metodo: 'Por email (LOWER)',
        investigador: {
          id: investigador.id,
          nombre_completo: investigador.nombre_completo,
          correo: investigador.correo,
          es_admin: investigador.es_admin,
          es_evaluador: investigador.es_evaluador,
          clerk_user_id: investigador.clerk_user_id
        },
        clerkActual: {
          id: user.id,
          email: email,
          es_admin: user.publicMetadata?.es_admin,
          es_evaluador: user.publicMetadata?.es_evaluador
        }
      }, { status: 200 })
    }

    // Búsqueda 2: Por clerk_user_id
    result = await sql`
      SELECT id, nombre_completo, correo, es_admin, es_evaluador, clerk_user_id
      FROM investigadores 
      WHERE clerk_user_id = ${clerkUserId}
      LIMIT 1
    `

    if (result.rows && result.rows.length > 0) {
      const investigador = result.rows[0] as any
      return NextResponse.json({
        encontrado: true,
        metodo: 'Por clerk_user_id',
        investigador: {
          id: investigador.id,
          nombre_completo: investigador.nombre_completo,
          correo: investigador.correo,
          es_admin: investigador.es_admin,
          es_evaluador: investigador.es_evaluador,
          clerk_user_id: investigador.clerk_user_id
        },
        clerkActual: {
          id: user.id,
          email: email,
          es_admin: user.publicMetadata?.es_admin,
          es_evaluador: user.publicMetadata?.es_evaluador
        }
      }, { status: 200 })
    }

    // No encontrado
    return NextResponse.json({
      encontrado: false,
      razon: 'No existe en investigadores',
      busquedaPor: {
        email: email,
        clerk_user_id: clerkUserId
      },
      clerkActual: {
        id: user.id,
        email: email,
        es_admin: user.publicMetadata?.es_admin,
        es_evaluador: user.publicMetadata?.es_evaluador
      }
    }, { status: 404 })

  } catch (error) {
    console.error('❌ [find-me-in-db] Error:', error)
    return NextResponse.json({
      error: String(error)
    }, { status: 500 })
  }
}
