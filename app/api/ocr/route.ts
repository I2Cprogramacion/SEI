import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "@/lib/auth/verify-jwt"

const PDF_PROCESSOR_URL = process.env.PDF_PROCESSOR_URL || "http://localhost:8001"

export async function POST(request: NextRequest) {
  // Permitir procesamiento sin autenticación para el formulario de registro
  // pero validar token si se proporciona
  const authHeader = request.headers.get("authorization")
  let payload = null
  
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "")
    payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }
  }
  
  // Si no hay token, permitir el procesamiento (para registro público)
  // pero registrar la acción para auditoría
  if (!payload) {
    console.log("Procesamiento de PDF sin autenticación (registro público)")
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

    // Intentar conectar al servidor de procesamiento de PDFs
    let response: Response
    let result: any

    try {
      response = await fetch(`${PDF_PROCESSOR_URL}/process-pdf`, {
        method: "POST",
        body: pythonFormData,
        // Timeout de 30 segundos
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error del servidor OCR: ${errorData.detail || "Error desconocido"}`)
      }

      result = await response.json()
    } catch (error) {
      // Si el servidor Python no está disponible, usar fallback
      console.warn("Servidor de OCR no disponible, usando fallback:", error)
      
      // Fallback: devolver formulario vacío para llenado manual
      return NextResponse.json({
        success: true,
        data: {
          nombre_completo: "",
          curp: "",
          rfc: "",
          no_cvu: "",
          correo: "",
          telefono: "",
          ultimo_grado_estudios: "",
          empleo_actual: "",
          fecha_nacimiento: "",
          nacionalidad: "Mexicana",
          linea_investigacion: "",
        },
        fields_found: [],
        total_fields: 0,
        filename: file.name,
        fallback: true,
        message: "El procesamiento automático no está disponible. Por favor, completa el formulario manualmente."
      })
    }
    
    // Mapear los datos extraídos al formato esperado por el frontend
    const mappedData = {
      nombre_completo: result.extracted_data.nombre_completo || "",
      curp: result.extracted_data.curp || "",
      rfc: result.extracted_data.rfc || "",
      no_cvu: result.extracted_data.no_cvu || "",
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
