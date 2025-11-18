import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * API para verificar si el usuario actual es administrador
 * GET /api/admin/verificar
 */
export async function GET() {
  try {
    console.log('🔍 [API] Iniciando verificación de admin...')
    const user = await currentUser()
    
    if (!user) {
      console.log('❌ [API] Usuario no autenticado')
      return NextResponse.json(
        { esAdmin: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const email = user.emailAddresses[0]?.emailAddress
    console.log('📧 [API] Email del usuario:', email)

    if (!email) {
      console.log('❌ [API] Email no encontrado en el usuario de Clerk')
      return NextResponse.json(
        { esAdmin: false, error: 'Email no encontrado' },
        { status: 401 }
      )
    }

    // Verificar si el usuario es admin en la BD
    // Buscar con email en minúsculas para evitar problemas de case sensitivity
    const emailLower = email.toLowerCase().trim()
    console.log('🔍 [API] Buscando usuario en la BD con email:', emailLower)
    
    let result
    try {
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin 
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
      `
    } catch (sqlError) {
      console.error('❌ [API] Error en la consulta SQL:', sqlError)
      throw sqlError
    }

    console.log('📊 [API] Resultado de la consulta:', {
      rowsCount: result.rows.length,
      rows: result.rows.map(r => ({
        id: r.id,
        correo: r.correo,
        es_admin: r.es_admin,
        tipo_es_admin: typeof r.es_admin,
        es_admin_es_true: r.es_admin === true
      }))
    })

    if (result.rows.length === 0) {
      console.log('❌ [API] Usuario no encontrado en la base de datos con email:', emailLower)
      return NextResponse.json(
        { esAdmin: false, error: 'Usuario no encontrado en la base de datos' },
        { status: 404 }
      )
    }

    const usuario = result.rows[0]
    console.log('👤 [API] Usuario encontrado:', {
      id: usuario.id,
      nombre: usuario.nombre_completo,
      correo: usuario.correo,
      es_admin: usuario.es_admin,
      tipo_es_admin: typeof usuario.es_admin,
      es_admin_es_true: usuario.es_admin === true,
      es_admin_es_false: usuario.es_admin === false,
      es_admin_es_null: usuario.es_admin === null
    })

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
