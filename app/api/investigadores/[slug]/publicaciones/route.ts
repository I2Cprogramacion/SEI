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
    
    // Extraer las partes principales del slug (sin el sufijo aleatorio)
    const slugParts = slug.toLowerCase().split('-')
    const slugWithoutSuffix = slugParts.slice(0, -1).join('-') // Remover último segmento
    
    // Crear patrones de búsqueda flexibles
    const searchPattern = `%${slugParts.slice(0, Math.max(2, slugParts.length - 1)).join('%')}%`
    
    console.log('🔍 [Publicaciones] Patrones de búsqueda:', {
      slugExacto: slug.toLowerCase(),
      slugSinSufijo: slugWithoutSuffix,
      patron: searchPattern
    })
    
    const investigadorResult = await db.query(
      `SELECT id, nombre_completo, correo, clerk_user_id, slug
       FROM investigadores 
       WHERE LOWER(slug) = $1 
          OR LOWER(slug) = $2
          OR LOWER(slug) LIKE $3
          OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(nombre_completo, ' ', '-'), '.', ''), 'á', 'a'), 'é', 'e')) LIKE $3
       LIMIT 1`,
      [slug.toLowerCase(), slugWithoutSuffix, searchPattern]
    )

    const investigadorRows = Array.isArray(investigadorResult) 
      ? investigadorResult 
      : investigadorResult.rows

    if (!investigadorRows || investigadorRows.length === 0) {
      console.log('❌ [Publicaciones] Investigador no encontrado con slug:', slug)
      console.log('   Intentó buscar también con:', slugWithoutSuffix)
      return NextResponse.json({ error: "Investigador no encontrado" }, { status: 404 })
    }

    const inv = investigadorRows[0]
    console.log('✅ [Publicaciones] Investigador encontrado:', { 
      id: inv.id, 
      nombre: inv.nombre_completo,
      slug_db: inv.slug,
      clerk_id: inv.clerk_user_id 
    })
    
    // Buscar publicaciones
    // Prioridad: buscar por clerk_user_id si es válido (user_*)
    // Si no tiene clerk_user_id válido, buscar por correo exacto en campo autor
    let publicacionesResult
    
    const hasClerkId = inv.clerk_user_id && inv.clerk_user_id.startsWith('user_')
    
    if (hasClerkId) {
      // Tiene Clerk ID válido: buscar publicaciones por ese campo
      console.log('🔍 [Publicaciones] Buscando publicaciones con clerk_user_id:', inv.clerk_user_id)
      
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
    } else if (inv.correo) {
      // No tiene Clerk ID válido pero tiene correo: buscar por correo exacto en autor
      // Esto es más preciso que buscar por nombre completo
      console.log('🔍 [Publicaciones] Buscando publicaciones con correo:', inv.correo)
      
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
        WHERE LOWER(autor) = LOWER($1) OR autor ILIKE '%' || $1 || '%'
        ORDER BY año_creacion DESC, fecha_creacion DESC
        LIMIT 50`,
        [inv.correo]
      )
    } else {
      // No tiene ni clerk_user_id ni correo válido
      console.log('⚠️ [Publicaciones] Investigador sin clerk_user_id ni correo válido, no se cargan publicaciones')
      publicacionesResult = { rows: [] }
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