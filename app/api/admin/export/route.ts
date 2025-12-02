import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

// Configuración de campos por tipo de datos
const CAMPOS_CONFIG = {
  investigadores: {
    tabla: "investigadores",
    campos: {
      nombre_completo: { label: "Nombre Completo", sql: "nombre_completo" },
      curp: { label: "CURP", sql: "curp" },
      rfc: { label: "RFC", sql: "rfc" },
      correo: { label: "Correo Electrónico", sql: "correo" },
      telefono: { label: "Teléfono", sql: "telefono" },
      institucion: { label: "Institución", sql: "institucion" },
      area_investigacion: { label: "Área de Investigación", sql: "area_investigacion" },
      linea_investigacion: { label: "Línea de Investigación", sql: "linea_investigacion" },
      nivel_investigador: { label: "Nivel Investigador", sql: "nivel_investigador" },
      ultimo_grado_estudios: { label: "Último Grado de Estudios", sql: "ultimo_grado_estudios" },
      municipio: { label: "Municipio", sql: "municipio" },
      nacionalidad: { label: "Nacionalidad", sql: "nacionalidad" },
      genero: { label: "Género", sql: "genero" },
      fecha_registro: { label: "Fecha de Registro", sql: "fecha_registro" },
    }
  },
  proyectos: {
    tabla: "proyectos",
    campos: {
      titulo: { label: "Título", sql: "titulo" },
      descripcion: { label: "Descripción", sql: "descripcion" },
      investigador_principal: { label: "Investigador Principal", sql: "investigador_principal" },
      institucion: { label: "Institución", sql: "institucion" },
      fecha_inicio: { label: "Fecha de Inicio", sql: "fecha_inicio" },
      fecha_fin: { label: "Fecha de Fin", sql: "fecha_fin" },
      estado: { label: "Estado", sql: "estado" },
      categoria: { label: "Categoría", sql: "categoria" },
      area_investigacion: { label: "Área de Investigación", sql: "area_investigacion" },
      presupuesto: { label: "Presupuesto", sql: "presupuesto" },
    }
  },
  instituciones: {
    tabla: "instituciones",
    campos: {
      nombre: { label: "Nombre", sql: "nombre" },
      siglas: { label: "Siglas", sql: "siglas" },
      tipo: { label: "Tipo", sql: "tipo" },
      estado: { label: "Estado", sql: "estado" },
      sitio_web: { label: "Sitio Web", sql: "sitio_web" },
      direccion: { label: "Dirección", sql: "direccion" },
      telefono: { label: "Teléfono", sql: "telefono" },
      activo: { label: "Activo", sql: "activo" },
    }
  },
  publicaciones: {
    tabla: "publicaciones",
    campos: {
      titulo: { label: "Título", sql: "titulo" },
      autor: { label: "Autor(es)", sql: "autor" },
      editorial: { label: "Editorial/Revista", sql: "editorial" },
      año_creacion: { label: "Año", sql: "año_creacion" },
      doi: { label: "DOI", sql: "doi" },
      tipo: { label: "Tipo", sql: "tipo" },
      categoria: { label: "Categoría", sql: "categoria" },
      resumen: { label: "Resumen", sql: "resumen" },
      palabras_clave: { label: "Palabras Clave", sql: "palabras_clave" },
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dataType = searchParams.get('type') as keyof typeof CAMPOS_CONFIG
    const format = searchParams.get('format') || 'csv'
    const fieldsParam = searchParams.get('fields') || ''
    const fields = fieldsParam.split(',').filter(Boolean)

    if (!dataType || !CAMPOS_CONFIG[dataType]) {
      return NextResponse.json(
        { error: "Tipo de datos no válido" },
        { status: 400 }
      )
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "Debe seleccionar al menos un campo" },
        { status: 400 }
      )
    }

    const config = CAMPOS_CONFIG[dataType]
    const db = await getDatabase()

    // Construir la consulta SQL con los campos seleccionados
    const selectedSqlFields = fields
      .filter(field => config.campos[field as keyof typeof config.campos])
      .map(field => {
        const fieldConfig = config.campos[field as keyof typeof config.campos]
        return `COALESCE(${fieldConfig.sql}::TEXT, '') as "${field}"`
      })

    if (selectedSqlFields.length === 0) {
      return NextResponse.json(
        { error: "Campos no válidos" },
        { status: 400 }
      )
    }

    const query = `
      SELECT ${selectedSqlFields.join(', ')}
      FROM ${config.tabla}
      ORDER BY id DESC
    `

    const data = await db.query(query)

    // Generar encabezados con labels
    const headers = fields
      .filter(field => config.campos[field as keyof typeof config.campos])
      .map(field => config.campos[field as keyof typeof config.campos].label)

    if (format === 'csv') {
      // Generar CSV
      const csvContent = generateCSV(headers, data, fields)
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${dataType}_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else if (format === 'excel') {
      // Generar Excel (formato XLSX simplificado como TSV que Excel puede abrir)
      const excelContent = generateExcel(headers, data, fields)
      
      return new NextResponse(excelContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="${dataType}_export_${new Date().toISOString().split('T')[0]}.xls"`,
        },
      })
    } else if (format === 'pdf') {
      // Para PDF, retornar JSON que el frontend convertirá
      return NextResponse.json({
        success: true,
        data: data,
        headers: headers,
        fields: fields,
        dataType: dataType,
        generatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: "Formato no soportado" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Error en exportación:", error)
    return NextResponse.json(
      { 
        error: "Error al exportar datos",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

function generateCSV(headers: string[], data: any[], fields: string[]): string {
  // BOM para UTF-8
  const BOM = '\uFEFF'
  
  // Función para escapar valores CSV
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // Si contiene comas, comillas o saltos de línea, envolver en comillas
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Construir CSV
  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = data.map(row => 
    fields.map(field => escapeCSV(row[field])).join(',')
  )

  return BOM + [headerRow, ...dataRows].join('\n')
}

function generateExcel(headers: string[], data: any[], fields: string[]): string {
  // Generar HTML table que Excel puede abrir
  const BOM = '\uFEFF'
  
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="UTF-8">
<!--[if gte mso 9]>
<xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet>
<x:Name>Datos</x:Name>
</x:ExcelWorksheet>
</x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; }
  th { background-color: #1e40af; color: white; font-weight: bold; padding: 8px; border: 1px solid #ccc; }
  td { padding: 8px; border: 1px solid #ccc; }
  tr:nth-child(even) { background-color: #f3f4f6; }
</style>
</head>
<body>
<table>
<thead>
<tr>
${headers.map(h => `<th>${escapeHTML(h)}</th>`).join('')}
</tr>
</thead>
<tbody>
${data.map(row => `<tr>${fields.map(field => `<td>${escapeHTML(row[field])}</td>`).join('')}</tr>`).join('\n')}
</tbody>
</table>
</body>
</html>`

  return BOM + html
}

function escapeHTML(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

