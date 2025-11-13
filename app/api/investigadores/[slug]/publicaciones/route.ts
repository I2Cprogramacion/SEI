import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log('📌 [Publicaciones] Buscando publicaciones para slug:', slug)
    
    const db = await getDatabase()
    
    // Primero obtener el investigador para conseguir su nombre, correo y clerk_user_id
    const investigadorResult = await db.query(
      `SELECT id, nombre_completo, correo, clerk_user_id
       FROM investigadores 
       WHERE slug = $1 OR 
             LOWER(REPLACE(REPLACE(nombre_completo, ' ', '-'), '.', '')) = $1`,
      [slug.toLowerCase()]
    )

    const investigadorRows = Array.isArray(investigadorResult) 
      ? investigadorResult 
      : investigadorResult.rows

    if (!investigadorRows || investigadorRows.length === 0) {
      console.log('❌ [Publicaciones] Investigador no encontrado con slug:', slug)
      return NextResponse.json({ error: "Investigador no encontrado" }, { status: 404 })
    }

    const inv = investigadorRows[0]
    console.log('✅ [Publicaciones] Investigador encontrado:', { 
      id: inv.id, 
      nombre: inv.nombre_completo,
      clerk_id: inv.clerk_user_id 
    })
    
    // Buscar publicaciones
    // Si tiene clerk_user_id de Clerk (user_*), buscar por ese campo
    // Si tiene clerk_user_id de Supabase (sua_*) o no tiene, buscar por nombre en autor
    let publicacionesResult
    
    const hasClerkId = inv.clerk_user_id && inv.clerk_user_id.startsWith('user_')
    
    if (hasClerkId) {
      // Tiene Clerk ID válido: buscar por ese campo
      publicacionesResult = await db.query(
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
        WHERE clerk_user_id = $1
        ORDER BY año_creacion DESC, fecha_creacion DESC
        LIMIT 50`,
        [inv.clerk_user_id]
      )
    } else {
      // No tiene Clerk ID válido (tiene Supabase ID o null): buscar por nombre en autor
      publicacionesResult = await db.query(
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
        LIMIT 50`,
        [
          `%${inv.nombre_completo.toLowerCase()}%`,
          `%${inv.correo.toLowerCase()}%`
        ]
      )
    }

    const publicaciones = Array.isArray(publicacionesResult)
      ? publicacionesResult
      : publicacionesResult.rows

    console.log(`✅ [Publicaciones] Encontradas ${publicaciones?.length || 0} publicaciones para ${inv.nombre_completo}`)

    // Transformar datos para el frontend
    const publicacionesFormateadas = (publicaciones || []).map((pub: any) => ({
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
      palabrasClave: pub.palabras_clave?.split(',').map((k: string) => k.trim()).filter(Boolean) || [],
      categoria: pub.categoria,
      tipo: pub.tipo,
      acceso: pub.acceso,
      archivoUrl: pub.archivo_url,
      fechaCreacion: pub.fecha_creacion
    }))

    return NextResponse.json(publicacionesFormateadas)
  } catch (error) {
    console.error("❌ Error al obtener publicaciones del investigador:", error)
    return NextResponse.json(
      { error: "Error al obtener publicaciones" },
      { status: 500 }
    )
  }
}