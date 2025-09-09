import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "@/lib/auth/verify-jwt"

const PDF_PROCESSOR_URL = process.env.PDF_PROCESSOR_URL || "http://localhost:8001"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
  }
  const token = authHeader.replace("Bearer ", "")
  const payload = verifyJWT(token)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
  }

  try {
    // Obtener el archivo del formulario
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validar que sea un PDF
    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "El archivo debe ser un PDF" }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máximo 10MB)" }, { status: 400 })
    }

    // Crear FormData para enviar al servidor de Python
    const pythonFormData = new FormData()
    pythonFormData.append("file", file)

    // Enviar al servidor de procesamiento de PDFs
    const response = await fetch(`${PDF_PROCESSOR_URL}/process-pdf`, {
      method: "POST",
      body: pythonFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: `Error procesando PDF: ${errorData.detail || "Error desconocido"}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    // Mapear los datos extraídos al formato esperado por el frontend
    const mappedData = {
      nombre_completo: result.extracted_data.nombre_completo || "",
      curp: result.extracted_data.curp || "",
      rfc: result.extracted_data.rfc || "",
      noCvu: result.extracted_data.no_cvu || "",
      correo: result.extracted_data.correo || "",
      telefono: result.extracted_data.telefono || "",
      ultimo_grado_estudios: result.extracted_data.ultimo_grado_estudios || "",
      empleo_actual: result.extracted_data.empleo_actual || "",
      fecha_nacimiento: result.extracted_data.fecha_nacimiento || "",
      nacionalidad: result.extracted_data.nacionalidad || "Mexicana",
      linea_investigacion: "", // Este campo se mantiene vacío para captura manual
    }

    return NextResponse.json({
      success: true,
      data: mappedData,
      fields_found: result.fields_found,
      total_fields: result.total_fields,
      filename: result.filename
    })

  } catch (error) {
    console.error("Error en procesamiento de PDF:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al procesar PDF" },
      { status: 500 }
    )
  }
}
