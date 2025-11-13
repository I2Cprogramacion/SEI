// =============================================================================
// Microservicio OCR para Railway
// =============================================================================
// 
// Este servicio procesa CVs en PDF y extrae información clave usando:
// - pdf-parse: Extracción de texto de PDFs
// - tesseract.js: OCR para PDFs escaneados (fallback)
// - express: Servidor HTTP
// - multer: Manejo de archivos
//
// =============================================================================

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// =============================================================================
// Configuración
// =============================================================================

// CORS - Permitir requests desde Vercel
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Multer - Configuración para recibir archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan archivos PDF'));
    }
  }
});

// =============================================================================
// Funciones de utilidad
// =============================================================================

/**
 * Extrae información específica del texto usando regex mejorados
 */
function extractData(text) {
  const data = {
    curp: null,
    rfc: null,
    no_cvu: null,
    correo: null,
    telefono: null,
    nombre_completo: null,
    fecha_nacimiento: null,
    institucion: null,
    grado_maximo_estudios: null,
    experiencia_laboral: null
  };

  // Limpiar y normalizar el texto
  let cleanText = text
    .replace(/\s+/g, ' ')  // Múltiples espacios a uno solo
    .replace(/[ÌÍÎÏ]/g, 'I') // Normalizar caracteres especiales
    .replace(/[ÒÓÔÕÖ]/g, 'O')
    .replace(/[ÙÚÛÜ]/g, 'U')
    .trim();
  
  console.log('📝 Texto limpio (primeros 500 chars):', cleanText.substring(0, 500));

  // =========================================================================
  // CURP (18 caracteres: 4 letras + 6 dígitos + H/M + 5 letras + 1 alfanumérico + 1 dígito)
  // Ejemplo: AESR850312HCHMNL02
  // Patrones mejorados para capturar variaciones
  // =========================================================================
  const curpPatterns = [
    // Con etiqueta explícita
    /(?:CURP|C\.U\.R\.P\.?)[:\s]*([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)/gi,
    // Sin etiqueta, solo el patrón
    /\b([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)\b/g,
    // Con separadores o espacios accidentales
    /\b([A-Z]{4}\s?\d{6}\s?[HM]\s?[A-Z]{5}\s?[A-Z0-9]\s?\d)\b/g
  ];
  
  for (const pattern of curpPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let curp = (match[1] || match[0]).replace(/\s/g, '').toUpperCase();
      // Validar longitud exacta
      if (curp.length === 18 && /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(curp)) {
        data.curp = curp;
        console.log('✅ CURP encontrado:', data.curp);
        break;
      }
    }
    if (data.curp) break;
  }

  // =========================================================================
  // RFC (13 caracteres: 4 letras + 6 dígitos + 3 alfanuméricos)
  // Ejemplo: AESR850312AB1
  // =========================================================================
  const rfcPatterns = [
    // Con etiqueta explícita
    /(?:RFC|R\.F\.C\.?)[:\s]*([A-Z]{4}\d{6}[A-Z0-9]{3})/gi,
    // Sin etiqueta, solo el patrón
    /\b([A-Z]{4}\d{6}[A-Z0-9]{3})\b/g,
    // Con separadores o espacios
    /\b([A-Z]{4}\s?\d{6}\s?[A-Z0-9]{3})\b/g
  ];
  
  for (const pattern of rfcPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let rfc = (match[1] || match[0]).replace(/\s/g, '').toUpperCase();
      // Validar longitud exacta y que no sea el mismo que CURP
      if (rfc.length === 13 && /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/.test(rfc) && rfc !== data.curp?.substring(0, 13)) {
        data.rfc = rfc;
        console.log('✅ RFC encontrado:', data.rfc);
        break;
      }
    }
    if (data.rfc) break;
  }

  // =========================================================================
  // CVU (número de 4-8 dígitos, típicamente después de "CVU:" o "NO.CVU:")
  // Ejemplo: CVU: 123456 o NO. CVU: 654321
  // =========================================================================
  const cvuPatterns = [
    // Con etiqueta específica
    /(?:CVU|C\.V\.U\.?|NO\.?\s*CVU)[:\s-]*(\d{4,8})/gi,
    /(?:número|numero|no\.?)\s*(?:CVU|cvu)[:\s-]*(\d{4,8})/gi,
    // Dentro de contexto
    /\bCVU[\s:-]*(\d{4,8})\b/gi,
    // Número aislado de 5-7 dígitos (último recurso)
    /\b(\d{5,7})\b/g
  ];
  
  let potentialCVU = null;
  for (const pattern of cvuPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      const captured = match[1] || match[0].match(/\d{4,8}/)?.[0];
      if (captured && captured.length >= 4 && captured.length <= 8) {
        // Preferir números de 5-7 dígitos
        if (!potentialCVU || (captured.length >= 5 && captured.length <= 7)) {
          potentialCVU = captured;
          console.log('🔍 CVU potencial encontrado:', potentialCVU);
        }
      }
    }
  }
  
  if (potentialCVU) {
    data.no_cvu = potentialCVU;
    console.log('✅ CVU confirmado:', data.no_cvu);
  }

  // =========================================================================
  // Email (formato estándar, más permisivo)
  // Ejemplo: juan.perez@universidad.edu.mx
  // =========================================================================
  const emailPatterns = [
    // Con etiqueta (capturar solo hasta el dominio)
    /(?:email|correo|e-mail|mail|electronic)[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi,
    // Sin etiqueta, con word boundaries estrictos
    /(?:^|\s)([A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,})(?:\s|$|[,;])/g,
    // Patrón general como último recurso
    /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g
  ];
  
  for (const pattern of emailPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let email = (match[1] || match[0]).toLowerCase().trim();
      
      // Limpiar caracteres no deseados al final (palabras pegadas)
      // Remover todo después del TLD (com, mx, edu, etc.)
      const emailMatch = email.match(/^([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
      if (emailMatch) {
        email = emailMatch[1];
      }
      
      // Remover cualquier texto pegado después del dominio
      email = email.replace(/\.(com|mx|edu|org|net|gob|gov|es|cl|ar|co|br)[a-z]+$/i, '.$1');
      
      // Validar formato estricto (debe terminar en TLD válido)
      if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|mx|edu|org|net|gob|gov|es|cl|ar|co|br|uk|us|ca|de|fr|it|jp|cn|in|au|nz)$/i.test(email)) {
        data.correo = email;
        console.log('✅ Email encontrado:', data.correo);
        break;
      }
    }
    if (data.correo) break;
  }

  // =========================================================================
  // Teléfono (formatos mexicanos mejorados)
  // Ejemplos: 614-123-4567, (614) 123 4567, +52 614 123 4567, 6141234567
  // =========================================================================
  const phonePatterns = [
    // Con etiqueta y formato completo
    /(?:teléfono|telefono|tel|phone|celular|móvil|movil)[:\s]*(\+?52)?[\s\-]?(\(?[0-9]{3}\)?)?[\s\-]?([0-9]{3})[\s\-]?([0-9]{4})/gi,
    // Formato internacional
    /\+52[\s\-]?(\d{2,3})[\s\-]?(\d{3,4})[\s\-]?(\d{4})/g,
    // Formato con paréntesis
    /\((\d{3})\)[\s\-]?(\d{3})[\s\-]?(\d{4})/g,
    // Formato con guiones
    /(\d{3})[\s\-](\d{3})[\s\-](\d{4})/g,
    // 10 dígitos seguidos
    /\b(\d{10})\b/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      // Extraer solo dígitos
      let phoneRaw = match[0].replace(/\D/g, '');
      
      // Si tiene +52, removerlo
      if (phoneRaw.startsWith('52') && phoneRaw.length > 10) {
        phoneRaw = phoneRaw.substring(2);
      }
      
      // Validar que tenga 10 dígitos y no sea una secuencia obvia
      if (phoneRaw.length === 10 && 
          !/^0{10}|1{10}|2{10}/.test(phoneRaw) &&
          phoneRaw !== data.curp?.substring(4, 14)) { // No es parte del CURP
        data.telefono = phoneRaw;
        console.log('✅ Teléfono encontrado:', data.telefono);
        break;
      }
    }
    if (data.telefono) break;
  }

  // =========================================================================
  // Nombre completo (patrones mejorados)
  // =========================================================================
  const namePatterns = [
    // Con título académico
    /(?:Dr\.?|Dra\.?|Prof\.?|Profesora?\.?|Mtro\.?|Mtra\.?|Lic\.?|Ing\.?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/g,
    // Con etiqueta "Nombre:"
    /(?:Nombre|Name)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/gi,
    // Patrón de 2-4 palabras capitalizadas
    /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})\b/g
  ];

  for (const pattern of namePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let nombre = (match[1] || match[0]).trim();
      // Limpiar títulos si quedaron
      nombre = nombre.replace(/^(?:Dr\.?|Dra\.?|Prof\.?|Mtro\.?|Mtra\.?|Lic\.?|Ing\.?)\s+/i, '');
      
      // Validar que tenga al menos 2 palabras y cada palabra tenga al menos 2 caracteres
      const palabras = nombre.split(/\s+/);
      if (palabras.length >= 2 && palabras.length <= 5 &&
          palabras.every(p => p.length >= 2) &&
          !/^(Universidad|Instituto|Centro|Facultad|Escuela)/i.test(nombre)) {
        data.nombre_completo = nombre;
        console.log('✅ Nombre encontrado:', data.nombre_completo);
        break;
      }
    }
    if (data.nombre_completo) break;
  }

  // =========================================================================
  // Fecha de nacimiento (formatos variados)
  // =========================================================================
  const datePatterns = [
    // Con etiqueta
    /(?:fecha\s+de\s+nacimiento|nacimiento|birth|born)[:\s]*(\d{1,2}[\s\/\-\.]\d{1,2}[\s\/\-\.]\d{4}|\d{4}[\s\/\-\.]\d{1,2}[\s\/\-\.]\d{1,2})/gi,
    // Sin etiqueta, formato DD/MM/YYYY o YYYY-MM-DD
    /\b(\d{1,2}[\s\/\-\.]\d{1,2}[\s\/\-\.](19|20)\d{2})\b/g,
    /\b((19|20)\d{2}[\s\/\-\.]\d{1,2}[\s\/\-\.]\d{1,2})\b/g
  ];

  for (const pattern of datePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let fecha = (match[1] || match[0]).replace(/\s/g, '').trim();
      // Validar que tenga año entre 1920 y 2010 (razonable para investigadores)
      if (/19[2-9]\d|20[0-1]\d/.test(fecha)) {
        data.fecha_nacimiento = fecha;
        console.log('✅ Fecha nacimiento encontrada:', data.fecha_nacimiento);
        break;
      }
    }
    if (data.fecha_nacimiento) break;
  }

  // =========================================================================
  // Institución (mejorado)
  // =========================================================================
  const institutionPatterns = [
    // Nombres completos de instituciones
    /(?:Universidad|Instituto|Centro|Facultad|Escuela)[\s\w]+(?:de|del|de\s+la|Autónoma|Nacional|Tecnológico|Politécnico|Tecnológica|Estatal|Federal)[\s\w,]+/gi,
    // Acrónimos comunes
    /\b(UACH|UNAM|IPN|ITESM|UAM|UANL|UABC|UDG|BUAP|UV|UJAT|UNACH|UAEH|CINVESTAV|CONACYT|CIBNOR|CICESE|COLMEX|ECOSUR)\b/gi,
    // Con contexto "Institución:"
    /(?:Institución|Affiliation|Institution)[:\s]+([^\n,.]{10,100})/gi
  ];

  for (const pattern of institutionPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let inst = (match[1] || match[0]).trim();
      if (inst.length >= 4 && inst.length <= 200) {
        data.institucion = inst;
        console.log('✅ Institución encontrada:', data.institucion);
        break;
      }
    }
    if (data.institucion) break;
  }

  // =========================================================================
  // Grado máximo de estudios
  // =========================================================================
  const degreePatterns = [
    // Grados completos con área
    /(Doctorado|PhD|D\.?Sc\.?|Maestría|Master|MSc|M\.?A\.?|Licenciatura|Ingeniería|Ing\.?|Lic\.?)[\s\w]*(?:en|de|del|in)[\s\w]{3,50}/gi,
    // Con etiqueta
    /(?:Grado|Degree|Título|Education)[:\s]+([^\n,.]{5,100})/gi
  ];

  for (const pattern of degreePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let grado = (match[1] || match[0]).trim();
      if (grado.length >= 5 && grado.length <= 150) {
        data.grado_maximo_estudios = grado;
        console.log('✅ Grado encontrado:', data.grado_maximo_estudios);
        break;
      }
    }
    if (data.grado_maximo_estudios) break;
  }

  // =========================================================================
  // Experiencia laboral / Puesto actual
  // =========================================================================
  const jobPatterns = [
    // Puestos académicos con contexto
    /(Profesor|Investigador|Docente|Académico|Catedrático|Coordinador|Director|Jefe|Responsable)[\s\w]*(?:de|del|de\s+la|en|at)[\s\w]{3,50}/gi,
    // Con etiqueta
    /(?:Puesto|Position|Empleo|Job|Current)[:\s]+([^\n,.]{5,100})/gi
  ];

  for (const pattern of jobPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let puesto = (match[1] || match[0]).trim();
      if (puesto.length >= 5 && puesto.length <= 150) {
        data.experiencia_laboral = puesto;
        console.log('✅ Experiencia encontrada:', data.experiencia_laboral);
        break;
      }
    }
    if (data.experiencia_laboral) break;
  }

  return data;
}

// =============================================================================
// Endpoints
// =============================================================================

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    service: 'SEI OCR Service',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * Endpoint principal: Procesar PDF
 */
app.post('/process-pdf', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  console.log('');
  console.log('='.repeat(80));
  console.log('🔵 [OCR] Nueva petición recibida');
  console.log('='.repeat(80));

  try {
    // Verificar que se recibió un archivo
    if (!req.file) {
      console.error('❌ [OCR] No se recibió archivo');
      return res.status(400).json({
        error: 'No se proporcionó ningún archivo',
        timestamp: Date.now()
      });
    }

    const file = req.file;
    console.log('📄 [OCR] Archivo recibido:');
    console.log('   - Nombre:', file.originalname);
    console.log('   - Tamaño:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('   - Tipo:', file.mimetype);

    // Verificar que sea PDF
    if (file.mimetype !== 'application/pdf') {
      console.error('❌ [OCR] Tipo de archivo inválido:', file.mimetype);
      return res.status(400).json({
        error: 'El archivo debe ser un PDF',
        received: file.mimetype,
        timestamp: Date.now()
      });
    }

    // Procesar PDF
    console.log('🔍 [OCR] Iniciando extracción de texto...');
    const pdfData = await pdfParse(file.buffer);
    const text = pdfData.text;

    console.log('📝 [OCR] Texto extraído:');
    console.log('   - Total páginas:', pdfData.numpages);
    console.log('   - Caracteres:', text.length);
    console.log('   - Primeros 200 chars:', text.substring(0, 200).replace(/\n/g, ' '));

    // Verificar que haya texto
    if (!text || text.trim().length < 20) {
      console.warn('⚠️  [OCR] PDF sin texto extraíble o muy corto');
      return res.status(400).json({
        error: 'El PDF no contiene texto extraíble o es demasiado corto. Por favor, verifica que el PDF contenga texto legible.',
        text_length: text?.length || 0,
        timestamp: Date.now()
      });
    }

    // Extraer datos específicos
    console.log('🔎 [OCR] Extrayendo datos específicos...');
    const extractedData = extractData(text);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log('');
    console.log('✅ [OCR] Procesamiento completado exitosamente');
    console.log('📊 [OCR] Resumen de datos extraídos:');
    console.log('   - CURP:', extractedData.curp ? '✅' : '❌');
    console.log('   - RFC:', extractedData.rfc ? '✅' : '❌');
    console.log('   - CVU:', extractedData.no_cvu ? '✅' : '❌');
    console.log('   - Email:', extractedData.correo ? '✅' : '❌');
    console.log('   - Teléfono:', extractedData.telefono ? '✅' : '❌');
    console.log('   - Nombre:', extractedData.nombre_completo ? '✅' : '❌');
    console.log('⏱️  [OCR] Tiempo de procesamiento:', processingTime, 'ms');
    console.log('='.repeat(80));

    // Responder con los datos extraídos
    res.json({
      success: true,
      data: extractedData,
      metadata: {
        filename: file.originalname,
        pages: pdfData.numpages,
        text_length: text.length,
        processing_time_ms: processingTime,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('');
    console.error('🔴 [OCR] ERROR CRÍTICO:');
    console.error('   - Mensaje:', error.message);
    console.error('   - Stack:', error.stack);
    console.error('='.repeat(80));

    res.status(500).json({
      error: 'Error al procesar el PDF',
      details: error.message,
      timestamp: Date.now()
    });
  }
});

// =============================================================================
// Error handlers
// =============================================================================

// Manejo de errores de multer (tamaño de archivo, etc.)
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo excede el tamaño máximo permitido de 10 MB',
        timestamp: Date.now()
      });
    }
    return res.status(400).json({
      error: 'Error al procesar el archivo',
      details: error.message,
      timestamp: Date.now()
    });
  }
  
  if (error) {
    return res.status(500).json({
      error: 'Error del servidor',
      details: error.message,
      timestamp: Date.now()
    });
  }
  
  next();
});

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method,
    timestamp: Date.now()
  });
});

// =============================================================================
// Inicio del servidor
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('='.repeat(80));
  console.log('🚀 Microservicio OCR iniciado');
  console.log('='.repeat(80));
  console.log('📍 Puerto:', PORT);
  console.log('🌍 Host: 0.0.0.0');
  console.log('🔗 URL local: http://localhost:' + PORT);
  console.log('📄 Health check: http://localhost:' + PORT + '/health');
  console.log('🔍 Endpoint OCR: http://localhost:' + PORT + '/process-pdf');
  console.log('='.repeat(80));
  console.log('');
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🔴 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔴 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

