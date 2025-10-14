import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * POST /api/usuario/actividad
 * Actualiza la última actividad del usuario autenticado
 */
export async function POST() {
  try {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener el email del usuario desde Clerk
    const userEmail = sessionClaims?.email as string

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 400 }
      )
    }

    // Actualizar la última actividad en la tabla investigadores
    await sql`
      UPDATE investigadores 
      SET ultima_actividad = CURRENT_TIMESTAMP 
      WHERE correo = ${userEmail}
    `

    return NextResponse.json({
      success: true,
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
