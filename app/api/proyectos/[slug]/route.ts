import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const db = await getDatabase()

    const query = `
      SELECT
        id,
        titulo,
        descripcion,
        resumen,
        investigador_principal AS autor,
        institucion,
        fecha_inicio,
        fecha_fin,
        estado,
        categoria,
        area_investigacion,
        presupuesto,
        fuente_financiamiento,
        palabras_clave,
        objetivos,
        resultados,
        metodologia,
        impacto,
        colaboradores,
        archivo_url,
        slug,
        fecha_creacion
      FROM proyectos
      WHERE slug = $1
      LIMIT 1
    `

    const result = await db.query(query, [slug])
    const rows = Array.isArray(result) ? result : (result.rows || [])

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    const row = rows[0]

    const formatArray = (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      return String(value)
        .split(/[,\n;]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }

    // Formatear colaboradores: si es string con formato "nombre - institucion - rol", parsearlo
    const colaboradoresFormateados = formatArray(row.colaboradores).map((colab: any) => {
      if (typeof colab === 'string' && colab.includes(' - ')) {
        const partes = colab.split(' - ')
        return {
          nombre: partes[0] || '',
          institucion: partes[1] || '',
          rol: partes[2] || ''
        }
      }
      return colab
    })

    const proyecto = {
      id: row.id,
      titulo: row.titulo || '',
      descripcion: row.descripcion || '',
      resumen: row.resumen || '',
      autor: row.autor ? {
        nombre: row.autor,
        institucion: row.institucion || ''
      } : { nombre: '', institucion: '' },
      investigador_principal: row.autor || row.investigador_principal || '',
      institucion: row.institucion || '',
      fechaInicio: row.fecha_inicio || null,
      fechaFin: row.fecha_fin || null,
      fecha_inicio: row.fecha_inicio || null,
      fecha_fin: row.fecha_fin || null,
      estado: row.estado || '',
      categoria: row.categoria || '',
      areaInvestigacion: row.area_investigacion || '',
      presupuesto: row.presupuesto || null,
      financiamiento: row.fuente_financiamiento || null,
      palabrasClave: formatArray(row.palabras_clave),
      objetivos: formatArray(row.objetivos),
      resultados: formatArray(row.resultados),
      metodologia: row.metodologia || null,
      impacto: row.impacto || null,
      colaboradores: colaboradoresFormateados,
      archivoUrl: row.archivo_url || null,
      slug: row.slug || '',
      fechaCreacion: row.fecha_creacion || null
    }

    return NextResponse.json({ proyecto })

  } catch (error) {
    console.error("Error al obtener proyecto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}


