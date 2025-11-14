import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const db = await getDatabase()

    const query = `
      SELECT p.*, i.nombre_completo AS uploader_nombre
      FROM publicaciones p
      LEFT JOIN investigadores i ON i.clerk_user_id = p.clerk_user_id
      WHERE p.id = $1
      LIMIT 1
    `
    const res = await db.query(query, [id])
    const row = Array.isArray(res) ? res[0] : res.rows[0]

    if (!row) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 })
    }

    const publicacion = {
      id: row.id,
      titulo: row.titulo,
      autor: row.autor,
      institucion: row.institucion,
      revista: row.editorial || row.revista || null,
      año_creacion: row.año_creacion || row.año || null,
      volumen: row.volumen || null,
      numero: row.numero || null,
      paginas: row.paginas || null,
      doi: row.doi || null,
      issn: row.issn || null,
      isbn: row.isbn || null,
      url: row.url || null,
      resumen: row.resumen || null,
      abstract: row.abstract || null,
      palabras_clave: row.palabras_clave || null,
      categoria: row.categoria || null,
      tipo: row.tipo || null,
      acceso: row.acceso || null,
      idioma: row.idioma || null,
      revista_indexada: row.revista_indexada || null,
      archivo: row.archivo || null,
      archivo_url: row.archivo_url || null,
      enlace_externo: row.enlace_externo || null,
      clerk_user_id: row.clerk_user_id || null,
      uploader_nombre: row.uploader_nombre || null,
      fecha_creacion: row.fecha_creacion || null
    }

    return NextResponse.json({ publicacion })

  } catch (error) {
    console.error('Error GET /api/publicaciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - actualizar publicación (solo autor)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { id } = params
    const body = await request.json()

    const db = await getDatabase()

    // Comprobar que la publicación existe y pertenece al usuario
    const existQ = `SELECT clerk_user_id FROM publicaciones WHERE id = $1 LIMIT 1`
    const existRes = await db.query(existQ, [id])
    const existRow = Array.isArray(existRes) ? existRes[0] : existRes.rows[0]
    if (!existRow) return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 })
    if (existRow.clerk_user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    // Campos permitidos para actualizar
    const allowed = [
      'titulo','autor','institucion','editorial','año_creacion','doi','resumen','palabras_clave',
      'categoria','tipo','acceso','volumen','numero','paginas','archivo','archivo_url','enlace_externo',
      'revista','issn','isbn','url','abstract','idioma','revista_indexada'
    ]

    const setParts: string[] = []
    const values: any[] = []
    let idx = 1
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        setParts.push(`${key} = $${idx}`)
        values.push(body[key])
        idx++
      }
    }

    if (setParts.length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
    }

    const updateQ = `UPDATE publicaciones SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING id, titulo`
    values.push(id)

    const updRes = await db.query(updateQ, values)
    const updRow = Array.isArray(updRes) ? updRes[0] : updRes.rows[0]

    return NextResponse.json({ success: true, publicacion: updRow })

  } catch (error) {
    console.error('Error PUT /api/publicaciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - eliminar publicación (solo autor)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { id } = params
    const db = await getDatabase()

    // Comprobar que la publicación existe y pertenece al usuario
    const existQ = `SELECT clerk_user_id FROM publicaciones WHERE id = $1 LIMIT 1`
    const existRes = await db.query(existQ, [id])
    const existRow = Array.isArray(existRes) ? existRes[0] : existRes.rows[0]
    
    if (!existRow) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 })
    }
    
    if (existRow.clerk_user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado para eliminar esta publicación' }, { status: 403 })
    }

    // Eliminar la publicación
    const deleteQ = `DELETE FROM publicaciones WHERE id = $1`
    await db.query(deleteQ, [id])

    console.log(`🗑️ Publicación ${id} eliminada por usuario ${user.id}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Publicación eliminada correctamente' 
    })

  } catch (error) {
    console.error('Error DELETE /api/publicaciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
