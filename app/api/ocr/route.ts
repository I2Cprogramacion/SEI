import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "@/lib/auth/verify-jwt"

const PDF_PROCESSOR_URL = process.env.PDF_PROCESSOR_URL || "http://localhost:8000"

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
  signal: AbortSignal.timeout(90000),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error del servidor OCR: ${errorData.detail || "Error desconocido"}`)
      }

      result = await response.json()
      // Si la respuesta viene en formato local, adaptar
      if (result.data) {
        result = {
          extracted_data: result.data,
          fields_found: Object.keys(result.data).filter(k => result.data[k]),
          total_fields: Object.keys(result.data).filter(k => result.data[k]).length,
          filename: file.name
        }
      }
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
    
    // Normalizar y limpiar los datos extraídos
    function cleanField(value: any) {
      if (!value || typeof value !== "string") return "";
      return value.trim().replace(/\s+/g, " ");
    }

    // Si el OCR no extrajo suficientes datos, dejar los campos faltantes en blanco
    // Mapeo flexible: incluir todos los campos extraídos por el OCR
    const camposBase = [
      "nombre_completo",
      "curp",
      "rfc",
      "no_cvu",
      "correo",
      "telefono",
      "ultimo_grado_estudios",
      "empleo_actual",
      "fecha_nacimiento",
      "nacionalidad",
      "linea_investigacion"
    ];

    const mappedData: Record<string, string> = {};
    // Primero, asignar los campos base
    for (const campo of camposBase) {
      if (campo === "linea_investigacion") {
        mappedData[campo] = "";
      } else if (campo === "nacionalidad") {
        mappedData[campo] = cleanField(result.extracted_data?.nacionalidad) || "Mexicana";
      } else {
        mappedData[campo] = cleanField(result.extracted_data?.[campo]) || "";
      }
    }
    // Luego, agregar cualquier campo adicional extraído por el OCR
    if (result.extracted_data) {
      for (const [key, value] of Object.entries(result.extracted_data)) {
        if (!(key in mappedData)) {
          mappedData[key] = cleanField(value) || "";
        }
      }
    }

    // Validación adicional para formatos específicos
    // CURP: 18 caracteres alfanuméricos
    if (mappedData.curp && !/^([A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2})$/i.test(mappedData.curp)) {
      mappedData.curp = "";
    }
    // RFC: 10-13 caracteres alfanuméricos
    if (mappedData.rfc && !/^([A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3})$/i.test(mappedData.rfc)) {
      mappedData.rfc = "";
    }
    // Correo: formato email
    if (mappedData.correo && !/^\S+@\S+\.\S+$/.test(mappedData.correo)) {
      mappedData.correo = "";
    }
    // Teléfono: solo dígitos, 10 caracteres
    if (mappedData.telefono) {
      const tel = mappedData.telefono.replace(/\D/g, "");
      mappedData.telefono = tel.length === 10 ? tel : "";
    }

    return NextResponse.json({
      success: true,
      data: mappedData,
      fields_found: result.fields_found,
      total_fields: result.total_fields,
      filename: result.filename
    });

  } catch (error) {
    console.error("Error en procesamiento de PDF:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al procesar PDF" },
      { status: 500 }
    )
  }
}
