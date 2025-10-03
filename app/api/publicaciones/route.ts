import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

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

    // Agregar filtros
    if (search) {
      query += ` AND (
        LOWER(titulo) LIKE $${paramIndex} OR 
        LOWER(autor) LIKE $${paramIndex} OR 
        LOWER(institucion) LIKE $${paramIndex} OR 
        LOWER(editorial) LIKE $${paramIndex} OR
        LOWER(palabras_clave) LIKE $${paramIndex}
      )`
      params.push(`%${search.toLowerCase()}%`)
      paramIndex++
    }

    if (categoria !== 'all') {
      query += ` AND categoria = $${paramIndex}`
      params.push(categoria)
      paramIndex++
    }

    if (año !== 'all') {
      query += ` AND año_creacion = $${paramIndex}`
      params.push(parseInt(año))
      paramIndex++
    }

    if (acceso !== 'all') {
      query += ` AND acceso = $${paramIndex}`
      params.push(acceso)
      paramIndex++
    }

    query += ` ORDER BY fecha_creacion DESC`

    // Ejecutar query
    const publicaciones = await db.query(query, params)

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
    const categorias = await db.query(`
      SELECT DISTINCT categoria 
      FROM publicaciones 
      WHERE categoria IS NOT NULL 
      ORDER BY categoria
    `)

    const años = await db.query(`
      SELECT DISTINCT año_creacion 
      FROM publicaciones 
      WHERE año_creacion IS NOT NULL 
      ORDER BY año_creacion DESC
    `)

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