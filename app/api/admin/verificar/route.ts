import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * API para verificar si el usuario actual es administrador
 * GET /api/admin/verificar
 */
export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { esAdmin: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json(
        { esAdmin: false, error: 'Email no encontrado' },
        { status: 401 }
      )
    }

    // Verificar si el usuario es admin en la BD
    // Buscar con email en minúsculas para evitar problemas de case sensitivity
    const emailLower = email.toLowerCase().trim()
    
    let result
    try {
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin, es_evaluador 
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
      `
    } catch (sqlError) {
      console.error('❌ [API] Error en la consulta SQL:', sqlError)
      throw sqlError
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { esAdmin: false, error: 'Usuario no encontrado en la base de datos' },
        { status: 404 }
      )
    }

    const usuario = result.rows[0]

    // Verificar directamente si es_admin es true (boolean)
    // El campo es BOOLEAN en la BD, así que verificamos directamente
    const esAdmin = usuario.es_admin === true
    
    console.log('✅ [API] Verificación final:', {
      es_admin_valor: usuario.es_admin,
      es_admin_tipo: typeof usuario.es_admin,
      esAdmin_resultado: esAdmin
    })

    if (!esAdmin) {
      console.log('❌ [API] Usuario NO es administrador. es_admin =', usuario.es_admin, '(tipo:', typeof usuario.es_admin, ')')
      return NextResponse.json(
        { esAdmin: false, error: 'Usuario no es administrador' },
        { status: 403 }
      )
    }

    console.log('✅ [API] Usuario ES administrador')

    // Usuario es admin
    return NextResponse.json({
      esAdmin: true,
      esEvaluador: usuario.es_evaluador === true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        email: usuario.correo
      }
    })
  } catch (error) {
    console.error('❌ [API] Error al verificar admin:', error)
    console.error('❌ [API] Detalles del error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        esAdmin: false, 
        error: 'Error al verificar permisos',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
