import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = 'force-dynamic'

// POST - Crear nueva publicación
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
    console.log("📥 Datos recibidos para crear publicación:", body)

    // Validar campos requeridos
    const camposRequeridos = ['titulo', 'autor', 'año_creacion', 'categoria', 'tipo']
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

    // Preparar datos de la publicación
    const publicacionData = {
      titulo: body.titulo,
      autor: Array.isArray(body.autor) ? body.autor.join(', ') : body.autor,
      institucion: body.institucion || null,
      editorial: body.editorial || body.revista || null,
      año_creacion: parseInt(body.año_creacion) || parseInt(body.año),
      doi: body.doi || null,
      resumen: body.resumen || null,
      palabras_clave: Array.isArray(body.palabras_clave) 
        ? body.palabras_clave.join(', ') 
        : body.palabras_clave || null,
      categoria: body.categoria,
      tipo: body.tipo,
      acceso: body.acceso || 'abierto',
      volumen: body.volumen || null,
      numero: body.numero || null,
      paginas: body.paginas || null,
      archivo: body.archivo || null,
      archivo_url: body.archivo_url || body.archivoUrl || null,
      clerk_user_id: user.id,
      fecha_creacion: new Date().toISOString()
    }

    console.log("💾 Insertando publicación en base de datos...")

    // Insertar en la base de datos
    const query = `
      INSERT INTO publicaciones (
        titulo, autor, institucion, editorial, año_creacion, doi,
        resumen, palabras_clave, categoria, tipo, acceso, volumen,
        numero, paginas, archivo, archivo_url, clerk_user_id, fecha_creacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18
      ) RETURNING id, titulo, año_creacion
    `

    const values = [
      publicacionData.titulo,
      publicacionData.autor,
      publicacionData.institucion,
      publicacionData.editorial,
      publicacionData.año_creacion,
      publicacionData.doi,
      publicacionData.resumen,
      publicacionData.palabras_clave,
      publicacionData.categoria,
      publicacionData.tipo,
      publicacionData.acceso,
      publicacionData.volumen,
      publicacionData.numero,
      publicacionData.paginas,
      publicacionData.archivo,
      publicacionData.archivo_url,
      publicacionData.clerk_user_id,
      publicacionData.fecha_creacion
    ]

    const result = await db.query(query, values)
    const publicacion = Array.isArray(result) ? result[0] : result.rows[0]

    console.log("✅ Publicación creada exitosamente:", publicacion)

    return NextResponse.json({
      success: true,
      message: "Publicación creada exitosamente",
      publicacion: {
        id: publicacion.id,
        titulo: publicacion.titulo,
        año: publicacion.año_creacion
      }
    }, { status: 201 })

  } catch (error) {
    console.error("❌ Error al crear publicación:", error)
    
    // Manejo de errores específicos de PostgreSQL
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: "Ya existe una publicación con esos datos" },
          { status: 409 }
        )
      }
      
      if (error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: "La tabla de publicaciones no existe en la base de datos" },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Error al crear la publicación",
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
    const año = searchParams.get('año') || 'all'
    const acceso = searchParams.get('acceso') || 'all'

    const db = await getDatabase()
    
    // Construir query base
    let query = `
      SELECT 
        id,
        titulo,
        autor,
        institucion,
        editorial,
        año_creacion as año,
        doi,
        resumen,
        palabras_clave,
        categoria,
        tipo,
        acceso,
        volumen,
        numero,
        paginas,
        archivo,
        archivo_url,
        fecha_creacion
      FROM publicaciones 
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Agregar filtros (usando $1, $2 para PostgreSQL)
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`
      query += ` AND (
        LOWER(titulo) LIKE $${paramIndex} OR 
        LOWER(autor) LIKE $${paramIndex + 1} OR 
        LOWER(institucion) LIKE $${paramIndex + 2} OR 
        LOWER(editorial) LIKE $${paramIndex + 3} OR
        LOWER(palabras_clave) LIKE $${paramIndex + 4}
      )`
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam)
      paramIndex += 5
    }

    if (categoria !== 'all') {
      query += ` AND categoria = $${paramIndex}`
      params.push(categoria)
      paramIndex += 1
    }

    if (año !== 'all') {
      query += ` AND año_creacion = $${paramIndex}`
      params.push(parseInt(año))
      paramIndex += 1
    }

    if (acceso !== 'all') {
      query += ` AND acceso = $${paramIndex}`
      params.push(acceso)
      paramIndex += 1
    }

    query += ` ORDER BY fecha_creacion DESC`

    // Ejecutar query
    let publicaciones
    try {
      const result = await db.query(query, params)
      publicaciones = Array.isArray(result) ? result : (result.rows || [])
    } catch (dbError: any) {
      // Si la tabla no existe, retornar array vacío en lugar de error
      if (dbError?.code === '42P01' || dbError?.message?.includes('does not exist')) {
        console.warn('⚠️ Tabla publicaciones no existe en la base de datos, retornando datos vacíos')
        return NextResponse.json({
          publicaciones: [],
          filtros: {
            categorias: [],
            años: []
          }
        })
      }
      throw dbError
    }

    // Formatear respuesta
    const publicacionesFormateadas = publicaciones.map((pub: any) => ({
      id: pub.id,
      titulo: pub.titulo,
      autores: pub.autor ? pub.autor.split(',').map((a: string) => a.trim()) : [],
      revista: pub.editorial,
      año: pub.año,
      volumen: pub.volumen,
      numero: pub.numero,
      paginas: pub.paginas,
      doi: pub.doi,
      resumen: pub.resumen,
      palabrasClave: pub.palabras_clave ? pub.palabras_clave.split(',').map((p: string) => p.trim()) : [],
      categoria: pub.categoria,
      institucion: pub.institucion,
      tipo: pub.tipo,
      acceso: pub.acceso,
      archivo: pub.archivo,
      archivoUrl: pub.archivo_url,
      fechaCreacion: pub.fecha_creacion
    }))

    // Obtener opciones únicas para filtros
    let categorias = []
    let años = []
    
    try {
      categorias = await db.query(`
        SELECT DISTINCT categoria 
        FROM publicaciones 
        WHERE categoria IS NOT NULL 
        ORDER BY categoria
      `)
    } catch (error) {
      console.warn('No se pudieron obtener categorías')
    }

    try {
      años = await db.query(`
        SELECT DISTINCT año_creacion 
        FROM publicaciones 
        WHERE año_creacion IS NOT NULL 
        ORDER BY año_creacion DESC
      `)
    } catch (error) {
      console.warn('No se pudieron obtener años')
    }

    return NextResponse.json({
      publicaciones: publicacionesFormateadas,
      filtros: {
        categorias: categorias.map((c: any) => c.categoria),
        años: años.map((a: any) => a.año_creacion)
      }
    })

  } catch (error) {
    console.error("Error al obtener publicaciones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}