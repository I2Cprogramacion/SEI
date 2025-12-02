import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

type ContactoJSON = {
  nombreContacto?: string
  cargo?: string
  telefono?: string
  email?: string
  extension?: string
}

type DomicilioJSON = {
  calle?: string
  numeroExterior?: string
  numeroInterior?: string
  colonia?: string
  codigoPostal?: string
  municipio?: string
  estado?: string
  pais?: string
}

type RepresentanteJSON = {
  nombre?: string
  cargo?: string
  rfc?: string
  telefono?: string
  email?: string
}

function parseJSON<T>(value: any, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (Array.isArray(value) || typeof value === "object") return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "ID de institución requerido" }, { status: 400 })
  }

  try {
    const db = await getDatabase()
    const rows = await db.query(
      `
        SELECT 
          id,
          nombre,
          siglas,
          tipo,
          tipo_otro_especificar,
          año_fundacion,
          sitio_web,
          imagen_url,
          descripcion,
          tipo_persona,
          rfc,
          razon_social,
          regimen_fiscal,
          actividad_economica,
          curp,
          nombre_completo,
          numero_escritura,
          fecha_constitucion,
          notario_publico,
          numero_notaria,
          registro_publico,
          objeto_social,
          domicilio_fiscal,
          representante_legal,
          contacto_institucional,
          areas_investigacion,
          capacidad_investigacion,
          documentos,
          ubicacion,
          activo,
          estado,
          created_at,
          updated_at
        FROM institutions
        WHERE id = $1
      `,
      [id]
    )

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Institución no encontrada" }, { status: 404 })
    }

    const row = rows[0]

    const institucion = {
      id: row.id,
      nombre: row.nombre,
      siglas: row.siglas ?? null,
      tipo: row.tipo ?? null,
      tipoOtroEspecificar: row.tipo_otro_especificar ?? null,
      añoFundacion: row.año_fundacion ?? null,
      sitioWeb: row.sitio_web ?? null,
      imagenUrl: row.imagen_url ?? null,
      descripcion: row.descripcion ?? null,
      tipoPersona: row.tipo_persona ?? null,
      rfc: row.rfc ?? null,
      razonSocial: row.razon_social ?? null,
      regimenFiscal: row.regimen_fiscal ?? null,
      actividadEconomica: row.actividad_economica ?? null,
      curp: row.curp ?? null,
      nombreCompleto: row.nombre_completo ?? null,
      numeroEscritura: row.numero_escritura ?? null,
      fechaConstitucion: row.fecha_constitucion ?? null,
      notarioPublico: row.notario_publico ?? null,
      numeroNotaria: row.numero_notaria ?? null,
      registroPublico: row.registro_publico ?? null,
      objetoSocial: row.objeto_social ?? null,
      domicilioFiscal: parseJSON<DomicilioJSON | null>(row.domicilio_fiscal, null),
      representanteLegal: parseJSON<RepresentanteJSON | null>(row.representante_legal, null),
      contactoInstitucional: parseJSON<ContactoJSON | null>(row.contacto_institucional, null),
      areasInvestigacion: parseJSON<string[]>(row.areas_investigacion, []),
      capacidadInvestigacion: row.capacidad_investigacion ?? null,
      documentos: parseJSON<Record<string, string>>(row.documentos, {}),
      ubicacion: row.ubicacion ?? null,
      activo: row.activo ?? false,
      estado: row.estado ?? "PENDIENTE",
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({ institucion })
  } catch (error) {
    console.error("❌ Error al obtener institución por ID:", error)
    return NextResponse.json(
      {
        error: "Error interno al obtener la institución"
      },
      { status: 500 }
    )
  }
}

// PUT - Actualizar institución
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "ID de institución requerido" }, { status: 400 })
  }

  try {
    const body = await request.json()
    console.log("📥 Actualizando institución:", id, body)

    const db = await getDatabase()

    // Verificar que la institución existe
    const existingRows = await db.query(
      `SELECT id FROM institutions WHERE id = $1`,
      [id]
    )

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ error: "Institución no encontrada" }, { status: 404 })
    }

    // Construir query de actualización dinámicamente
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Mapeo de campos del body a columnas de la base de datos
    const fieldMapping: Record<string, string> = {
      nombre: 'nombre',
      siglas: 'siglas',
      tipo: 'tipo',
      tipoOtroEspecificar: 'tipo_otro_especificar',
      añoFundacion: 'año_fundacion',
      sitioWeb: 'sitio_web',
      imagenUrl: 'imagen_url',
      descripcion: 'descripcion',
      tipoPersona: 'tipo_persona',
      rfc: 'rfc',
      razonSocial: 'razon_social',
      regimenFiscal: 'regimen_fiscal',
      actividadEconomica: 'actividad_economica',
      curp: 'curp',
      nombreCompleto: 'nombre_completo',
      numeroEscritura: 'numero_escritura',
      fechaConstitucion: 'fecha_constitucion',
      notarioPublico: 'notario_publico',
      numeroNotaria: 'numero_notaria',
      registroPublico: 'registro_publico',
      objetoSocial: 'objeto_social',
      capacidadInvestigacion: 'capacidad_investigacion',
      ubicacion: 'ubicacion',
      activo: 'activo',
      estado: 'estado',
    }

    // Campos JSON que requieren serialización
    const jsonFields = ['domicilioFiscal', 'representanteLegal', 'contactoInstitucional', 'areasInvestigacion', 'documentos']
    const jsonFieldMapping: Record<string, string> = {
      domicilioFiscal: 'domicilio_fiscal',
      representanteLegal: 'representante_legal',
      contactoInstitucional: 'contacto_institucional',
      areasInvestigacion: 'areas_investigacion',
      documentos: 'documentos',
    }

    // Procesar campos normales
    for (const [jsField, dbColumn] of Object.entries(fieldMapping)) {
      if (body[jsField] !== undefined) {
        updateFields.push(`${dbColumn} = $${paramIndex}`)
        values.push(body[jsField])
        paramIndex++
      }
    }

    // Procesar campos JSON
    for (const jsField of jsonFields) {
      if (body[jsField] !== undefined) {
        const dbColumn = jsonFieldMapping[jsField]
        updateFields.push(`${dbColumn} = $${paramIndex}::jsonb`)
        values.push(body[jsField] ? JSON.stringify(body[jsField]) : null)
        paramIndex++
      }
    }

    // Siempre actualizar updated_at
    updateFields.push(`updated_at = NOW()`)

    if (updateFields.length === 1) {
      // Solo updated_at, nada que actualizar
      return NextResponse.json({ 
        success: true, 
        message: "No hay cambios para actualizar" 
      })
    }

    // Agregar el ID al final de los valores
    values.push(id)

    const query = `
      UPDATE institutions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nombre, tipo, estado
    `

    console.log("📝 Query de actualización:", query)
    console.log("📝 Valores:", values)

    const result = await db.query(query, values)
    const institucion = Array.isArray(result) ? result[0] : result.rows?.[0]

    console.log("✅ Institución actualizada:", institucion)

    return NextResponse.json({
      success: true,
      message: "Institución actualizada exitosamente",
      institucion
    })

  } catch (error) {
    console.error("❌ Error al actualizar institución:", error)
    return NextResponse.json(
      {
        error: "Error al actualizar la institución",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar institución
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "ID de institución requerido" }, { status: 400 })
  }

  try {
    const db = await getDatabase()

    // Verificar que la institución existe
    const existingRows = await db.query(
      `SELECT id, nombre FROM institutions WHERE id = $1`,
      [id]
    )

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ error: "Institución no encontrada" }, { status: 404 })
    }

    const nombreInstitucion = existingRows[0].nombre

    // Eliminar la institución
    await db.query(`DELETE FROM institutions WHERE id = $1`, [id])

    console.log("🗑️ Institución eliminada:", id, nombreInstitucion)

    return NextResponse.json({
      success: true,
      message: `Institución "${nombreInstitucion}" eliminada exitosamente`
    })

  } catch (error) {
    console.error("❌ Error al eliminar institución:", error)
    return NextResponse.json(
      {
        error: "Error al eliminar la institución",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
