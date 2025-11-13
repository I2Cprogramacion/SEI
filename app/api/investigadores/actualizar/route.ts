import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

// Forzar rendering dinámico (usa Clerk auth)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // Obtener el investigador_id desde la base de datos usando el correo
    const db = await getDatabase()
    const investigadorResult = await db.query(
      `SELECT id FROM investigadores WHERE correo = $1 LIMIT 1`,
      [email]
    )

    const investigadorRows = Array.isArray(investigadorResult) 
      ? investigadorResult 
      : (investigadorResult.rows || [])

    if (investigadorRows.length === 0) {
      return NextResponse.json({ 
        error: "No se encontró el perfil de investigador asociado a este usuario" 
      }, { status: 404 })
    }

    const investigadorId = investigadorRows[0].id

    const data = await request.json()

    // Validar que al menos un campo se esté actualizando
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 })
    }

    // Campos permitidos para actualizar (no incluimos correo ni password aquí)
    const camposPermitidos = [
      'nombre_completo', 'nombres', 'apellidos', 'curp', 'rfc', 'no_cvu', 'telefono',
      'ultimo_grado_estudios', 'grado_maximo_estudios', 'empleo_actual', 
      'linea_investigacion', 'area_investigacion', 'disciplina', 'especialidad',
      'nacionalidad', 'fecha_nacimiento', 'genero', 'municipio', 
      'estado_nacimiento', 'entidad_federativa', 'fotografia_url',
      'institucion_id', 'institucion', 'departamento', 'ubicacion', 'sitio_web',
      'orcid', 'nivel', 'nivel_investigador', 'nivel_actual_id', 'fecha_asignacion_nivel'
    ]

    // Construir query dinámicamente solo con los campos que se envían
    const camposActualizar: string[] = []
    const valores: any[] = []
    let paramCount = 1

    Object.keys(data).forEach(key => {
      if (camposPermitidos.includes(key) && data[key] !== undefined) {
        // Convertir strings vacíos a null para campos de fecha y otros opcionales
        let valor = data[key]
        
        // Si es un string vacío y es un campo de fecha o ID, convertir a null
        if (valor === "" && (
          key.includes('fecha') || 
          key.includes('_id') || 
          key === 'orcid' || 
          key === 'nivel'
        )) {
          valor = null
        }
        
        camposActualizar.push(`${key} = $${paramCount}`)
        valores.push(valor)
        paramCount++
      }
    })

    if (camposActualizar.length === 0) {
      return NextResponse.json({ 
        error: "No hay campos válidos para actualizar" 
      }, { status: 400 })
    }

    // Agregar el ID del investigador validado al final para el WHERE
    valores.push(investigadorId)

    const query = `
      UPDATE investigadores 
      SET ${camposActualizar.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nombre_completo, correo, clerk_user_id
    `

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
    return NextResponse.json({
      error: `Error al actualizar el perfil: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
