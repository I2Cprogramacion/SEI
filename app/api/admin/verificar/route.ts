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
    console.log('🔍 [API] Buscando usuario en la BD con email:', email)
    const result = await sql`
      SELECT id, nombre_completo, correo, es_admin 
      FROM investigadores 
      WHERE correo = ${email}
    `

    console.log('📊 [API] Resultado de la consulta:', {
      rowsCount: result.rows.length,
      rows: result.rows
    })

    if (result.rows.length === 0) {
      console.log('❌ [API] Usuario no encontrado en la base de datos')
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
      tipo_es_admin: typeof usuario.es_admin
    })

    // Verificar si es_admin es true (puede ser boolean o string 'true')
    const esAdmin = usuario.es_admin === true || usuario.es_admin === 'true' || usuario.es_admin === 1

    if (!esAdmin) {
      console.log('❌ [API] Usuario no es administrador. es_admin =', usuario.es_admin)
      return NextResponse.json(
        { esAdmin: false, error: 'Usuario no es administrador' },
        { status: 403 }
      )
    }

    // Usuario es admin
    console.log('✅ [API] Usuario es administrador')
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
    return NextResponse.json(
      { esAdmin: false, error: 'Error al verificar permisos' },
      { status: 500 }
    )
  }
}
