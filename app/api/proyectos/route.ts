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
    console.log("📥 Datos recibidos para crear proyecto:", body)

    // Validar campos requeridos
    const camposRequeridos = ['titulo', 'descripcion', 'investigador_principal', 'fecha_inicio', 'estado', 'categoria']
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
    const proyectoData = {
      titulo: body.titulo,
      descripcion: body.descripcion,
      investigador_principal_id: body.investigador_principal_id || null,
      investigador_principal: body.investigador_principal,
      institucion: body.institucion || null,
      fecha_inicio: body.fecha_inicio,
      fecha_fin: body.fecha_fin || null,
      estado: body.estado,
      area_investigacion: body.area_investigacion || body.categoria,
      categoria: body.categoria,
      presupuesto: body.presupuesto || null,
      fuente_financiamiento: body.fuente_financiamiento || body.financiamiento || null,
      palabras_clave: Array.isArray(body.palabras_clave) ? body.palabras_clave.join(', ') : body.palabras_clave || null,
      objetivos: Array.isArray(body.objetivos) ? body.objetivos.join('\n') : body.objetivos || null,
      resultados: Array.isArray(body.resultados) ? body.resultados.join('\n') : body.resultados || null,
      metodologia: body.metodologia || null,
      impacto: body.impacto || null,
      colaboradores: Array.isArray(body.colaboradores) ? body.colaboradores.join(', ') : body.colaboradores || null,
      archivo: body.archivo || null,
      archivo_url: body.archivoUrl || null,
      slug: slug,
      clerk_user_id: user.id,
      fecha_creacion: new Date().toISOString()
    }

    console.log("💾 Insertando proyecto en base de datos...")

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

    console.log("✅ Proyecto creado exitosamente:", proyecto)

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
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoria = searchParams.get('categoria') || 'all'
    const estado = searchParams.get('estado') || 'all'
    const institucion = searchParams.get('institucion') || 'all'

    const db = await getDatabase()
    
    // Construir query base
    let query = `
      SELECT 
        id,
        titulo,
        descripcion,
        investigador_principal_id,
        investigador_principal,
        fecha_inicio,
        fecha_fin,
        estado,
        area_investigacion,
        categoria,
        presupuesto,
        fuente_financiamiento,
        institucion,
        slug
      FROM proyectos
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Agregar filtros con sintaxis PostgreSQL
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`
      query += ` AND (
        LOWER(titulo) LIKE $${paramIndex} OR 
        LOWER(descripcion) LIKE $${paramIndex + 1} OR 
        LOWER(investigador_principal) LIKE $${paramIndex + 2} OR
        LOWER(institucion) LIKE $${paramIndex + 3}
      )`
      params.push(searchParam, searchParam, searchParam, searchParam)
      paramIndex += 4
    }

    if (categoria !== 'all') {
      query += ` AND categoria = $${paramIndex}`
      params.push(categoria)
      paramIndex += 1
    }

    if (estado !== 'all') {
      query += ` AND estado = $${paramIndex}`
      params.push(estado)
      paramIndex += 1
    }

    if (institucion !== 'all') {
      query += ` AND institucion = $${paramIndex}`
      params.push(institucion)
      paramIndex += 1
    }

    query += ` ORDER BY fecha_inicio DESC NULLS LAST`

    // Ejecutar query
    const result = await db.query(query, params)
    const proyectos = Array.isArray(result) ? result : (result.rows || [])

    // Formatear respuesta
    const proyectosFormateados = proyectos.map((proyecto: any) => ({
      id: proyecto.id,
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      autor: {
        nombre: proyecto.investigador_principal,
        institucion: proyecto.institucion,
        email: null,
        telefono: null
      },
      categoria: proyecto.categoria || proyecto.area_investigacion,
      estado: proyecto.estado,
      fechaInicio: proyecto.fecha_inicio,
      fechaFin: proyecto.fecha_fin,
      presupuesto: proyecto.presupuesto,
      palabrasClave: [],
      objetivos: [],
      resultados: [],
      metodologia: null,
      impacto: null,
      colaboradores: [],
      financiamiento: proyecto.fuente_financiamiento,
      slug: proyecto.slug || proyecto.titulo?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))

    // Obtener opciones únicas para filtros
    const categorias = [...new Set(proyectos.map((p: any) => p.categoria || p.area_investigacion).filter(Boolean))]
    const estados = [...new Set(proyectos.map((p: any) => p.estado).filter(Boolean))]
    const instituciones = [...new Set(proyectos.map((p: any) => p.institucion).filter(Boolean))]

    return NextResponse.json({
      proyectos: proyectosFormateados,
      filtros: {
        categorias: categorias.sort(),
        estados: estados.sort(),
        instituciones: instituciones.sort()
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