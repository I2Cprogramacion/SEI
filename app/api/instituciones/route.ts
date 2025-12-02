import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

type ContactoJSON = {
  nombreContacto?: string
  cargo?: string
  telefono?: string
  email?: string
  extension?: string
}

export const dynamic = 'force-dynamic'

function parseJSON<T>(value: any, fallback: T): T {
  if (!value) return fallback
  if (Array.isArray(value) || typeof value === "object") return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isAdmin = searchParams.get('admin') === 'true'
    
    const db = await getDatabase()

    // Si es admin, mostrar todas. Si es público, solo aprobadas y activas
    const whereClause = isAdmin 
      ? '' 
      : "WHERE estado = 'APROBADA' AND activo = true"

    const rows = await db.query(`
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
        ubicacion,
        estado,
        activo,
        areas_investigacion,
        documentos,
        contacto_institucional,
        created_at,
        updated_at
      FROM institutions
      ${whereClause}
      ORDER BY created_at DESC NULLS LAST
    `)

    const instituciones = rows.map((row: any) => {
      const areasInvestigacion = parseJSON<string[]>(row.areas_investigacion, [])
      const documentos = parseJSON<Record<string, string>>(row.documentos, {})
      const contacto = parseJSON<ContactoJSON | null>(row.contacto_institucional, null)

      return {
        id: row.id,
        nombre: row.nombre,
        siglas: row.siglas ?? null,
        tipo: row.tipo ?? null,
        tipoOtroEspecificar: row.tipo_otro_especificar ?? null,
        añoFundacion: row.año_fundacion ?? null,
        sitioWeb: row.sitio_web ?? null,
        imagenUrl: row.imagen_url ?? null,
        descripcion: row.descripcion ?? null,
        ubicacion: row.ubicacion ?? null,
        estado: row.estado ?? 'PENDIENTE',
        activo: row.activo ?? false,
        areasInvestigacion,
        documentos,
        contacto,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    })

    return NextResponse.json({ instituciones })
  } catch (error) {
    console.error("❌ Error al obtener instituciones:", error)
    return NextResponse.json({ 
      instituciones: [],
      error: "Error interno al obtener las instituciones" 
    }, { status: 500 })
  }
}

// POST - Crear nueva institución
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 Datos recibidos para crear institución:", body)

    // Validar campos requeridos
    const camposRequeridos = ['nombre', 'tipo', 'añoFundacion', 'descripcion', 'rfc', 'razonSocial', 'regimenFiscal']
    const camposFaltantes = camposRequeridos.filter(campo => !body[campo])
    
    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        { 
          error: "Campos requeridos faltantes",
          campos: camposFaltantes
        },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Preparar datos de la institución
    const institucionData = {
      nombre: body.nombre,
      siglas: body.siglas || null,
      tipo: body.tipo,
      tipo_otro_especificar: body.tipoOtroEspecificar || null,
      año_fundacion: body.añoFundacion || null,
      sitio_web: body.sitioWeb || null,
      imagen_url: body.imagenUrl || null,
      descripcion: body.descripcion || null,
      
      // Régimen fiscal
      tipo_persona: body.tipoPersona || 'moral',
      rfc: body.rfc?.toUpperCase() || null,
      razon_social: body.razonSocial || null,
      regimen_fiscal: body.regimenFiscal || null,
      actividad_economica: body.actividadEconomica || null,
      
      // Persona física específicos
      curp: body.curp?.toUpperCase() || null,
      nombre_completo: body.nombreCompleto || null,
      
      // Persona moral específicos
      numero_escritura: body.numeroEscritura || null,
      fecha_constitucion: body.fechaConstitucion || null,
      notario_publico: body.notarioPublico || null,
      numero_notaria: body.numeroNotaria || null,
      registro_publico: body.registroPublico || null,
      objeto_social: body.objetoSocial || null,
      
      // Domicilio fiscal (JSON)
      domicilio_fiscal: body.domicilioFiscal ? JSON.stringify(body.domicilioFiscal) : null,
      
      // Representante legal (JSON)
      representante_legal: body.representanteLegal ? JSON.stringify(body.representanteLegal) : null,
      
      // Contacto institucional (JSON)
      contacto_institucional: body.contactoInstitucional ? JSON.stringify(body.contactoInstitucional) : null,
      
      // Áreas de investigación (JSON array)
      areas_investigacion: body.areasInvestigacion ? JSON.stringify(body.areasInvestigacion) : null,
      
      // Capacidad de investigación
      capacidad_investigacion: body.capacidadInvestigacion || null,
      
      // Documentos (JSON)
      documentos: body.documentos ? JSON.stringify(body.documentos) : null,
      
      // Estado
      activo: true,
      estado: 'PENDIENTE',
      
      // Ubicación (extraer del domicilio fiscal si existe)
      ubicacion: body.domicilioFiscal 
        ? `${body.domicilioFiscal.municipio || ''}, ${body.domicilioFiscal.estado || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
        : null
    }

    console.log("💾 Insertando institución en base de datos...")

    // Generar ID único (similar a cuid() de Prisma)
    // Usamos una combinación de timestamp y random para generar un ID único
    const generateId = () => {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 15)
      return `inst_${timestamp}${random}`.substring(0, 25) // Limitar a 25 caracteres
    }
    
    const institutionId = generateId()

    // Insertar en la base de datos
    const query = `
      INSERT INTO institutions (
        id, nombre, siglas, tipo, tipo_otro_especificar, año_fundacion, sitio_web, imagen_url, descripcion,
        tipo_persona, rfc, razon_social, regimen_fiscal, actividad_economica,
        curp, nombre_completo,
        numero_escritura, fecha_constitucion, notario_publico, numero_notaria, registro_publico, objeto_social,
        domicilio_fiscal, representante_legal, contacto_institucional,
        areas_investigacion, capacidad_investigacion, documentos,
        ubicacion, activo, estado, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16,
        $17, $18, $19, $20, $21, $22,
        $23::jsonb, $24::jsonb, $25::jsonb,
        $26::jsonb, $27, $28::jsonb,
        $29, $30, $31, NOW(), NOW()
      ) RETURNING id, nombre, tipo, estado
    `

    const values = [
      institutionId, // ID generado
      institucionData.nombre,
      institucionData.siglas,
      institucionData.tipo,
      institucionData.tipo_otro_especificar,
      institucionData.año_fundacion,
      institucionData.sitio_web,
      institucionData.imagen_url,
      institucionData.descripcion,
      institucionData.tipo_persona,
      institucionData.rfc,
      institucionData.razon_social,
      institucionData.regimen_fiscal,
      institucionData.actividad_economica,
      institucionData.curp,
      institucionData.nombre_completo,
      institucionData.numero_escritura,
      institucionData.fecha_constitucion,
      institucionData.notario_publico,
      institucionData.numero_notaria,
      institucionData.registro_publico,
      institucionData.objeto_social,
      institucionData.domicilio_fiscal,
      institucionData.representante_legal,
      institucionData.contacto_institucional,
      institucionData.areas_investigacion,
      institucionData.capacidad_investigacion,
      institucionData.documentos,
      institucionData.ubicacion,
      institucionData.activo,
      institucionData.estado
    ]

    try {
      const result = await db.query(query, values)
      const institucion = Array.isArray(result) ? result[0] : result.rows[0]

      console.log("✅ Institución creada exitosamente:", institucion)

    return NextResponse.json({
      success: true,
      message: "Institución registrada exitosamente",
      institucion: {
        id: institucion.id,
        nombre: institucion.nombre,
        tipo: institucion.tipo,
        estado: institucion.estado
      }
    }, { status: 201 })

    } catch (dbError) {
      console.error("❌ Error al ejecutar query:", dbError)
      throw dbError
    }
  } catch (error) {
    console.error("❌ Error al crear institución:", error)
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    
    // Manejo de errores específicos de PostgreSQL
    if (error instanceof Error) {
      // Error de columna faltante
      if (error.message.includes('does not exist') || 
          error.message.includes('column') || 
          error.message.includes('undefined column') ||
          error.message.includes('relation') ||
          error.message.includes('syntax error at or near')) {
        
        // Intentar identificar qué columna falta
        const columnMatch = error.message.match(/column "?(\w+)"? does not exist/i) || 
                           error.message.match(/column (\w+) does not exist/i)
        const missingColumn = columnMatch ? columnMatch[1] : 'desconocida'
        
        return NextResponse.json(
          { 
            error: "La tabla de instituciones no tiene todas las columnas necesarias",
            details: `Columna faltante: ${missingColumn}`,
            message: error.message,
            hint: "Ejecuta el script de migración SQL en Neon Console: scripts/migrate-institutions-table.sql",
            sqlError: error.message
          },
          { status: 500 }
        )
      }
      
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: "Ya existe una institución con ese RFC o nombre" },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Error al registrar la institución",
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
