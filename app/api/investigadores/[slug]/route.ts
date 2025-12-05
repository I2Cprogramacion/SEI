import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
  const includePublications = request.nextUrl.searchParams.get('includePublications') === 'true'
  const debugMode = request.nextUrl.searchParams.get('debug') === 'true'

    const db = await getDatabase()

    // buscar perfil por slug, por id si slug es numérico, o por nombre normalizado
    const isNumeric = /^\d+$/.test(slug)

    const q = `SELECT
      id,
      COALESCE(nombre_completo, '') AS nombre_completo,
      COALESCE(nombres, '') AS nombres,
      COALESCE(apellidos, '') AS apellidos,
      COALESCE(telefono, '') AS telefono,
      COALESCE(fotografia_url, '') AS fotografia_url,
      COALESCE(nacionalidad, '') AS nacionalidad,
      fecha_nacimiento,
      COALESCE(ultimo_grado_estudios, '') AS ultimo_grado_estudios,
      COALESCE(empleo_actual, '') AS empleo_actual,
      COALESCE(linea_investigacion, '') AS linea_investigacion,
      COALESCE(area_investigacion, '') AS area_investigacion,
      COALESCE(institucion, '') AS institucion,
      COALESCE(departamento, '') AS departamento,
      COALESCE(slug, '') AS slug,
      COALESCE(cv_url, '') AS cv_url,
      dictamen_url,
      sni_url,
      COALESCE(perfil_publico, true) AS perfil_publico,
      COALESCE(clerk_user_id, '') AS clerk_user_id
      FROM investigadores
      WHERE ${isNumeric ? 'id = $1' : `(slug = $1 OR LOWER(REPLACE(REPLACE(nombre_completo, ' ', '-'), '.', '')) = $1)`}
      LIMIT 1
    `

  const dbParams = isNumeric ? [Number(slug)] : [slug.toLowerCase()]
  const res = await db.query(q, dbParams)
  let rows = Array.isArray(res) ? res : (res.rows || [])
  const debugInfo: any = {
    tried: [] as any[],
  }
  debugInfo.tried.push({ query: q, params: dbParams, rows: Array.isArray(res) ? res.length : (res.rows || []).length })

  // Si no hay resultado exacto, intentar una búsqueda más permisiva por nombre o slug parcial
  if (!rows || rows.length === 0) {
    try {
      const normalized = slug.toLowerCase().replace(/[-_]/g, ' ').trim()
      const fallbackQ = `SELECT
      id,
      COALESCE(nombre_completo, '') AS nombre_completo,
      COALESCE(nombres, '') AS nombres,
      COALESCE(apellidos, '') AS apellidos,
      COALESCE(telefono, '') AS telefono,
      COALESCE(fotografia_url, '') AS fotografia_url,
      COALESCE(nacionalidad, '') AS nacionalidad,
      fecha_nacimiento,
      COALESCE(ultimo_grado_estudios, '') AS ultimo_grado_estudios,
      COALESCE(empleo_actual, '') AS empleo_actual,
      COALESCE(linea_investigacion, '') AS linea_investigacion,
      COALESCE(area_investigacion, '') AS area_investigacion,
      COALESCE(institucion, '') AS institucion,
      COALESCE(departamento, '') AS departamento,
      COALESCE(slug, '') AS slug,
      COALESCE(cv_url, '') AS cv_url,
      dictamen_url,
      sni_url,
      COALESCE(perfil_publico, true) AS perfil_publico,
      COALESCE(clerk_user_id, '') AS clerk_user_id
      FROM investigadores
      WHERE LOWER(nombre_completo) ILIKE $1 OR LOWER(slug) ILIKE $2
      LIMIT 1`
      const fallbackParams = [`%${normalized}%`, `%${slug.toLowerCase()}%`]
      const fallbackRes = await db.query(fallbackQ, fallbackParams)
      rows = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes.rows || [])
      debugInfo.tried.push({ query: fallbackQ, params: fallbackParams, rows: Array.isArray(fallbackRes) ? fallbackRes.length : (fallbackRes.rows || []).length })
    } catch (fbErr) {
      console.error('Fallback search error for slug', slug, fbErr)
      if (debugMode) debugInfo.fallbackError = String(fbErr)
    }
  }
  if (!rows || rows.length === 0) {
    if (debugMode) return NextResponse.json({ error: 'Investigador no encontrado', debug: debugInfo }, { status: 404 })
    return NextResponse.json({ error: 'Investigador no encontrado' }, { status: 404 })
  }

  const perfil = rows[0]

    // Remover campos sensibles del perfil público
    const perfilPublico = {
      id: perfil.id,
      nombre_completo: perfil.nombre_completo,
      nombres: perfil.nombres,
      apellidos: perfil.apellidos,
      telefono: perfil.telefono,
      fotografia_url: perfil.fotografia_url,
      nacionalidad: perfil.nacionalidad,
      fecha_nacimiento: perfil.fecha_nacimiento,
      ultimo_grado_estudios: perfil.ultimo_grado_estudios,
      empleo_actual: perfil.empleo_actual,
      linea_investigacion: perfil.linea_investigacion,
      area_investigacion: perfil.area_investigacion,
      institucion: perfil.institucion,
      departamento: perfil.departamento,
      slug: perfil.slug,
      cv_url: perfil.cv_url,
      dictamen_url: perfil.dictamen_url,
      sni_url: perfil.sni_url,
      perfil_publico: perfil.perfil_publico === undefined ? true : Boolean(perfil.perfil_publico)
    }

    // Devolver el objeto del perfil en el nivel superior para que el cliente
    // pueda acceder directamente a propiedades como `nombre_completo`, etc.
    const result: any = {
      ...perfilPublico,
    }

    if (includePublications) {
      try {
        // traer últimas 10 publicaciones públicas de este investigador
        // notar: usamos anio_creacion para evitar alias con caracteres especiales
        const pubsQ = `SELECT id, titulo, anio_creacion AS anio, revista, doi, archivo_url AS archivo_url, acceso, clerk_user_id FROM publicaciones WHERE clerk_user_id = $1 AND (acceso = 'Abierto' OR acceso IS NULL) ORDER BY fecha_creacion DESC LIMIT 10`
        // solo ejecutar si tenemos clerk_user_id
        if (perfil.clerk_user_id && String(perfil.clerk_user_id).trim() !== '') {
          const pubsRes = await db.query(pubsQ, [perfil.clerk_user_id])
          const pubsRows = Array.isArray(pubsRes) ? pubsRes : (pubsRes.rows || [])
          if (debugMode) debugInfo.publicationsRows = Array.isArray(pubsRes) ? pubsRes.length : (pubsRes.rows || []).length
          result.publicaciones = pubsRows.map((p: any) => ({
            id: p.id,
            titulo: p.titulo,
            año: p.anio, // mantenemos la propiedad con tilde que usa el UI
            revista: p.revista,
            doi: p.doi,
            archivoUrl: p.archivo_url || null,
            acceso: p.acceso || null,
          }))
        } else {
          result.publicaciones = []
        }
      } catch (err) {
        console.error('Error cargando publicaciones para investigador', perfil.id, err)
        // si falla la consulta de publicaciones, no rompemos el perfil
        result.publicaciones = []
      }
    }

  if (debugMode) return NextResponse.json({ ...result, _debug: debugInfo })
  return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}


