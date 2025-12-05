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
    const db = await getDatabase()
    const url = new URL(request.url)
    const clerkUserId = url.searchParams.get('clerk_user_id')
    
    console.log('📌 [GET Publicaciones v2] Solicitadas para usuario autenticado')

    // Si hay clerk_user_id, obtener los datos del investigador para buscar también por nombre y correo
    let investigador: { nombre_completo?: string; correo?: string } | null = null
    
    if (clerkUserId) {
      try {
        const invResult = await db.query(
          `SELECT nombre_completo, correo FROM investigadores WHERE clerk_user_id = $1 LIMIT 1`,
          [clerkUserId]
        )
        const invRows = Array.isArray(invResult) ? invResult : invResult.rows
        if (invRows && invRows.length > 0) {
          investigador = invRows[0]
          console.log('👤 [GET Publicaciones] Investigador encontrado')
        } else {
          console.log('⚠️ [GET Publicaciones] No se encontró investigador')
        }
      } catch (err) {
        console.error('⚠️ Error al buscar investigador:', err)
      }
    }

    // Base query selects uploader info
    let publicacionesQuery = `
      SELECT p.id, p.titulo, p.autor, p.institucion, p.editorial, p.año_creacion AS año, p.doi,
             p.resumen, p.palabras_clave, p.categoria, p.tipo, p.acceso, p.volumen, p.numero, p.paginas, p.archivo_url,
             p.fecha_creacion, p.clerk_user_id,
             i.nombre_completo AS uploader_nombre
      FROM publicaciones p
      LEFT JOIN investigadores i ON i.clerk_user_id = p.clerk_user_id
    `

    const values: any[] = []
    const whereConditions: string[] = []
    let paramIndex = 1
    
    if (clerkUserId) {
      // Buscar por clerk_user_id (publicaciones que subió)
      whereConditions.push(`p.clerk_user_id = $${paramIndex}`)
      values.push(clerkUserId)
      paramIndex++
      
      // Si tenemos datos del investigador, buscar también en campo autor
      if (investigador?.correo) {
        whereConditions.push(`LOWER(p.autor) LIKE $${paramIndex}`)
        values.push(`%${investigador.correo.toLowerCase()}%`)
        paramIndex++
      }
      
      if (investigador?.nombre_completo) {
        const nombreParts = investigador.nombre_completo.toLowerCase().split(' ').filter(Boolean)
        
        // Buscar el nombre completo
        whereConditions.push(`LOWER(p.autor) LIKE $${paramIndex}`)
        values.push(`%${investigador.nombre_completo.toLowerCase()}%`)
        paramIndex++
        
        // Si el nombre tiene al menos 2 partes (nombre + apellido), buscar también por apellidos
        if (nombreParts.length >= 2) {
          const apellidos = nombreParts.slice(1).join(' ')
          whereConditions.push(`LOWER(p.autor) LIKE $${paramIndex}`)
          values.push(`%${apellidos}%`)
          paramIndex++
        }
      }
      
      if (whereConditions.length > 0) {
        publicacionesQuery += ` WHERE (${whereConditions.join(' OR ')})`
      }
      
      console.log('🟢 [Dashboard Publicaciones] Investigador:', {
        nombre: investigador?.nombre_completo,
        correo: investigador?.correo,
        clerk_id: clerkUserId
      })
      console.log('🟢 [Dashboard Publicaciones] Query WHERE:', whereConditions.join(' OR '))
      console.log('🟢 [Dashboard Publicaciones] Params:', values)
      console.log('🟢 [Dashboard Publicaciones] Total condiciones:', whereConditions.length)
    }

    publicacionesQuery += ` ORDER BY p.año_creacion DESC NULLS LAST, p.fecha_creacion DESC LIMIT 50`

    let publicaciones: any[] = []
    let categorias: string[] = []
    let años: number[] = []

    try {
      const pubsResult = await db.query(publicacionesQuery, values)
      const pubsRows = Array.isArray(pubsResult) ? pubsResult : pubsResult.rows
      
      console.log(`✅ [Dashboard Publicaciones] Encontradas ${pubsRows?.length || 0} publicaciones`)
      if (pubsRows?.length > 0) {
        console.log('🟢 [Dashboard Publicaciones] IDs encontradas:', 
          pubsRows.map((p: any) => p.id).join(', ')
        )
        console.log('🟢 [Dashboard Publicaciones] Detalles:', 
          pubsRows.map((p: any) => `ID ${p.id}: "${p.titulo?.substring(0, 30)}..." (${p.autor?.substring(0, 50)})`).join(' | ')
        )
        console.log('📄 [GET Publicaciones] Primeras 3 publicaciones:', 
          pubsRows.slice(0, 3).map((p: any) => ({ 
            id: p.id, 
            titulo: p.titulo?.substring(0, 50),
            clerk_user_id: p.clerk_user_id,
            autor: p.autor?.substring(0, 50)
          }))
        )
      }

      // Transformar campos para consistencia con el endpoint de perfil público
      publicaciones = (pubsRows || []).map((r: any) => ({
        id: r.id,
        titulo: r.titulo,
        autor: r.autor || null,  // Mantener como string para consistencia
        autores: r.autor ? String(r.autor).split(/,\s*/).filter(Boolean) : [], // También como array para backward compatibility
        institucion: r.institucion || null,
        revista: r.editorial || null,
        año: r.año || null,
        volumen: r.volumen || null,
        numero: r.numero || null,
        paginas: r.paginas || null,
        doi: r.doi || null,
        resumen: r.resumen || null,
        palabrasClave: r.palabras_clave ? String(r.palabras_clave).split(/,\s*/).filter(Boolean) : [],
        categoria: r.categoria || 'Otros',
        tipo: r.tipo || null,
        acceso: r.acceso || 'Abierto',
        archivoUrl: r.archivo_url || null,
        fecha_creacion: r.fecha_creacion || null,
        fechaCreacion: r.fecha_creacion || null,
        clerkUserId: r.clerk_user_id || null,
        uploaderNombre: r.uploader_nombre || null
      }))

      // Construir filtros (categorias y años) a partir de los resultados
      categorias = Array.from(new Set(publicaciones.map((p: any) => p.categoria).filter(Boolean)))
      años = Array.from(new Set(publicaciones.map((p: any) => p.año).filter(Boolean))).sort((a: any, b: any) => b - a)

    } catch (err: any) {
      // Si la tabla publicaciones no existe o hay error, generamos un fallback a partir
      // de los campos `articulos` en la tabla `investigadores` (no modifica datos).
      const msg = err && err.message ? String(err.message).toLowerCase() : ''
      if (msg.includes('does not exist') || msg.includes('relation "publicaciones"')) {
        const invQuery = `SELECT id, nombre_completo, articulos, institucion, fecha_registro FROM investigadores ORDER BY fecha_registro DESC LIMIT 200`
        const invRes = await db.query(invQuery)
        const invRows = Array.isArray(invRes) ? invRes : invRes.rows

        // construir publicaciones derivadas
        publicaciones = []
        for (const inv of (invRows || [])) {
          const nombre = inv.nombre_completo || 'Autor'
          const institucion = inv.institucion || null
          const articulosText = inv.articulos || ''
          const lines = String(articulosText).split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean)
          for (let i = 0; i < lines.length; i++) {
            publicaciones.push({
              id: `${inv.id}-${i}`,
              titulo: lines[i],
              autores: [nombre],
              revista: null,
              año: null,
              doi: null,
              resumen: null,
              palabrasClave: [],
              categoria: 'Artículo',
              institucion,
              tipo: 'Artículo',
              acceso: 'Abierto',
              volumen: null,
              numero: null,
              paginas: null,
              archivoUrl: null,
              fecha_creacion: inv.fecha_registro || null
            })
            if (publicaciones.length >= 200) break
          }
          if (publicaciones.length >= 200) break
        }

        categorias = Array.from(new Set(publicaciones.map((p: any) => p.categoria).filter(Boolean)))
        años = []
      } else {
        // Si es otro error, relanzar para ser manejado abajo
        throw err
      }
    }

    return NextResponse.json({ publicaciones, filtros: { categorias, años } })

  } catch (error) {
    console.error("Error al obtener publicaciones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}