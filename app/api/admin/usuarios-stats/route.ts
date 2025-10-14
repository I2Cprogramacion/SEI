import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * GET /api/admin/usuarios-stats
 * Retorna estadísticas de usuarios registrados y activos
 * Solo accesible para administradores
 */
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea admin
    const userEmail = sessionClaims?.email as string
    const userResult = await sql`
      SELECT i.*, i.password IS NOT NULL as tiene_password 
      FROM investigadores i
      WHERE i.correo = ${userEmail}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Por ahora, cualquier usuario autenticado puede ver las estadísticas
    // TODO: Implementar verificación de rol de admin

    // Contar total de usuarios registrados
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM investigadores
    `
    const totalUsuarios = parseInt(totalResult.rows[0].total)

    // Definir tiempo de actividad (usuarios activos en los últimos 5 minutos)
    const tiempoActividad = new Date(Date.now() - 5 * 60 * 1000)
    
    // Contar usuarios activos
    const activosResult = await sql`
      SELECT COUNT(*) as total 
      FROM investigadores
      WHERE ultima_actividad >= ${tiempoActividad.toISOString()}
    `
    const usuariosActivos = parseInt(activosResult.rows[0].total)

    // Usuarios nuevos hoy
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const nuevosHoyResult = await sql`
      SELECT COUNT(*) as total 
      FROM investigadores
      WHERE fecha_registro >= ${inicioHoy.toISOString()}
    `
    const usuariosNuevosHoy = parseInt(nuevosHoyResult.rows[0].total)

    // Usuarios nuevos esta semana
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - 7)
    inicioSemana.setHours(0, 0, 0, 0)
    const nuevosSemanaResult = await sql`
      SELECT COUNT(*) as total 
      FROM investigadores
      WHERE fecha_registro >= ${inicioSemana.toISOString()}
    `
    const usuariosNuevosSemana = parseInt(nuevosSemanaResult.rows[0].total)

    // Obtener detalles de usuarios activos
    const activosDetalleResult = await sql`
      SELECT 
        id,
        nombre_completo,
        correo,
        ultima_actividad,
        fotografia_url
      FROM investigadores
      WHERE ultima_actividad >= ${tiempoActividad.toISOString()}
      ORDER BY ultima_actividad DESC
      LIMIT 10
    `

    const usuariosActivosDetalle = activosDetalleResult.rows.map(usuario => ({
      id: usuario.id,
      nombre_completo: usuario.nombre_completo || 'Sin nombre',
      correo: usuario.correo,
      ultima_actividad: usuario.ultima_actividad,
      fotografia_url: usuario.fotografia_url || null
    }))

    return NextResponse.json({
      totalUsuarios,
      usuariosActivos,
      usuariosNuevosHoy,
      usuariosNuevosSemana,
      usuariosActivosDetalle,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
