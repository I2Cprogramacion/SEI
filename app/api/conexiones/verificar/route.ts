import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

// GET /api/conexiones/verificar?email=investigador@email.com
// Verifica si existe una conexión aceptada entre el usuario actual y el investigador especificado
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    // Si no está autenticado, simplemente retornar que no están conectados
    if (!user) {
      return NextResponse.json({ conectados: false, noAutenticado: true }, { status: 200 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    if (!userEmail) {
      return NextResponse.json({ conectados: false, noAutenticado: true }, { status: 200 })
    }

    // Obtener email del investigador a verificar desde query params
    const { searchParams } = new URL(request.url)
    const investigadorEmail = searchParams.get("email")

    if (!investigadorEmail) {
      return NextResponse.json({ error: "Email del investigador requerido" }, { status: 400 })
    }

    console.log(`[VERIFICAR CONEXION] Usuario: ${userEmail}, Investigador: ${investigadorEmail}`)

    // Buscar el investigador actual por email
    const investigadorActual = await sql`
      SELECT id FROM investigadores WHERE correo = ${userEmail} LIMIT 1
    `

    if (investigadorActual.rows.length === 0) {
      console.log(`[VERIFICAR CONEXION] Usuario no encontrado en BD: ${userEmail}`)
      return NextResponse.json({ conectados: false }, { status: 200 })
    }

    const miId = investigadorActual.rows[0].id

    // Buscar el investigador objetivo por email
    const investigadorObjetivo = await sql`
      SELECT id FROM investigadores WHERE correo = ${investigadorEmail} LIMIT 1
    `

    if (investigadorObjetivo.rows.length === 0) {
      return NextResponse.json({ conectados: false }, { status: 200 })
    }

    const otroId = investigadorObjetivo.rows[0].id

    console.log(`[VERIFICAR CONEXION] IDs: miId=${miId}, otroId=${otroId}`)

    // Verificar si existe una conexión aceptada (en cualquier dirección)
    // Usar la misma lógica que en GET /api/conexiones
    const conexion = await sql`
      SELECT id, estado, updated_at 
      FROM conexiones 
      WHERE estado = 'aceptada' 
      AND (
        (investigador_id = ${miId} AND investigador_destino_id = ${otroId}) 
        OR 
        (investigador_id = ${otroId} AND investigador_destino_id = ${miId})
      )
      LIMIT 1
    `

    console.log(`[VERIFICAR CONEXION] Conexión aceptada encontrada:`, conexion.rows.length > 0)

    if (conexion.rows.length > 0) {
      return NextResponse.json({ 
        conectados: true,
        fechaConexion: conexion.rows[0].updated_at 
      }, { status: 200 })
    }

    // Verificar si hay una solicitud pendiente (para mostrar estado diferente)
    const solicitudPendiente = await sql`
      SELECT id, estado 
      FROM conexiones 
      WHERE estado = 'pendiente' 
      AND (
        (investigador_id = ${miId} AND investigador_destino_id = ${otroId}) 
        OR 
        (investigador_id = ${otroId} AND investigador_destino_id = ${miId})
      )
      LIMIT 1
    `

    console.log(`[VERIFICAR CONEXION] Solicitud pendiente encontrada:`, solicitudPendiente.rows.length > 0)

    if (solicitudPendiente.rows.length > 0) {
      return NextResponse.json({ 
        conectados: false,
        solicitudPendiente: true 
      }, { status: 200 })
    }

    return NextResponse.json({ conectados: false }, { status: 200 })
  } catch (error) {
    console.error("[VERIFICAR CONEXION ERROR]:", error)
    return NextResponse.json(
      { error: "Error al verificar conexión", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
