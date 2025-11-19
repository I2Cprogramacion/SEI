import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = 'force-dynamic'

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = {
      titulo: body.titulo?.trim(),
      descripcion: body.descripcion?.trim(),
      resumen: body.resumen?.trim() || body.abstract?.trim() || null,
      investigadorPrincipal: body.investigador_principal?.trim() || body.autor?.trim() || body.investigadorPrincipal?.trim(),
      investigadorPrincipalId: body.investigador_principal_id || body.autor_id || null,
      institucion: body.institucion?.trim() || body.institucionPrincipal?.trim() || null,
      fechaInicio: body.fecha_inicio || body.fechaInicio || null,
      fechaFin: body.fecha_fin || body.fechaFin || null,
      estado: body.estado || body.status || null,
      categoria: body.categoria || body.area_investigacion || body.area?.trim() || null,
      areaInvestigacion: body.area_investigacion || body.area?.trim() || null,
      presupuesto: body.presupuesto || body.presupuestoEstimado || null,
      financiamiento: body.fuente_financiamiento || body.financiamiento || null,
      palabrasClave: body.palabras_clave ?? body.palabrasClave ?? [],
      objetivos: body.objetivos ?? [],
      resultados: body.resultados ?? [],
      metodologia: body.metodologia ?? null,
      impacto: body.impacto ?? null,
      colaboradores: body.colaboradores ?? [],
      archivo: body.archivo ?? null,
      archivoUrl: body.archivoUrl ?? body.archivo_url ?? null,
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("📥 Datos recibidos para crear proyecto:", body)
      console.log("🛠 Datos normalizados:", data)
    }

    const camposRequeridos: { key: string; value: any }[] = [
      { key: 'titulo', value: data.titulo },
      { key: 'descripcion', value: data.descripcion },
      { key: 'investigador_principal', value: data.investigadorPrincipal },
      { key: 'fecha_inicio', value: data.fechaInicio },
      { key: 'estado', value: data.estado },
      { key: 'categoria', value: data.categoria },
    ]
    const camposFaltantes = camposRequeridos.filter(campo => !campo.value || (typeof campo.value === 'string' && campo.value.trim() === ''))
    
    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        { 
          error: "Campos requeridos faltantes",
          campos: camposFaltantes.map(item => item.key)
        },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Generar slug único
    const slug = body.titulo
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Preparar datos del proyecto
    const palabrasClaveStr = Array.isArray(data.palabrasClave)
      ? data.palabrasClave.map((palabra: any) => typeof palabra === 'string' ? palabra.trim() : '').filter(Boolean).join(', ')
      : (typeof data.palabrasClave === 'string' ? data.palabrasClave : null)

    const objetivosStr = Array.isArray(data.objetivos)
      ? data.objetivos.map((objetivo: any) => typeof objetivo === 'string' ? objetivo.trim() : '').filter(Boolean).join('\n')
      : (typeof data.objetivos === 'string' ? data.objetivos : null)

    const resultadosStr = Array.isArray(data.resultados)
      ? data.resultados.map((resultado: any) => typeof resultado === 'string' ? resultado.trim() : '').filter(Boolean).join('\n')
      : (typeof data.resultados === 'string' ? data.resultados : null)

    const colaboradoresStr = Array.isArray(data.colaboradores)
      ? data.colaboradores.map((colaborador: any) => {
          if (!colaborador) return ""
          const nombre = colaborador.nombre || colaborador.name || ""
          const institucion = colaborador.institucion || colaborador.organization || ""
          const rol = colaborador.rol || colaborador.role || ""
          return [nombre, institucion, rol].filter(Boolean).join(" - ")
        }).filter(Boolean).join("; ")
      : (typeof data.colaboradores === 'string' ? data.colaboradores : null)

    const proyectoData = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      investigador_principal_id: data.investigadorPrincipalId,
      investigador_principal: data.investigadorPrincipal,
      institucion: data.institucion,
      fecha_inicio: data.fechaInicio,
      fecha_fin: data.fechaFin,
      estado: data.estado,
      area_investigacion: data.areaInvestigacion || data.categoria,
      categoria: data.categoria,
      presupuesto: data.presupuesto || null,
      fuente_financiamiento: data.financiamiento || null,
      palabras_clave: palabrasClaveStr,
      objetivos: objetivosStr,
      resultados: resultadosStr,
      metodologia: data.metodologia || null,
      impacto: data.impacto || null,
      colaboradores: colaboradoresStr,
      archivo: data.archivo || null,
      archivo_url: data.archivoUrl || null,
      slug: slug,
      clerk_user_id: user.id,
      fecha_creacion: new Date().toISOString()
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log("💾 Insertando proyecto en base de datos...")
    }

    // Insertar en la base de datos
    const query = `
      INSERT INTO proyectos (
        titulo, descripcion, investigador_principal_id, investigador_principal,
        institucion, fecha_inicio, fecha_fin, estado, area_investigacion,
        categoria, presupuesto, fuente_financiamiento, palabras_clave,
        objetivos, resultados, metodologia, impacto, colaboradores,
        archivo, archivo_url, slug, clerk_user_id, fecha_creacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING id, titulo, slug
    `

    const values = [
      proyectoData.titulo,
      proyectoData.descripcion,
      proyectoData.investigador_principal_id,
      proyectoData.investigador_principal,
      proyectoData.institucion,
      proyectoData.fecha_inicio,
      proyectoData.fecha_fin,
      proyectoData.estado,
      proyectoData.area_investigacion,
      proyectoData.categoria,
      proyectoData.presupuesto,
      proyectoData.fuente_financiamiento,
      proyectoData.palabras_clave,
      proyectoData.objetivos,
      proyectoData.resultados,
      proyectoData.metodologia,
      proyectoData.impacto,
      proyectoData.colaboradores,
      proyectoData.archivo,
      proyectoData.archivo_url,
      proyectoData.slug,
      proyectoData.clerk_user_id,
      proyectoData.fecha_creacion
    ]

    const result = await db.query(query, values)
    const proyecto = Array.isArray(result) ? result[0] : result.rows[0]

    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ Proyecto creado exitosamente:", proyecto)
    }

    return NextResponse.json({
      success: true,
      message: "Proyecto creado exitosamente",
      proyecto: {
        id: proyecto.id,
        titulo: proyecto.titulo,
        slug: proyecto.slug
      }
    }, { status: 201 })

  } catch (error) {
    console.error("❌ Error al crear proyecto:", error)
    
    // Manejo de errores específicos de PostgreSQL
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: "Ya existe un proyecto con ese título" },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Error al crear el proyecto",
          details: error.message 
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

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get("q")?.toLowerCase() || ""
    const estadoFilter = url.searchParams.get("estado") || ""
    const categoriaFilter = url.searchParams.get("categoria") || ""
    const institucionFilter = url.searchParams.get("institucion") || ""

    let query = `
      SELECT
        id,
        titulo,
        descripcion,
        resumen,
        investigador_principal AS autor,
        institucion,
        fecha_inicio,
        fecha_fin,
        estado,
        categoria,
        area_investigacion,
        presupuesto,
        fuente_financiamiento,
        palabras_clave,
        objetivos,
        resultados,
        metodologia,
        impacto,
        colaboradores,
        archivo_url,
        slug,
        fecha_creacion
      FROM proyectos
      WHERE 1=1
    `

    const conditions: any[] = []

    if (searchTerm) {
      conditions.push(`(LOWER(titulo) LIKE $${conditions.length + 1} OR LOWER(descripcion) LIKE $${conditions.length + 1} OR LOWER(investigador_principal) LIKE $${conditions.length + 1})`)
      conditions.push(`%${searchTerm}%`)
    }

    if (estadoFilter) {
      conditions.push(`estado = $${conditions.length + 1}`)
      conditions.push(estadoFilter)
    }

    if (categoriaFilter) {
      conditions.push(`categoria = $${conditions.length + 1}`)
      conditions.push(categoriaFilter)
    }

    if (institucionFilter) {
      conditions.push(`institucion = $${conditions.length + 1}`)
      conditions.push(institucionFilter)
    }

    const whereClauses = []
    const values: any[] = []
    for (let i = 0; i < conditions.length; i += 2) {
      whereClauses.push(conditions[i])
      values.push(conditions[i + 1])
    }

    if (whereClauses.length > 0) {
      query += ` AND ${whereClauses.join(" AND ")}`
    }

    query += ` ORDER BY fecha_creacion DESC`

    const result = await db.query(query, values)
    const rows = Array.isArray(result) ? result : result.rows || []

    const formatArray = (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      return String(value)
        .split(/[,\n;]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }

    const proyectos = rows.map((row: any) => {
      // Formatear colaboradores: si es string con formato "nombre - institucion - rol", parsearlo
      const colaboradoresFormateados = formatArray(row.colaboradores).map((colab: string) => {
        if (typeof colab === 'string' && colab.includes(' - ')) {
          const partes = colab.split(' - ')
          return {
            nombre: partes[0] || '',
            institucion: partes[1] || '',
            rol: partes[2] || ''
          }
        }
        return colab
      })

      return {
        id: row.id,
        titulo: row.titulo || '',
        descripcion: row.descripcion || '',
        resumen: row.resumen || '',
        investigador_principal: row.autor || row.investigador_principal || '',
        autor: row.autor ? {
          nombre: row.autor,
          institucion: row.institucion || ''
        } : { nombre: '', institucion: '' },
        institucion: row.institucion || '',
        fecha_inicio: row.fecha_inicio || null,
        fecha_fin: row.fecha_fin || null,
        fechaInicio: row.fecha_inicio || null,
        fechaFin: row.fecha_fin || null,
        estado: row.estado || '',
        categoria: row.categoria || '',
        area_investigacion: row.area_investigacion || '',
        areaInvestigacion: row.area_investigacion || '',
        presupuesto: row.presupuesto || null,
        financiamiento: row.fuente_financiamiento || null,
        palabrasClave: formatArray(row.palabras_clave),
        objetivos: formatArray(row.objetivos),
        resultados: formatArray(row.resultados),
        metodologia: row.metodologia || null,
        impacto: row.impacto || null,
        colaboradores: colaboradoresFormateados,
        archivoUrl: row.archivo_url || null,
        slug: row.slug || '',
        fecha_registro: row.fecha_creacion || null,
        fechaCreacion: row.fecha_creacion || null
      }
    })

    const filtrosQuery = await db.query(`
      SELECT
        ARRAY(SELECT DISTINCT categoria FROM proyectos WHERE categoria IS NOT NULL AND categoria <> '' ORDER BY categoria) AS categorias,
        ARRAY(SELECT DISTINCT estado FROM proyectos WHERE estado IS NOT NULL AND estado <> '' ORDER BY estado) AS estados,
        ARRAY(SELECT DISTINCT institucion FROM proyectos WHERE institucion IS NOT NULL AND institucion <> '' ORDER BY institucion) AS instituciones
    `)

    const filtrosRow = Array.isArray(filtrosQuery) ? filtrosQuery[0] : filtrosQuery.rows?.[0]

    return NextResponse.json({
      proyectos,
      filtros: {
        categorias: filtrosRow?.categorias || [],
        estados: filtrosRow?.estados || [],
        instituciones: filtrosRow?.instituciones || []
      }
    })

  } catch (error) {
    console.error("Error al obtener proyectos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}