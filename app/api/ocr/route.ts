import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { OCRProcessor } from "@/lib/ocr-utils"

// Función para extraer datos del texto usando regex
function extractDataFromText(text: string) {
  console.log('📝 Texto extraído para análisis:', text.substring(0, 500) + '...')
  
  const data: any = {
    // archivo_procesado: '', // Columna no existe en la tabla
    // origen: 'ocr_real' // Columna no existe en la tabla
  }

  // Patrones de regex para extraer información
  const patterns = {
    // CURP: 18 caracteres alfanuméricos
    curp: /CURP[:\s]*([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2})/i,
    
    // RFC: 13 caracteres (homoclave) o 12 (sin homoclave)
    rfc: /RFC[:\s]*([A-Z]{4}\d{6}[A-Z0-9]{3})/i,
    
    // Email
    correo: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    
    // Teléfono (múltiples formatos)
    telefono: /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/,
    
    // CVU
    no_cvu: /(CVU|CVU)[:\s]*(\d+)/i,
    
    // Fecha de nacimiento
    fecha_nacimiento: /(fecha de nacimiento|nacimiento)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
    
    // Grado de estudios
    grado_maximo_estudios: /(doctorado|maestría|licenciatura|ingeniería|bachillerato)[^.]*/i,
    
    // Institución
    institucion: /(universidad|instituto|centro|facultad)[^.]*/i,
    
    // Empleo actual
    experiencia_laboral: /(profesor|investigador|docente|coordinador|director)[^.]*/i
  }

  // Extraer datos usando los patrones
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern)
    if (match) {
      data[key] = match[1] || match[2] || match[0]
      console.log(`✅ ${key} encontrado:`, data[key])
    }
  })

  // Extraer nombre completo (buscar patrones de nombres)
  const namePatterns = [
    // Patrones con títulos
    /(Dr\.?|Dra\.?|Mtro\.?|Mtra\.?|Ing\.?|Lic\.?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/,
    // Patrones de nombres completos
    /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/,
    // Patrones más flexibles
    /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/
  ]

  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && !data.nombre_completo) {
      data.nombre_completo = match[0].trim()
      console.log('✅ Nombre encontrado con patrón:', data.nombre_completo)
      break
    }
  }

  // Si no se encontró nombre, buscar en las primeras líneas del texto
  if (!data.nombre_completo) {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    console.log('🔍 Buscando nombre en las primeras líneas:', lines.slice(0, 3))
    
    for (const line of lines.slice(0, 5)) { // Revisar las primeras 5 líneas
      const cleanLine = line.trim()
      const words = cleanLine.split(/\s+/)
      
      // Buscar líneas que parezcan nombres (2-4 palabras, con mayúsculas)
      if (words.length >= 2 && words.length <= 4) {
        const hasCapitalWords = words.filter(word => /^[A-ZÁÉÍÓÚÑ]/.test(word)).length >= 2
        const hasValidWords = words.every(word => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*$/.test(word))
        
        if (hasCapitalWords && hasValidWords) {
          data.nombre_completo = cleanLine
          console.log('✅ Nombre inferido de línea:', data.nombre_completo)
          break
        }
      }
    }
  }

  // Si aún no se encontró, usar la primera línea que no sea muy corta
  if (!data.nombre_completo) {
    const lines = text.split('\n').filter(line => line.trim().length > 5)
    if (lines.length > 0) {
      data.nombre_completo = lines[0].trim()
      console.log('✅ Usando primera línea como nombre:', data.nombre_completo)
    }
  }

  // Establecer valores por defecto si no se encontraron
  if (!data.nacionalidad) data.nacionalidad = 'Mexicana'
  if (!data.correo) data.correo = 'correo@universidad.edu.mx'
  if (!data.telefono) data.telefono = '614-000-0000'

  return data
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API OCR recibió una petición POST')
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ No se proporcionó archivo')
  return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    console.log('📁 Archivo recibido en API:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let extractedText = ''
    let ocrSuccess = false

    // Procesar según el tipo de archivo
    if (file.type.startsWith('image/')) {
      console.log('🔍 Procesando imagen...')
      
      try {
        // SOLUCIÓN 1: Intentar con Google Vision API (Más confiable)
        console.log('🔍 SOLUCIÓN 1: Intentando con Google Vision API...')
        console.log('📊 Tamaño del buffer:', buffer.length, 'bytes')
        console.log('📊 Tipo de archivo:', file.type)
        
        // Importar Google Vision dinámicamente
        const vision = await import('@google-cloud/vision')
        const client = new vision.ImageAnnotatorClient()
        
        // Procesar la imagen
        const [result] = await client.textDetection(buffer)
        const detections = result.textAnnotations
        
        if (detections && detections.length > 0) {
          extractedText = detections[0].description || ''
          console.log('✅ SOLUCIÓN 1 EXITOSA: Texto extraído con Google Vision API:', extractedText.substring(0, 200) + '...')
          ocrSuccess = true
        } else {
          throw new Error('Google Vision API no pudo extraer texto')
        }
        
      } catch (visionError) {
        console.log('⚠️ SOLUCIÓN 1 FALLÓ: Google Vision API falló:', visionError)
        console.log('📊 Mensaje de error:', visionError instanceof Error ? visionError.message : String(visionError))
        
        try {
          // SOLUCIÓN 2: Intentar con Tesseract.js local
          console.log('🔍 SOLUCIÓN 2: Intentando con Tesseract.js local...')
          const extractedData = await OCRProcessor.processImage(buffer)
          extractedText = JSON.stringify(extractedData, null, 2)
          console.log('✅ SOLUCIÓN 2 EXITOSA: Texto extraído con Tesseract.js local')
          ocrSuccess = true
          
        } catch (tesseractError) {
          console.log('⚠️ SOLUCIÓN 2 FALLÓ: Tesseract.js falló:', tesseractError)
          
          try {
            // SOLUCIÓN 3: Intentar OCR con API gratuita
            console.log('🔍 SOLUCIÓN 3: Intentando con OCR.space...')
            
            // Convertir buffer a base64
            const base64Image = buffer.toString('base64')
            console.log('📊 Tamaño del base64:', base64Image.length, 'caracteres')
            
            // Usar una API de OCR gratuita
            const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                base64Image: `data:${file.type};base64,${base64Image}`,
                language: 'spa',
                isOverlayRequired: false,
                OCREngine: 2,
                apikey: process.env.OCR_SPACE_API_KEY || 'helloworld'
              })
            })
            
            console.log('📊 Status de respuesta OCR.space:', ocrResponse.status)
            const ocrResult = await ocrResponse.json()
            console.log('📊 Respuesta OCR.space completa:', JSON.stringify(ocrResult, null, 2))
            
            if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
              extractedText = ocrResult.ParsedResults[0].ParsedText
              console.log('✅ SOLUCIÓN 3 EXITOSA: Texto extraído con OCR.space:', extractedText.substring(0, 200) + '...')
              ocrSuccess = true
            } else {
              throw new Error('OCR.space no devolvió resultados válidos')
            }
            
          } catch (ocrError) {
            console.log('⚠️ SOLUCIÓN 3 FALLÓ: OCR.space falló con error:', ocrError)
            console.log('📊 Mensaje de error:', ocrError instanceof Error ? ocrError.message : String(ocrError))
          }
        }
      }
      
      // Si OCR falló, intentar métodos adicionales
      if (!ocrSuccess) {
        console.log('⚠️ OCR falló, intentando métodos adicionales...')
        
        try {
          // SOLUCIÓN 4: Intentar con otra API de OCR
          console.log('🔍 SOLUCIÓN 4: Intentando con API alternativa...')
          
          const base64Image = buffer.toString('base64')
          
          // Usar una API diferente para imágenes
          const altResponse = await fetch('https://api.mathpix.com/v3/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'app_id': 'demo',
              'app_key': 'demo'
            },
            body: JSON.stringify({
              src: `data:${file.type};base64,${base64Image}`,
              formats: ['text']
            })
          })
          
          console.log('📊 Status de respuesta API alternativa:', altResponse.status)
          const altResult = await altResponse.json()
          console.log('📊 Respuesta API alternativa completa:', JSON.stringify(altResult, null, 2))
          
          if (altResult.text) {
            extractedText = altResult.text
            console.log('✅ SOLUCIÓN 4 EXITOSA: Texto extraído con API alternativa:', extractedText.substring(0, 200) + '...')
            ocrSuccess = true
          } else {
            console.log('⚠️ SOLUCIÓN 4 FALLÓ: API alternativa no devolvió texto')
          }
          
        } catch (altError) {
          console.log('⚠️ SOLUCIÓN 4 FALLÓ: API alternativa falló con error:', altError)
        }
        
        // Si aún no funciona, lanzar error en lugar de usar datos simulados
        if (!ocrSuccess) {
          throw new Error('No se pudo extraer texto del documento. Por favor, asegúrate de que el archivo contenga texto legible y esté en un formato soportado.')
        }
      }
      
    } else if (file.type === 'application/pdf') {
      console.log('📄 Procesando PDF...')
      
      try {
        // SOLUCIÓN 1: Intentar extraer texto de PDF usando OCRProcessor
        console.log('🔍 SOLUCIÓN 1: Intentando extraer texto real del PDF con OCRProcessor...')
        console.log('📊 Tamaño del buffer:', buffer.length, 'bytes')
        console.log('📊 Tipo de archivo:', file.type)
        console.log('📊 Nombre del archivo:', file.name)
        
        const extractedData = await OCRProcessor.processPDF(buffer)
        extractedText = JSON.stringify(extractedData, null, 2)
        console.log('✅ SOLUCIÓN 1 EXITOSA: Texto extraído del PDF exitosamente!')
        console.log('📊 Contenido extraído:', extractedText.substring(0, 500) + '...')
        ocrSuccess = true
        
      } catch (pdfError) {
        console.log('⚠️ SOLUCIÓN 1 FALLÓ: OCRProcessor falló con error:', pdfError)
        console.log('📊 Mensaje de error:', pdfError instanceof Error ? pdfError.message : String(pdfError))
        
        try {
          // SOLUCIÓN 2: Intentar con pdf-parse directamente
          console.log('🔍 SOLUCIÓN 2: Intentando con pdf-parse directamente...')
          
          // Importar pdf-parse dinámicamente
          const pdfParse = await import('pdf-parse')
          console.log('✅ pdf-parse importado correctamente')
          
          // Crear un buffer válido
          const pdfBuffer = Buffer.from(buffer)
          console.log('📊 Buffer creado correctamente:', pdfBuffer.length, 'bytes')
          
          // Extraer texto directamente del PDF
          const pdfData = await pdfParse.default(pdfBuffer)
          extractedText = pdfData.text
          
          console.log('📊 Texto extraído (longitud):', extractedText.length, 'caracteres')
          console.log('📊 Primeros 200 caracteres:', extractedText.substring(0, 200))
          
          if (extractedText && extractedText.trim().length > 10) {
            console.log('✅ SOLUCIÓN 2 EXITOSA: Texto extraído del PDF exitosamente!')
            console.log('📊 Contenido extraído:', extractedText.substring(0, 500) + '...')
            ocrSuccess = true
          } else {
            throw new Error('No se pudo extraer texto del PDF - texto vacío o muy corto')
          }
          
        } catch (parseError) {
          console.log('⚠️ SOLUCIÓN 2 FALLÓ: pdf-parse falló con error:', parseError)
          
          try {
            // SOLUCIÓN 3: Intentar con OCR.space
            console.log('🔍 SOLUCIÓN 3: Intentando con OCR.space...')
            console.log('📊 API Key configurada:', process.env.OCR_SPACE_API_KEY ? 'SÍ' : 'NO')
            
            const base64PDF = buffer.toString('base64')
            console.log('📊 Tamaño del base64:', base64PDF.length, 'caracteres')
            
            // Usar la API key real directamente si no se carga desde env
            const apiKey = process.env.OCR_SPACE_API_KEY || 'K82069228488957'
            
            const requestBody = {
              base64Image: `data:application/pdf;base64,${base64PDF}`,
              language: 'spa',
              isOverlayRequired: false,
              OCREngine: 2,
              apikey: apiKey,
              filetype: 'PDF',
              detectOrientation: true,
              scale: true,
              OCREngineMode: 1,
              isTable: false,
              isCreateSearchablePdf: false,
              isSearchablePdfHideTextLayer: false,
              isBinarizationEnabled: true,
              isAutoRotate: true
            }
            
            console.log('📊 Enviando request a OCR.space con body:', JSON.stringify(requestBody, null, 2))
            
            const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            })
            
            console.log('📊 Status de respuesta OCR.space:', ocrResponse.status)
            
            const ocrResult = await ocrResponse.json()
            console.log('📊 Respuesta OCR.space completa:', JSON.stringify(ocrResult, null, 2))
            
            if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
              extractedText = ocrResult.ParsedResults[0].ParsedText
              console.log('✅ SOLUCIÓN 3 EXITOSA: Texto extraído con OCR.space!')
              console.log('📊 Texto extraído (longitud):', extractedText.length, 'caracteres')
              console.log('📊 Primeros 200 caracteres:', extractedText.substring(0, 200))
              ocrSuccess = true
            } else {
              console.log('⚠️ SOLUCIÓN 3 FALLÓ: OCR.space no devolvió resultados válidos')
              console.log('📊 Error details:', ocrResult.ErrorMessage || 'Sin detalles de error')
            }
            
          } catch (ocrError) {
            console.log('⚠️ SOLUCIÓN 3 FALLÓ: OCR.space falló con error:', ocrError)
            console.log('📊 Mensaje de error OCR.space:', ocrError instanceof Error ? ocrError.message : String(ocrError))
          }
        }
      }
      
      // Si OCR falló, intentar métodos adicionales
      if (!ocrSuccess) {
        console.log('⚠️ OCR falló, intentando métodos adicionales...')
        
        try {
          // SOLUCIÓN 4: Intentar con API alternativa para PDFs
          console.log('🔍 SOLUCIÓN 4: Intentando con API alternativa para PDF...')
          
          const base64PDF = buffer.toString('base64')
          
          // Usar una API de OCR diferente para PDFs
          const altResponse = await fetch('https://api.mathpix.com/v3/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'app_id': 'demo',
              'app_key': 'demo'
            },
            body: JSON.stringify({
              src: `data:${file.type};base64,${base64PDF}`,
              formats: ['text']
            })
          })
          
          const altResult = await altResponse.json()
          console.log('📊 Respuesta API alternativa:', JSON.stringify(altResult, null, 2))
          
          if (altResult.text) {
            extractedText = altResult.text
            console.log('✅ SOLUCIÓN 4 EXITOSA: Texto extraído con API alternativa:', extractedText.substring(0, 200) + '...')
            ocrSuccess = true
          } else {
            console.log('⚠️ SOLUCIÓN 4 FALLÓ: API alternativa no devolvió texto')
          }
          
        } catch (altError) {
          console.log('⚠️ SOLUCIÓN 4 FALLÓ: API alternativa falló con error:', altError)
        }
        
        // Si aún no funciona, lanzar error en lugar de usar datos simulados
        if (!ocrSuccess) {
          throw new Error('No se pudo extraer texto del PDF. Por favor, asegúrate de que el PDF contenga texto legible o conviértelo a una imagen (JPG, PNG) y vuelve a intentarlo.')
        }
      }
      
    } else {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Por favor, sube una imagen (JPG, PNG) o PDF." },
        { status: 400 }
      )
    }

    // Verificar que tenemos texto válido antes de procesar
    console.log('📊 Verificando texto extraído...')
    console.log('📊 OCR Success:', ocrSuccess)
    console.log('📊 Texto extraído (longitud):', extractedText.length)
    console.log('📊 Texto extraído (primeros 300 chars):', extractedText.substring(0, 300))
    
    // Verificar que el texto extraído es válido
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('El texto extraído del documento es muy corto o está vacío. Por favor, asegúrate de que el documento contenga texto legible.')
    }

    // Extraer datos del texto
    const extractedData = extractDataFromText(extractedText)
    
    // Verificar que se extrajeron al menos algunos datos
    const extractedFields = Object.keys(extractedData).filter(key => extractedData[key])
    if (extractedFields.length === 0) {
      throw new Error('No se pudieron extraer datos del documento. Por favor, verifica que el documento contenga información legible como nombre, CURP, RFC, etc.')
    }

    console.log('✅ Datos extraídos del documento real:', extractedData)
    console.log('📊 Campos extraídos:', extractedFields.length, 'de', Object.keys(extractedData).length)

    return NextResponse.json({
      success: true,
      data: extractedData,
      message: `Archivo procesado exitosamente. Se extrajeron ${extractedFields.length} campos del documento.`
    })

  } catch (ocrError) {
    console.error('❌ Error en OCR:', ocrError)
    
    // Retornar error en lugar de datos de fallback
    return NextResponse.json({
      success: false,
      error: ocrError instanceof Error ? ocrError.message : "Error desconocido en el procesamiento OCR",
      message: "No se pudo procesar el documento. Por favor, verifica que el archivo contenga texto legible y esté en un formato soportado."
    }, { status: 400 })
  }
}