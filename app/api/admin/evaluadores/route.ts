import { NextRequest, NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/auth/verificar-admin'
import { sql } from '@vercel/postgres'

/**
 * GET /api/admin/evaluadores
 * Obtener lista de todos los evaluadores
 * Solo admin puede acceder
 */
export async function GET() {
  try {
    // Verificar que el usuario es admin
    const adminCheck = await verificarAdmin()
    if (!adminCheck.esAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden ver esta información.' },
        { status: 403 }
      )
    }

    const result = await sql`
      SELECT 
        id,
        nombre_completo,
        correo,
        es_evaluador,
        es_admin,
        activo,
        fecha_registro
      FROM investigadores
      WHERE es_evaluador = true
      ORDER BY nombre_completo ASC
    `

    return NextResponse.json({
      evaluadores: result.rows.map(row => ({
        id: row.id,
        nombre: row.nombre_completo,
        email: row.correo,
        esEvaluador: row.es_evaluador,
        esAdmin: row.es_admin,
        activo: row.activo,
        fechaRegistro: row.fecha_registro
      }))
    })
  } catch (error) {
    console.error('Error al obtener evaluadores:', error)
    return NextResponse.json(
      { error: 'Error al obtener evaluadores' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/evaluadores
 * Asignar o quitar rol de evaluador a un usuario
 * Solo admin puede hacer esto
 * Body: { investigadorId: string, esEvaluador: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminCheck = await verificarAdmin()
    if (!adminCheck.esAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden asignar roles de evaluador.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { investigadorId, esEvaluador } = body

    if (!investigadorId || typeof esEvaluador !== 'boolean') {
      return NextResponse.json(
        { error: 'investigadorId y esEvaluador son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el investigador existe
    const investigadorCheck = await sql`
      SELECT id, nombre_completo, correo, es_admin
      FROM investigadores
      WHERE id = ${investigadorId}
    `

    if (investigadorCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Investigador no encontrado' },
        { status: 404 }
      )
    }

    const investigador = investigadorCheck.rows[0]

    // No permitir quitar rol de evaluador a un admin (aunque técnicamente puede ser ambos)
    // Esto es una decisión de negocio - puedes ajustarlo según necesites
    if (investigador.es_admin && !esEvaluador) {
      return NextResponse.json(
        { error: 'No se puede quitar el rol de evaluador a un administrador' },
        { status: 400 }
      )
    }

    // Actualizar el rol de evaluador
    await sql`
      UPDATE investigadores
      SET es_evaluador = ${esEvaluador}
      WHERE id = ${investigadorId}
    `

    return NextResponse.json({
      success: true,
      message: esEvaluador 
        ? `Rol de evaluador asignado a ${investigador.nombre_completo}`
        : `Rol de evaluador removido de ${investigador.nombre_completo}`,
      investigador: {
        id: investigador.id,
        nombre: investigador.nombre_completo,
        email: investigador.correo,
        esEvaluador: esEvaluador
      }
    })
  } catch (error) {
    console.error('Error al actualizar rol de evaluador:', error)
    return NextResponse.json(
      { error: 'Error al actualizar rol de evaluador' },
      { status: 500 }
    )
  }
}

