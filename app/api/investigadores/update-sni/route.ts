import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

export async function POST(request: NextRequest) {
  try {
    // Obtener el usuario autenticado de Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json({ error: "No se pudo obtener el email del usuario" }, { status: 400 })
    }

    // Obtener el sni_url del body (puede ser null para eliminar)
    const { sni_url } = await request.json()

    // Si sni_url es undefined (no se envió), rechazar la petición
    if (sni_url === undefined) {
      return NextResponse.json({ error: "sni_url es requerido" }, { status: 400 })
    }

    // Actualizar el SNI en la base de datos
    const db = await getDatabase()
    const query = `
      UPDATE investigadores 
      SET sni_url = $1 
      WHERE correo = $2
      RETURNING id, nombre_completo, sni_url
    `
    
    const result = await db.query(query, [sni_url, email])
    const rows = Array.isArray(result) ? result : (result.rows || [])

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "No se pudo actualizar el SNI",
        message: "No se encontró un perfil de investigador asociado a este correo"
      }, { status: 404 })
    }

    const investigador = rows[0]

    return NextResponse.json({
      success: true,
      message: "SNI actualizado exitosamente",
      data: {
        id: investigador.id,
        nombre_completo: investigador.nombre_completo,
        sni_url: investigador.sni_url
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: `Error al actualizar el SNI: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}


