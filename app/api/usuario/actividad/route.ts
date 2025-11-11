import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * POST /api/usuario/actividad
 * Actualiza la última actividad del usuario autenticado
 */
export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener el usuario completo de Clerk para acceder al email
    const user = await currentUser()

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      // Si no hay email, actualizar por userId de Clerk
      // Buscar si el usuario tiene un registro asociado
      const result = await sql`
        UPDATE investigadores 
        SET ultima_actividad = CURRENT_TIMESTAMP 
        WHERE correo IN (
          SELECT email FROM users WHERE id = ${userId}
        )
        RETURNING id
      `
      
      if (result.rowCount === 0) {
        // Usuario no encontrado, pero no es crítico para el tracking
        return NextResponse.json({
          success: true,
          message: 'Usuario sin perfil',
          timestamp: new Date().toISOString()
        })
      }

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString()
      })
    }

    const userEmail = user.emailAddresses[0].emailAddress

    // Actualizar la última actividad en la tabla investigadores
    const result = await sql`
      UPDATE investigadores 
      SET ultima_actividad = CURRENT_TIMESTAMP 
      WHERE correo = ${userEmail}
    `

    return NextResponse.json({
      success: true,
      updated: (result.rowCount ?? 0) > 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error al actualizar actividad:', error)
    return NextResponse.json(
      { error: 'Error al actualizar actividad' },
      { status: 500 }
    )
  }
}
