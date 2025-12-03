import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/investigadores/[id]
 * Obtiene todos los datos de un investigador (solo para admins)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: "Email no encontrado" }, { status: 400 })
    }

    // Verificar que el usuario sea admin
    const db = await getDatabase()
    const adminCheck = await db.query(
      `SELECT es_admin FROM investigadores WHERE LOWER(correo) = $1 LIMIT 1`,
      [email.toLowerCase()]
    )
    
    const adminRows = Array.isArray(adminCheck) ? adminCheck : (adminCheck.rows || [])
    if (adminRows.length === 0 || !adminRows[0].es_admin) {
      return NextResponse.json({ error: "No autorizado - Solo admins" }, { status: 403 })
    }

    // Obtener el investigador por ID o slug
    const { id } = params
    const isNumeric = /^\d+$/.test(id)
    
    console.log('Admin GET - Buscando investigador:', { id, isNumeric })
    
    // Usar SELECT * para evitar problemas con columnas que puedan no existir
    const query = `
      SELECT *
      FROM investigadores
      WHERE ${isNumeric ? 'id = $1' : 'slug = $1'}
      LIMIT 1
    `

    const result = await db.query(query, [isNumeric ? Number(id) : id])
    console.log('Admin GET - Resultado query:', result ? 'OK' : 'NULL')
    const rows = Array.isArray(result) ? result : (result.rows || [])

    if (rows.length === 0) {
      return NextResponse.json({ error: "Investigador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error al obtener investigador:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/investigadores/[id]
 * Actualiza un investigador (solo para admins)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: "Email no encontrado" }, { status: 400 })
    }

    // Verificar que el usuario sea admin
    const db = await getDatabase()
    const adminCheck = await db.query(
      `SELECT es_admin FROM investigadores WHERE LOWER(correo) = $1 LIMIT 1`,
      [email.toLowerCase()]
    )
    
    const adminRows = Array.isArray(adminCheck) ? adminCheck : (adminCheck.rows || [])
    if (adminRows.length === 0 || !adminRows[0].es_admin) {
      return NextResponse.json({ error: "No autorizado - Solo admins" }, { status: 403 })
    }

    const { id } = params
    const isNumeric = /^\d+$/.test(id)
    const data = await request.json()

    // Validar que haya datos para actualizar
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 })
    }

    // Campos permitidos para actualizar (solo los que existen en el registro)
    const camposPermitidos = [
      // Datos personales básicos
      'nombre_completo', 'nombres', 'apellidos', 'curp', 'rfc', 'no_cvu', 'telefono',
      'nacionalidad', 'fecha_nacimiento', 'genero', 'municipio',
      'estado_nacimiento', 'entidad_federativa', 'fotografia_url',
      
      // Datos institucionales
      'institucion_id', 'institucion', 'departamento', 'ubicacion', 'sitio_web',
      
      // Formación académica
      'ultimo_grado_estudios', 'grado_maximo_estudios', 'empleo_actual',
      
      // Investigación y nivel
      'linea_investigacion', 'area_investigacion', 'disciplina', 'especialidad',
      'orcid', 'nivel', 'nivel_investigador', 'nivel_actual_id', 'fecha_asignacion_nivel',
      'nivel_sni', 'sni', 'anio_sni',
      'puntaje_total', 'estado_evaluacion',
      
      // Producción académica
      'experiencia_docente', 'experiencia_laboral', 'proyectos_investigacion',
      'proyectos_vinculacion', 'libros', 'capitulos_libros', 'articulos',
      'premios_distinciones', 'idiomas', 'colaboracion_internacional',
      'colaboracion_nacional', 'cv_url',
      
      // Campos exclusivos de admin
      'es_admin', 'activo', 'perfil_publico', 'correo'
    ]

    // Construir query dinámicamente
    const camposActualizar: string[] = []
    const valores: any[] = []
    let paramCount = 1

    Object.keys(data).forEach(key => {
      if (camposPermitidos.includes(key) && data[key] !== undefined) {
        let valor = data[key]
        
        // Convertir strings vacíos a null para campos opcionales
        if (valor === "" && (
          key.includes('fecha') ||
          key.includes('_id') ||
          key === 'orcid' ||
          key === 'nivel' ||
          key === 'anio_sni'
        )) {
          valor = null
        }
        
        // Convertir anio_sni a número
        if (key === 'anio_sni' && valor && typeof valor === 'string') {
          valor = parseInt(valor, 10)
          if (isNaN(valor)) {
            valor = null
          }
        }
        
        // Convertir booleanos si vienen como strings
        if ((key === 'es_admin' || key === 'activo' || key === 'perfil_publico') && typeof valor === 'string') {
          valor = valor === 'true' || valor === '1'
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

    // Agregar el ID al final para el WHERE
    valores.push(isNumeric ? Number(id) : id)

    const query = `
      UPDATE investigadores
      SET ${camposActualizar.join(', ')}
      WHERE ${isNumeric ? 'id' : 'slug'} = $${paramCount}
      RETURNING id, nombre_completo, correo, es_admin, activo
    `

    const result = await db.query(query, valores)
    const rows = Array.isArray(result) ? result : (result.rows || [])
    const rowCount = Array.isArray(result) ? result.length : (result.rowCount || 0)

    if (rowCount === 0) {
      return NextResponse.json({
        error: "No se encontró el investigador para actualizar"
      }, { status: 404 })
    }

    const actualizado = rows[0]

    return NextResponse.json({
      success: true,
      message: `✅ Perfil de ${actualizado.nombre_completo} actualizado exitosamente`,
      data: actualizado
    })
  } catch (error) {
    console.error("Error al actualizar investigador:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}
