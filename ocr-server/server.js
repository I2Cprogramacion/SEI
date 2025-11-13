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
 * Extrae información específica del texto usando regex
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

  // Limpiar el texto
  const cleanText = text.replace(/\s+/g, ' ').trim();
  console.log('📝 Texto limpio (primeros 300 chars):', cleanText.substring(0, 300));

  // =========================================================================
  // CURP (18 caracteres: 4 letras + 6 dígitos + H/M + 5 letras + 1 alfanumérico + 1 dígito)
  // Ejemplo: AESR850312HCHMNL02
  // =========================================================================
  const curpPatterns = [
    /(?:CURP|curp)[:\s]*([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)/gi,
    /\b([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)\b/g
  ];
  
  for (const pattern of curpPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.curp = match[1] ? match[1].toUpperCase() : match[0].toUpperCase();
      console.log('✅ CURP encontrado:', data.curp);
      break;
    }
  }

  // =========================================================================
  // RFC (13 caracteres: 4 letras + 6 dígitos + 3 alfanuméricos)
  // Ejemplo: AESR850312AB1
  // =========================================================================
  const rfcPatterns = [
    /(?:RFC|rfc)[:\s]*([A-Z]{4}\d{6}[A-Z0-9]{3})/gi,
    /\b([A-Z]{4}\d{6}[A-Z0-9]{3})\b/g
  ];
  
  for (const pattern of rfcPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.rfc = match[1] ? match[1].toUpperCase() : match[0].toUpperCase();
      console.log('✅ RFC encontrado:', data.rfc);
      break;
    }
  }

  // =========================================================================
  // CVU (número de 4-8 dígitos, típicamente después de "CVU:" o "NO.CVU:")
  // Ejemplo: CVU: 123456
  // =========================================================================
  const cvuPatterns = [
    /(?:CVU|cvu|C\.V\.U\.)[:\s-]*(\d{4,8})/gi,
    /(?:número|numero|no\.?)\s*(?:CVU|cvu)[:\s-]*(\d{4,8})/gi,
    /\bCVU\s*(\d{4,8})\b/gi
  ];
  
  for (const pattern of cvuPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      // Capturar el grupo si existe, si no, el match completo
      const captured = match[0].match(/\d{4,8}/);
      if (captured) {
        data.no_cvu = captured[0];
        console.log('✅ CVU encontrado:', data.no_cvu);
        break;
      }
    }
  }

  // =========================================================================
  // Email (formato estándar)
  // Ejemplo: juan.perez@universidad.edu.mx
  // =========================================================================
  const emailPatterns = [
    /(?:email|correo|e-mail|mail|electronic)[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi,
    /\b([A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g
  ];
  
  for (const pattern of emailPatterns) {
    const matches = [...cleanText.matchAll(pattern)];
    for (const match of matches) {
      let email = (match[1] || match[0]).toLowerCase().trim();
      
      // Limpiar texto pegado después del dominio (ej: @gmail.comcelular -> @gmail.com)
      email = email.replace(/\.(com|mx|edu|org|net|gob|gov|es|cl|ar|co|br)[a-z]+$/i, '.$1');
      
      // Validar que termine en TLD válido
      if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|mx|edu|org|net|gob|gov|es|cl|ar|co|br|uk|us|ca|de|fr|it|jp|cn)$/i.test(email)) {
        data.correo = email;
        console.log('✅ Email encontrado:', data.correo);
        break;
      }
    }
    if (data.correo) break;
  }

  // =========================================================================
  // Teléfono (formatos mexicanos: +52, 10 dígitos, con/sin separadores)
  // Ejemplos: 614-123-4567, (614) 123 4567, +52 614 123 4567
  // =========================================================================
  const phonePatterns = [
    /(?:teléfono|telefono|tel|phone|celular|móvil|movil)[:\s]*(\+?52)?[\s\-]?(\d{10})/gi,
    /(?:teléfono|telefono|tel|phone)[:\s]*(\+?52)?[\s\-]?\(?(\d{3})\)?[\s\-]?(\d{3})[\s\-]?(\d{4})/gi,
    /\b(\d{10})\b/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = [...cleanText.matchAll(pattern)];
    for (const match of matches) {
      // Extraer solo dígitos
      let phoneRaw = match[0].replace(/\D/g, '');
      // Si tiene +52 al inicio, removerlo
      if (phoneRaw.length > 10 && phoneRaw.startsWith('52')) {
        phoneRaw = phoneRaw.substring(2);
      }
      // Validar que tenga exactamente 10 dígitos
      if (phoneRaw.length === 10 && !/^0{10}|1{10}/.test(phoneRaw)) {
        data.telefono = phoneRaw;
        console.log('✅ Teléfono encontrado:', data.telefono);
        break;
      }
    }
    if (data.telefono) break;
  }

  // =========================================================================
  // Nombre completo (buscar patrones con títulos académicos o formato "Nombre:")
  // Ejemplos: Dr. Juan Alberto Pérez López, Nombre: María Elena García
  // =========================================================================
  const namePatterns = [
    /(?:Dr\.?|Dra\.?|Prof\.?|Profesora?\.?|Mtro\.?|Mtra\.?|Lic\.?|Ing\.?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/gi,
    /(?:Nombre|Name)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/gi
  ];

  for (const pattern of namePatterns) {
    const matches = [...cleanText.matchAll(pattern)];
    for (const match of matches) {
      let nombre = (match[1] || match[0]).trim();
      // Limpiar títulos si quedaron
      nombre = nombre.replace(/^(?:Dr\.?|Dra\.?|Prof\.?|Mtro\.?|Mtra\.?|Lic\.?|Ing\.?)\s+/i, '');
      
      const palabras = nombre.split(/\s+/);
      // Validar que tenga al menos 2 palabras (nombre y apellido)
      if (palabras.length >= 2 && palabras.length <= 5 && 
          palabras.every(p => p.length >= 2)) {
        data.nombre_completo = nombre;
        console.log('✅ Nombre encontrado:', data.nombre_completo);
        break;
      }
    }
    if (data.nombre_completo) break;
  }

  // =========================================================================
  // Fecha de nacimiento (formatos: DD/MM/YYYY, YYYY-MM-DD)
  // =========================================================================
  const datePatterns = [
    /(?:fecha\s+de\s+nacimiento|nacimiento|birth)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g
  ];

  for (const pattern of datePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const captured = match[0].match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/);
      if (captured) {
        data.fecha_nacimiento = captured[0];
        console.log('✅ Fecha nacimiento encontrada:', data.fecha_nacimiento);
        break;
      }
    }
  }

  // =========================================================================
  // Institución (universidades, institutos, centros de investigación)
  // =========================================================================
  const institutionPatterns = [
    /(?:Universidad|Instituto|Centro|Facultad|Escuela)[\s\w]+(?:de|del|de\s+la|Autónoma|Nacional|Tecnológico|Politécnico)[\s\w]+/gi,
    /\b(UACH|UNAM|IPN|ITESM|UANL|UABC|UDG|UAM|CINVESTAV|CONACYT)\b/gi
  ];

  for (const pattern of institutionPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.institucion = match[0];
      console.log('✅ Institución encontrada:', data.institucion);
      break;
    }
  }

  // =========================================================================
  // Grado máximo de estudios
  // =========================================================================
  const degreePatterns = [
    /(Doctorado|PhD|Maestría|Master|MSc|Licenciatura|Ingeniería|Ing\.?|Lic\.?)[\s\w]+(?:en|de|del)[\s\w]+/gi,
    /(?:Grado|Degree|Título)[:\s]+([^\n,.]+)/gi
  ];

  for (const pattern of degreePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.grado_maximo_estudios = match[0];
      console.log('✅ Grado encontrado:', data.grado_maximo_estudios);
      break;
    }
  }

  // =========================================================================
  // Experiencia laboral / Puesto actual
  // =========================================================================
  const jobPatterns = [
    /(Profesor|Investigador|Docente|Académico|Catedrático|Coordinador|Director|Jefe)[\s\w]+/gi,
    /(?:Puesto|Position|Empleo)[:\s]+([^\n,.]+)/gi
  ];

  for (const pattern of jobPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.experiencia_laboral = match[0];
      console.log('✅ Experiencia encontrada:', data.experiencia_laboral);
      break;
    }
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

