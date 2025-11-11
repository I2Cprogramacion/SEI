import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener el usuario de Clerk
    const user = await currentUser()
    
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 400 }
      )
    }

    const userEmail = user.emailAddresses[0].emailAddress

    // Verificar que el usuario existe y es admin en la base de datos
    const userResult = await sql`
      SELECT id, nombre_completo, correo, es_admin 
      FROM investigadores 
      WHERE correo = ${userEmail}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const usuario = userResult.rows[0]

    // Verificar que el usuario es admin
    if (!usuario.es_admin) {
      return NextResponse.json(
        { error: 'Acceso denegado: No eres administrador' },
        { status: 403 }
      )
    }

    // Contar total de usuarios registrados
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM investigadores
    `
    const totalUsuarios = parseInt(totalResult.rows[0].total)

    // Definir tiempo de actividad (usuarios activos en el último minuto para pruebas)
    // En producción cambiar a: 10 * 60 * 1000 (10 minutos)
    const tiempoActividad = new Date(Date.now() - 1 * 60 * 1000) // 1 minuto
    
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
    
    // Intentar contar usuarios nuevos por fecha_registro si existe
    let usuariosNuevosHoy = 0
    try {
      const nuevosHoyResult = await sql`
        SELECT COUNT(*) as total 
        FROM investigadores
        WHERE fecha_registro >= ${inicioHoy.toISOString()}
      `
      usuariosNuevosHoy = parseInt(nuevosHoyResult.rows[0].total)
    } catch (e) {
      // Si la columna fecha_registro no existe, intentar con created_at
      try {
        const nuevosHoyResult = await sql`
          SELECT COUNT(*) as total 
          FROM investigadores
          WHERE created_at >= ${inicioHoy.toISOString()}
        `
        usuariosNuevosHoy = parseInt(nuevosHoyResult.rows[0].total)
      } catch (err) {
        // Si ninguna columna existe, dejar en 0
        usuariosNuevosHoy = 0
      }
    }

    // Usuarios nuevos esta semana
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - 7)
    inicioSemana.setHours(0, 0, 0, 0)
    
    let usuariosNuevosSemana = 0
    try {
      const nuevosSemanaResult = await sql`
        SELECT COUNT(*) as total 
        FROM investigadores
        WHERE fecha_registro >= ${inicioSemana.toISOString()}
      `
      usuariosNuevosSemana = parseInt(nuevosSemanaResult.rows[0].total)
    } catch (e) {
      // Si la columna fecha_registro no existe, intentar con created_at
      try {
        const nuevosSemanaResult = await sql`
          SELECT COUNT(*) as total 
          FROM investigadores
          WHERE created_at >= ${inicioSemana.toISOString()}
        `
        usuariosNuevosSemana = parseInt(nuevosSemanaResult.rows[0].total)
      } catch (err) {
        // Si ninguna columna existe, dejar en 0
        usuariosNuevosSemana = 0
      }
    }

    return NextResponse.json({
      totalUsuarios,
      usuariosActivos,
      usuariosNuevosHoy,
      usuariosNuevosSemana,
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
