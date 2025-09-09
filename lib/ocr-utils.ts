import Tesseract from 'tesseract.js'
import pdfParse from 'pdf-parse'

export interface ExtractedData {
  nombre_completo?: string
  curp?: string
  rfc?: string
  no_cvu?: string
  correo?: string
  telefono?: string
  ultimo_grado_estudios?: string
  empleo_actual?: string
  linea_investigacion?: string
  nacionalidad?: string
  fecha_nacimiento?: string
  institucion?: string
  departamento?: string
  ubicacion?: string
  archivo_procesado?: string
  origen?: string
}

export class OCRProcessor {
  /**
   * Procesa una imagen usando OCR
   */
  static async processImage(imageBuffer: Buffer): Promise<ExtractedData> {
    try {
      console.log('🔍 Iniciando procesamiento OCR de imagen...')
      
      // Verificar que Tesseract esté disponible
      if (typeof window !== 'undefined') {
        throw new Error('OCR no puede ejecutarse en el cliente. Debe ejecutarse en el servidor.')
      }

      // Importar Tesseract dinámicamente para evitar errores de inicialización
      let Tesseract
      try {
        Tesseract = await import('tesseract.js')
      } catch (importError) {
        console.error('❌ Error al importar Tesseract.js:', importError)
        throw new Error('Tesseract.js no está disponible. Por favor, verifica la instalación.')
      }

      console.log('📚 Tesseract.js importado correctamente')

      const { data: { text } } = await Tesseract.recognize(
        imageBuffer,
        'spa+eng', // Español e inglés
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`📊 Progreso OCR: ${Math.round(m.progress * 100)}%`)
            }
          }
        }
      )

      console.log('📝 Texto extraído:', text)
      
      if (!text || text.trim().length < 10) {
        throw new Error('No se pudo extraer texto de la imagen. Asegúrate de que la imagen sea clara y contenga texto legible.')
      }

      return this.parseText(text)
    } catch (error) {
      console.error('❌ Error en procesamiento OCR de imagen:', error)
      if (error instanceof Error) {
        throw new Error(`Error al procesar la imagen: ${error.message}`)
      }
      throw new Error('Error al procesar la imagen con OCR')
    }
  }

  /**
   * Procesa un PDF usando OCR
   */
  static async processPDF(pdfBuffer: Buffer): Promise<ExtractedData> {
    try {
      console.log('📄 Iniciando procesamiento de PDF...')
      
      // Verificar que pdf-parse esté disponible
      if (typeof window !== 'undefined') {
        throw new Error('Procesamiento de PDF no puede ejecutarse en el cliente. Debe ejecutarse en el servidor.')
      }

      // Importar pdf-parse dinámicamente
      let pdfParse
      try {
        pdfParse = await import('pdf-parse')
      } catch (importError) {
        console.error('❌ Error al importar pdf-parse:', importError)
        throw new Error('pdf-parse no está disponible. Por favor, verifica la instalación.')
      }

      console.log('📚 pdf-parse importado correctamente')

      // Primero intentamos extraer texto directamente del PDF
      const pdfData = await pdfParse.default(pdfBuffer)
      let text = pdfData.text

      console.log('📝 Texto extraído del PDF:', text)

      // Si el PDF no tiene texto extraíble, intentamos OCR en las páginas
      if (!text || text.trim().length < 50) {
        console.log('⚠️ PDF sin texto extraíble, intentando OCR...')
        // Para PDFs sin texto, necesitaríamos convertir a imágenes primero
        // Por ahora, retornamos un error indicando que se necesita una imagen
        throw new Error('El PDF no contiene texto extraíble. Por favor, sube una imagen (JPG, PNG) del documento.')
      }

      return this.parseText(text)
    } catch (error) {
      console.error('❌ Error en procesamiento de PDF:', error)
      if (error instanceof Error) {
        throw new Error(`Error al procesar el PDF: ${error.message}`)
      }
      throw new Error('Error al procesar el PDF')
    }
  }

  /**
   * Parsea el texto extraído para encontrar información específica
   */
  private static parseText(text: string): ExtractedData {
    const data: ExtractedData = {}

    // Limpiar el texto
    const cleanText = text.replace(/\s+/g, ' ').trim()
    console.log('📝 Texto a procesar:', cleanText.substring(0, 200) + '...')

    // Extraer CURP (18 caracteres alfanuméricos)
    const curpPatterns = [
      /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/,
      /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/
    ]
    
    for (const pattern of curpPatterns) {
      const curpMatch = cleanText.match(pattern)
      if (curpMatch) {
        data.curp = curpMatch[0]
        console.log('✅ CURP encontrado:', data.curp)
        break
      }
    }

    // Extraer RFC (13 caracteres alfanuméricos)
    const rfcPatterns = [
      /\b[A-Z]{4}\d{6}[A-Z0-9]{3}\b/,
      /\b[A-Z]{4}\d{6}[A-Z0-9]{3}\b/
    ]
    
    for (const pattern of rfcPatterns) {
      const rfcMatch = cleanText.match(pattern)
      if (rfcMatch) {
        data.rfc = rfcMatch[0]
        console.log('✅ RFC encontrado:', data.rfc)
        break
      }
    }

    // Extraer email
    const emailPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    ]
    
    for (const pattern of emailPatterns) {
      const emailMatch = cleanText.match(pattern)
      if (emailMatch) {
        data.correo = emailMatch[0]
        console.log('✅ Email encontrado:', data.correo)
        break
      }
    }

    // Extraer teléfono (múltiples formatos)
    const phonePatterns = [
      /(\+?52\s?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/,
      /(\+?52\s?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/,
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/
    ]
    
    for (const pattern of phonePatterns) {
      const phoneMatch = cleanText.match(pattern)
      if (phoneMatch) {
        data.telefono = phoneMatch[0].replace(/\s+/g, ' ').trim()
        console.log('✅ Teléfono encontrado:', data.telefono)
        break
      }
    }

    // Extraer nombre completo (buscar patrones comunes)
    const namePatterns = [
      /(?:Dr\.?|Dra\.?|Prof\.?|Profesora\.?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/,
      /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/,
      /(?:Nombre|Name):\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i
    ]

    for (const pattern of namePatterns) {
      const nameMatch = cleanText.match(pattern)
      if (nameMatch) {
        data.nombre_completo = nameMatch[1] || nameMatch[0]
        console.log('✅ Nombre encontrado:', data.nombre_completo)
        break
      }
    }

    // Extraer fecha de nacimiento
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(?:Fecha|Date).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
    ]

    for (const pattern of datePatterns) {
      const dateMatch = cleanText.match(pattern)
      if (dateMatch) {
        data.fecha_nacimiento = dateMatch[1]
        console.log('✅ Fecha encontrada:', data.fecha_nacimiento)
        break
      }
    }

    // Extraer CVU (número de 4-6 dígitos)
    const cvuPatterns = [
      /\b\d{4,6}\b/,
      /(?:CVU|CVU):\s*(\d{4,6})/i
    ]
    
    for (const pattern of cvuPatterns) {
      const cvuMatch = cleanText.match(pattern)
      if (cvuMatch) {
        data.no_cvu = cvuMatch[1] || cvuMatch[0]
        console.log('✅ CVU encontrado:', data.no_cvu)
        break
      }
    }

    // Extraer grado de estudios
    const degreePatterns = [
      /(Doctorado|Maestría|Licenciatura|Especialidad).*?(?:en|de|del)\s+([^,.\n]+)/i,
      /(PhD|MSc|M\.?A\.?|B\.?A\.?|B\.?S\.?|Ing\.?|Lic\.?|Dr\.?|Dra\.?)\s+([^,.\n]+)/i,
      /(?:Grado|Degree|Título):\s*([^,.\n]+)/i
    ]

    for (const pattern of degreePatterns) {
      const degreeMatch = cleanText.match(pattern)
      if (degreeMatch) {
        data.ultimo_grado_estudios = degreeMatch[0]
        console.log('✅ Grado encontrado:', data.ultimo_grado_estudios)
        break
      }
    }

    // Extraer institución
    const institutionPatterns = [
      /(?:Universidad|Instituto|Centro|Facultad).*?(?:de|del|de la|Autónoma|Nacional|Tecnológico)[^,.\n]+/i,
      /(?:UACH|UNAM|IPN|ITESM|UANL|UABC|UADY|UASLP|UAZ|UCOL|UDG|UJED|UMAR|UMSNH|UNAM|UNISON|UPAEP|UPN|UQROO|UAS|UAT|UATX|UAZ|UCOL|UDG|UJED|UMAR|UMSNH|UNAM|UNISON|UPAEP|UPN|UQROO|UAS|UAT|UATX)/i,
      /(?:Institución|Institution):\s*([^,.\n]+)/i
    ]

    for (const pattern of institutionPatterns) {
      const institutionMatch = cleanText.match(pattern)
      if (institutionMatch) {
        data.institucion = institutionMatch[1] || institutionMatch[0]
        console.log('✅ Institución encontrada:', data.institucion)
        break
      }
    }

    // Extraer empleo actual
    const jobPatterns = [
      /(?:Profesor|Investigador|Docente|Académico).*?(?:Titular|Asociado|Auxiliar|Adjunto|Emérito)[^,.\n]+/i,
      /(?:Catedrático|Coordinador|Director|Jefe|Responsable).*?(?:de|del|de la)[^,.\n]+/i,
      /(?:Empleo|Job|Posición):\s*([^,.\n]+)/i
    ]

    for (const pattern of jobPatterns) {
      const jobMatch = cleanText.match(pattern)
      if (jobMatch) {
        data.empleo_actual = jobMatch[1] || jobMatch[0]
        console.log('✅ Empleo encontrado:', data.empleo_actual)
        break
      }
    }

    // Nacionalidad por defecto
    if (!data.nacionalidad) {
      data.nacionalidad = 'Mexicana'
    }

    console.log('📊 Resumen de datos extraídos:', data)
    return data
  }

  /**
   * Valida si un archivo es una imagen soportada
   */
  static isImageFile(file: File): boolean {
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff']
    return supportedTypes.includes(file.type)
  }

  /**
   * Valida si un archivo es un PDF
   */
  static isPDFFile(file: File): boolean {
    return file.type === 'application/pdf'
  }
}
