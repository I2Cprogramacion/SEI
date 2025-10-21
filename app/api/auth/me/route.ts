import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Obtener el ID del usuario de las cookies
    const authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const userId = parseInt(authToken)
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      )
    }

    // Obtener datos completos del usuario desde la base de datos
    const db = await getDatabase()
    const usuario = await db.obtenerInvestigadorPorId(userId)

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Formatear y devolver datos completos del usuario
    const userCompleto = {
      id: usuario.id,
      nombre: usuario.nombre_completo,
      nombre_completo: usuario.nombre_completo,
      email: usuario.correo,
      correo: usuario.correo,
      curp: usuario.curp,
      rfc: usuario.rfc,
      no_cvu: usuario.no_cvu,
      telefono: usuario.telefono,
      nivel: usuario.nivel,
      area: usuario.area,
      area_investigacion: usuario.area_investigacion,
      linea_investigacion: usuario.linea_investigacion,
      institucion: usuario.institucion,
      fotografia_url: usuario.fotografia_url,
      ultimo_grado_estudios: usuario.ultimo_grado_estudios,
      empleo_actual: usuario.empleo_actual,
      nacionalidad: usuario.nacionalidad,
      fecha_nacimiento: usuario.fecha_nacimiento,
      rol: 'investigador'
    }

    return NextResponse.json({ user: userCompleto })
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

