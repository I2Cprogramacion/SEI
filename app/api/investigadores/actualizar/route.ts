import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

export async function PUT(request: NextRequest) {
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

    const data = await request.json()
    console.log("Datos recibidos para actualización:", data)

    // Validar que al menos un campo se esté actualizando
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 })
    }

    // Campos permitidos para actualizar (no incluimos correo ni password aquí)
    const camposPermitidos = [
      'nombre_completo', 'curp', 'rfc', 'no_cvu', 'telefono',
      'ultimo_grado_estudios', 'empleo_actual', 'linea_investigacion',
      'area_investigacion', 'nacionalidad', 'fecha_nacimiento', 'fotografia_url'
    ]

    // Construir query dinámicamente solo con los campos que se envían
    const camposActualizar: string[] = []
    const valores: any[] = []
    let paramCount = 1

    Object.keys(data).forEach(key => {
      if (camposPermitidos.includes(key) && data[key] !== undefined) {
        camposActualizar.push(`${key} = $${paramCount}`)
        valores.push(data[key])
        paramCount++
      }
    })

    if (camposActualizar.length === 0) {
      return NextResponse.json({ 
        error: "No hay campos válidos para actualizar" 
      }, { status: 400 })
    }

    // Agregar el email al final para el WHERE
    valores.push(email)

    const query = `
      UPDATE investigadores 
      SET ${camposActualizar.join(', ')}
      WHERE correo = $${paramCount}
      RETURNING id, nombre_completo, correo
    `

    console.log("Query SQL:", query)
    console.log("Valores:", valores)

    const db = await getDatabase()
    const result = await db.query(query, valores)

    const rows = Array.isArray(result) ? result : (result.rows || [])
    const rowCount = Array.isArray(result) ? result.length : (result.rowCount || 0)

    if (rowCount === 0) {
      return NextResponse.json({ 
        error: "No se encontró el perfil para actualizar" 
      }, { status: 404 })
    }

    const actualizado = rows[0]

    return NextResponse.json({
      success: true,
      message: `✅ Perfil actualizado exitosamente para ${actualizado.nombre_completo}`,
      data: actualizado
    })
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return NextResponse.json({
      error: `Error al actualizar el perfil: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
