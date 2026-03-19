import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * API para verificar si el usuario tiene acceso admin/evaluador
 * Optimizado con índice en investigadores(LOWER(correo))
 */
export async function GET() {
  try {
    // 1. Obtener usuario autenticado
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'No autenticado'
      }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase()
    
    if (!email) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'Sin email'
      }, { status: 400 })
    }

    // 2. Verificar permisos en BD (usa índice para rapidez)
    const result = await sql`
      SELECT 
        id,
        nombre_completo,
        correo,
        es_admin,
        es_evaluador
      FROM investigadores 
      WHERE LOWER(correo) = ${email}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'Usuario no encontrado en BD'
      }, { status: 403 })
    }

    const usuario = result.rows[0]
    const tieneAcceso = usuario.es_admin === true || usuario.es_evaluador === true

    if (!tieneAcceso) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'Sin permisos de acceso'
      }, { status: 403 })
    }

    // ✅ Acceso permitido
    return NextResponse.json({
      tieneAcceso: true,
      esAdmin: usuario.es_admin === true,
      esEvaluador: usuario.es_evaluador === true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        email: usuario.correo
      }
    })

  } catch (error) {
    console.error('❌ [verificar-acceso] Error:', error)
    return NextResponse.json({
      tieneAcceso: false,
      error: 'Error al verificar permisos'
    }, { status: 500 })
  }
}

