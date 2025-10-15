import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = await getDatabase()
    
    // Primero obtener el investigador para conseguir su nombre y correo
    const investigador = await db.query(
      `SELECT id, nombre_completo, correo 
       FROM investigadores 
       WHERE slug = $1 OR 
             LOWER(REPLACE(REPLACE(nombre_completo, ' ', '-'), '.', '')) = $1`,
      [slug.toLowerCase()]
    )

    if (!investigador || investigador.length === 0) {
      return NextResponse.json({ error: "Investigador no encontrado" }, { status: 404 })
    }

    const inv = investigador[0]
    
    // Buscar publicaciones que mencionen el nombre o correo del investigador en el campo autor
    // Nota: Asumimos que 'autor' contiene el nombre del investigador
    const publicaciones = await db.query(
      `SELECT 
        id,
        titulo,
        autor,
        institucion,
        editorial,
        año_creacion as anio,
        doi,
        resumen,
        palabras_clave,
        categoria,
        tipo,
        acceso,
        volumen,
        numero,
        paginas,
        archivo_url,
        fecha_creacion
      FROM publicaciones 
      WHERE LOWER(autor) LIKE $1 OR LOWER(autor) LIKE $2
      ORDER BY año_creacion DESC, fecha_creacion DESC
      LIMIT 20`,
      [
        `%${inv.nombre_completo.toLowerCase()}%`,
        `%${inv.correo.toLowerCase()}%`
      ]
    )

    // Transformar datos para el frontend
    const publicacionesFormateadas = publicaciones.map((pub: any) => ({
      id: pub.id,
      titulo: pub.titulo,
      autor: pub.autor,
      institucion: pub.institucion,
      revista: pub.editorial,
      año: pub.anio,
      volumen: pub.volumen,
      numero: pub.numero,
      paginas: pub.paginas,
      doi: pub.doi,
      resumen: pub.resumen,
      palabrasClave: pub.palabras_clave?.split(',').map((k: string) => k.trim()) || [],
      categoria: pub.categoria,
      tipo: pub.tipo,
      acceso: pub.acceso,
      archivoUrl: pub.archivo_url,
      fechaCreacion: pub.fecha_creacion
    }))

    return NextResponse.json(publicacionesFormateadas)
  } catch (error) {
    console.error("Error al obtener publicaciones del investigador:", error)
    return NextResponse.json(
      { error: "Error al obtener publicaciones" },
      { status: 500 }
    )
  }
}
