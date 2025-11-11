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
    const result = await sql`
      SELECT id, nombre_completo, correo, es_admin 
      FROM investigadores 
      WHERE correo = ${email}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { esAdmin: false, error: 'Usuario no encontrado en la base de datos' },
        { status: 404 }
      )
    }

    const usuario = result.rows[0]

    if (!usuario.es_admin) {
      return NextResponse.json(
        { esAdmin: false, error: 'Usuario no es administrador' },
        { status: 403 }
      )
    }

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
    console.error('Error al verificar admin:', error)
    return NextResponse.json(
      { esAdmin: false, error: 'Error al verificar permisos' },
      { status: 500 }
    )
  }
}
