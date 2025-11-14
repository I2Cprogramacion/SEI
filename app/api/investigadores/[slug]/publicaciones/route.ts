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
    
    // Buscar publicaciones de 3 formas:
    // 1. Por clerk_user_id (publicaciones que subió este investigador)
    // 2. Por correo en el campo autor (publicaciones donde aparece como coautor)
    // 3. Por nombre en el campo autor (publicaciones donde aparece como coautor)
    
    const hasClerkId = inv.clerk_user_id && inv.clerk_user_id.startsWith('user_')
    
    console.log('🔍 [Publicaciones] Estrategia de búsqueda:', {
      por_clerk_id: hasClerkId,
      por_correo: !!inv.correo,
      por_nombre: !!inv.nombre_completo
    })
    
    // Construir query con múltiples condiciones
    let whereConditions: string[] = []
    let queryParams: any[] = []
    let paramIndex = 1
    
    if (hasClerkId) {
      whereConditions.push(`clerk_user_id = $${paramIndex}`)
      queryParams.push(inv.clerk_user_id)
      paramIndex++
    }
    
    if (inv.correo) {
      whereConditions.push(`LOWER(autor) LIKE $${paramIndex}`)
      queryParams.push(`%${inv.correo.toLowerCase()}%`)
      paramIndex++
    }
    
    if (inv.nombre_completo) {
      // Buscar por nombre completo Y también por variaciones (nombre, apellidos separados)
      const nombreParts = inv.nombre_completo.toLowerCase().split(' ').filter(Boolean)
      
      // Buscar el nombre completo
      whereConditions.push(`LOWER(autor) LIKE $${paramIndex}`)
      queryParams.push(`%${inv.nombre_completo.toLowerCase()}%`)
      paramIndex++
      
      // Si el nombre tiene al menos 2 partes (nombre + apellido), buscar también por apellidos
      if (nombreParts.length >= 2) {
        const apellidos = nombreParts.slice(1).join(' ') // Todo excepto el primer nombre
        whereConditions.push(`LOWER(autor) LIKE $${paramIndex}`)
        queryParams.push(`%${apellidos}%`)
        paramIndex++
      }
    }
    
    if (whereConditions.length === 0) {
      console.log('⚠️ [Publicaciones] No hay criterios de búsqueda válidos')
      return NextResponse.json([])
    }
    
    const whereClause = whereConditions.join(' OR ')
    
    console.log('🔵 [Publicaciones Perfil] Investigador:', {
      nombre: inv.nombre_completo,
      correo: inv.correo,
      clerk_id: inv.clerk_user_id
    })
    console.log('🔵 [Publicaciones Perfil] Query WHERE:', whereClause)
    console.log('🔵 [Publicaciones Perfil] Params:', queryParams)
    console.log('🔵 [Publicaciones Perfil] Total condiciones:', whereConditions.length)
    
    const publicacionesResult = await db.query(
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
      WHERE ${whereClause}
      ORDER BY año_creacion DESC NULLS LAST, fecha_creacion DESC
      LIMIT 50`,
      queryParams
    )

    const publicaciones = Array.isArray(publicacionesResult)
      ? publicacionesResult
      : publicacionesResult.rows

    console.log(`✅ [Publicaciones Perfil] Encontradas ${publicaciones?.length || 0} publicaciones para ${inv.nombre_completo}`)
    
    if (publicaciones?.length > 0) {
      console.log('🔵 [Publicaciones Perfil] IDs encontradas:', 
        publicaciones.map((p: any) => p.id).join(', ')
      )
      console.log('🔵 [Publicaciones Perfil] Detalles:', 
        publicaciones.map((p: any) => `ID ${p.id}: "${p.titulo?.substring(0, 30)}..." (${p.autor?.substring(0, 50)})`).join(' | ')
      )
    }

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