import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

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

    const db = await getDatabase()

    // Buscar el investigador actual por email
    const investigadorActual = await db.query(
      `SELECT id FROM investigadores WHERE correo = $1`,
      [userEmail]
    )

    if (!investigadorActual.rows || investigadorActual.rows.length === 0) {
      console.log(`[VERIFICAR CONEXION] Usuario no encontrado en BD: ${userEmail}`)
      return NextResponse.json({ conectados: false }, { status: 200 })
    }

    const miId = investigadorActual.rows[0].id

    // Buscar el investigador objetivo por email
    const investigadorObjetivo = await db.query(
      `SELECT id FROM investigadores WHERE correo = $1`,
      [investigadorEmail]
    )

    if (!investigadorObjetivo.rows || investigadorObjetivo.rows.length === 0) {
      return NextResponse.json({ conectados: false }, { status: 200 })
    }

    const otroId = investigadorObjetivo.rows[0].id

    // Verificar si existe una conexión aceptada (en cualquier dirección)
    const conexion = await db.query(
      `SELECT id, estado, fecha_respuesta 
       FROM conexiones 
       WHERE estado = 'aceptada' 
       AND (
         (investigador_id = $1 AND investigador_destino_id = $2) 
         OR 
         (investigador_id = $2 AND investigador_destino_id = $1)
       )
       LIMIT 1`,
      [miId, otroId]
    )

    console.log(`[VERIFICAR CONEXION] Conexión encontrada:`, conexion.rows.length > 0)

    if (conexion.rows && conexion.rows.length > 0) {
      return NextResponse.json({ 
        conectados: true,
        fechaConexion: conexion.rows[0].fecha_respuesta 
      }, { status: 200 })
    }

    // Verificar si hay una solicitud pendiente (para mostrar estado diferente)
    const solicitudPendiente = await db.query(
      `SELECT id, estado 
       FROM conexiones 
       WHERE estado = 'pendiente' 
       AND (
         (investigador_id = $1 AND investigador_destino_id = $2) 
         OR 
         (investigador_id = $2 AND investigador_destino_id = $1)
       )
       LIMIT 1`,
      [miId, otroId]
    )

    if (solicitudPendiente.rows && solicitudPendiente.rows.length > 0) {
      return NextResponse.json({ 
        conectados: false,
        solicitudPendiente: true 
      }, { status: 200 })
    }

    return NextResponse.json({ conectados: false }, { status: 200 })
  } catch (error) {
    console.error("[VERIFICAR CONEXION ERROR]:", error)
    return NextResponse.json(
      { error: "Error al verificar conexión" },
      { status: 500 }
    )
  }
}
