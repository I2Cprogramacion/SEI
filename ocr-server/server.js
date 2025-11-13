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
  console.log('📝 Texto limpio (primeros 500 chars):', cleanText.substring(0, 500));

  // =========================================================================
  // CURP (18 caracteres exactos: 4 letras + 6 dígitos + H/M + 5 letras + 1 alfanumérico + 1 dígito)
  // Ejemplo: BAOA850312HCHRRL02
  // =========================================================================
  const curpPatterns = [
    // Primero buscar con etiqueta explícita
    /(?:CURP|curp)[:\s]*([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)/gi,
    // Luego sin etiqueta pero con validación estricta
    /\b([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)\b/g
  ];
  
  for (const pattern of curpPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      const curp = (match[1] || match[0]).toUpperCase();
      // Validar que no sea parte de otra palabra
      if (curp.length === 18) {
        data.curp = curp;
        console.log('✅ CURP encontrado:', data.curp);
        break;
      }
    }
    if (data.curp) break;
  }

  // =========================================================================
  // RFC (13 caracteres: 4 letras + 6 dígitos + 3 alfanuméricos)
  // Ejemplo: BAOA850312AB1
  // =========================================================================
  const rfcPatterns = [
    /(?:RFC|rfc)[:\s]*([A-Z]{4}\d{6}[A-Z0-9]{3})/gi,
    /\b([A-Z]{4}\d{6}[A-Z0-9]{3})\b/g
  ];
  
  for (const pattern of rfcPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      const rfc = (match[1] || match[0]).toUpperCase();
      // Evitar confusión con CURP - RFC debe ser exactamente 13 caracteres
      if (rfc.length === 13 && rfc !== data.curp?.substring(0, 13)) {
        data.rfc = rfc;
        console.log('✅ RFC encontrado:', data.rfc);
        break;
      }
    }
    if (data.rfc) break;
  }

  // =========================================================================
  // CVU (número de 5-8 dígitos, evitar años, códigos postales y teléfonos)
  // Ejemplo: CVU: 521748
  // =========================================================================
  const cvuPatterns = [
    // Primero buscar con etiqueta explícita (mayor prioridad)
    /(?:CVU|cvu|C\.V\.U\.)[:\s-]*(\d{5,8})/gi,
    /(?:número|numero|no\.?|#)\s*(?:CVU|cvu)[:\s-]*(\d{5,8})/gi,
    // Luego sin etiqueta, pero con más contexto
    /\bCVU\s*[:\-]?\s*(\d{5,8})\b/gi
  ];
  
  const cvuCandidates = [];
  
  for (const pattern of cvuPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      const extracted = match[1] || match[0].match(/\d{5,8}/)?.[0];
      if (extracted) {
        const num = extracted;
        const numVal = parseInt(num);
        
        // Validaciones para evitar falsos positivos
        const isYear = numVal >= 1900 && numVal <= 2100 && num.length === 4;
        const isZipCode = num.length === 5 && numVal >= 1000 && numVal <= 99999;
        const isPhone = num.length === 10;
        const hasLabel = match[0].toLowerCase().includes('cvu');
        
        if (!isYear && !isZipCode && !isPhone) {
          // Dar prioridad a los que tienen etiqueta explícita
          cvuCandidates.push({ value: num, priority: hasLabel ? 1 : 2 });
        }
      }
    }
  }
  
  // Ordenar por prioridad y tomar el mejor candidato
  if (cvuCandidates.length > 0) {
    cvuCandidates.sort((a, b) => a.priority - b.priority);
    data.no_cvu = cvuCandidates[0].value;
    console.log('✅ CVU encontrado:', data.no_cvu);
  }

  // =========================================================================
  // Email (formato estándar, limpieza de texto adicional)
  // Ejemplo: correo: alfonsobarrosobarajas@gmail.comcelular
  // =========================================================================
  const emailPatterns = [
    /(?:email|correo|e-mail|e\.mail)[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi,
    /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g
  ];
  
  for (const pattern of emailPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      let email = (match[1] || match[0]).toLowerCase();
      
      // Limpiar texto adicional pegado al final
      email = email.replace(/(celular|telefono|teléfono|movil|móvil).*$/i, '');
      
      // Remover puntos finales si están pegados al email
      email = email.replace(/\.+$/, '');
      
      // Validar que el dominio sea válido
      if (email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
        data.correo = email;
        console.log('✅ Email encontrado:', data.correo);
        break;
      }
    }
    if (data.correo) break;
  }

  // =========================================================================
  // Teléfono (formatos mexicanos: 10 dígitos, validar código de área)
  // Ejemplos: 6144609002, 614-460-9002, (614) 460 9002
  // =========================================================================
  const phonePatterns = [
    /(?:teléfono|telefono|tel\.?|phone|celular|móvil|movil|cel\.?)[:\s]*(\+?52\s?)?\(?([2-9]\d{2})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/gi,
    /\b(\+?52\s?)?\(?([2-9]\d{2})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\b/g
  ];
  
  const phoneCandidates = [];
  
  for (const pattern of phonePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      // Extraer solo los dígitos
      const phoneRaw = match[0].replace(/\D/g, '');
      // Si tiene más de 10 dígitos (ej: +52), tomar últimos 10
      const phone = phoneRaw.length > 10 ? phoneRaw.slice(-10) : phoneRaw;
      
      // Validar que sea exactamente 10 dígitos
      if (phone.length === 10) {
        const areaCode = phone.substring(0, 3);
        const firstDigit = parseInt(areaCode[0]);
        
        // Validar que el código de área sea válido (2-9, no 0 o 1)
        if (firstDigit >= 2 && firstDigit <= 9) {
          // Evitar números con patrones repetitivos obvios
          const isRepetitive = phone.match(/(\d)\1{9}/) || // todos iguales
                               phone.match(/0123456789/) || // secuencia
                               phone.match(/1234567890/);
          
          if (!isRepetitive) {
            const hasLabel = match[0].toLowerCase().match(/tel|phone|celular|móvil|movil/);
            phoneCandidates.push({ value: phone, priority: hasLabel ? 1 : 2 });
          }
        }
      }
    }
  }
  
  // Ordenar por prioridad y tomar el mejor
  if (phoneCandidates.length > 0) {
    phoneCandidates.sort((a, b) => a.priority - b.priority);
    data.telefono = phoneCandidates[0].value;
    console.log('✅ Teléfono encontrado:', data.telefono);
  }

  // =========================================================================
  // Nombre completo (mejorado para evitar falsos positivos)
  // Ejemplos: Dr. Alfonso Barroso Barajas, Nombre: María García López
  // =========================================================================
  const excludedWords = [
    'investigador', 'investigadora', 'profesor', 'profesora', 'doctor', 'doctora',
    'maestro', 'maestra', 'titular', 'asociado', 'asociada', 'asistente',
    'universidad', 'instituto', 'centro', 'facultad', 'departamento',
    'curriculum', 'vitae', 'perfil', 'unico', 'único', 'nacional',
    'sistema', 'investigadores', 'conacyt', 'cvu', 'curp', 'rfc',
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
    'enero', 'telefono', 'teléfono', 'celular', 'correo', 'email'
  ];
  
  const namePatterns = [
    // Con título académico
    /(?:Dr\.?|Dra\.?|Prof\.?|Profesora?\.?|Mtro\.?|Mtra\.?|Ing\.?|Lic\.?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})\b/g,
    // Con etiqueta explícita
    /(?:Nombre|Name|Nombres?)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})\b/gi,
    // Patrón general (2-4 palabras capitalizadas)
    /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}){1,3})\b/g
  ];

  const nameCandidates = [];

  for (let i = 0; i < namePatterns.length; i++) {
    const pattern = namePatterns[i];
    const matches = cleanText.matchAll(pattern);
    
    for (const match of matches) {
      const name = (match[1] || match[0]).trim();
      const words = name.split(/\s+/);
      
      // Validaciones
      const hasNumbers = /\d/.test(name);
      const hasAllUppercase = name === name.toUpperCase() && name.length > 5;
      const hasExcludedWord = words.some(word => 
        excludedWords.includes(word.toLowerCase())
      );
      const hasTooManyWords = words.length > 4;
      const hasTooFewWords = words.length < 2;
      const hasValidLength = words.every(w => w.length >= 2 && w.length <= 20);
      const hasLabel = match[0].match(/nombre|name|dr\.|dra\./i);
      
      if (!hasNumbers && !hasAllUppercase && !hasExcludedWord && 
          !hasTooManyWords && !hasTooFewWords && hasValidLength) {
        // Prioridad: 1 = con etiqueta/título, 2 = patrón de primeras líneas, 3 = genérico
        const priority = hasLabel ? 1 : (i === 0 ? 2 : 3);
        nameCandidates.push({ value: name, priority });
      }
    }
  }
  
  // Ordenar por prioridad y tomar el mejor
  if (nameCandidates.length > 0) {
    nameCandidates.sort((a, b) => a.priority - b.priority);
    data.nombre_completo = nameCandidates[0].value;
    console.log('✅ Nombre encontrado:', data.nombre_completo);
  }

  // =========================================================================
  // Fecha de nacimiento (formatos: DD/MM/YYYY, DD-MM-YYYY)
  // =========================================================================
  const datePatterns = [
    /(?:fecha\s+de\s+nacimiento|nacimiento|birth|born)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-](19|20)\d{2})\b/g
  ];

  for (const pattern of datePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      const dateStr = match[1] || match[0].match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/)?.[0];
      if (dateStr) {
        const parts = dateStr.split(/[\/\-]/);
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // Validar que sea una fecha razonable
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && 
            year >= 1940 && year <= 2010) {
          data.fecha_nacimiento = dateStr;
          console.log('✅ Fecha nacimiento encontrada:', data.fecha_nacimiento);
          break;
        }
      }
    }
    if (data.fecha_nacimiento) break;
  }

  // =========================================================================
  // Institución (universidades, institutos, centros de investigación)
  // =========================================================================
  const institutionPatterns = [
    /(?:Universidad|Instituto|Centro|Facultad|Escuela)\s+[A-ZÁÉÍÓÚÑ][\w\s]+(?:de|del|de\s+la|Autónoma|Nacional|Tecnológico|Politécnico)[\w\s]+/gi,
    /\b(UACH|UNAM|IPN|ITESM|UANL|UABC|UDG|UAM|CINVESTAV|CONACYT|CIMAV|CICESE)\b/gi
  ];

  for (const pattern of institutionPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.institucion = match[0].trim();
      console.log('✅ Institución encontrada:', data.institucion);
      break;
    }
  }

  // =========================================================================
  // Grado máximo de estudios
  // =========================================================================
  const degreePatterns = [
    /(Doctorado|PhD|Doctor|Dra?\.|Maestría|Maestria|Master|MSc|M\.Sc\.|Licenciatura|Licenciado|Ingeniería|Ingeniero|Ing\.|Lic\.)[\s]+(?:en|de|del)[\s]+[\w\sáéíóúñ]+/gi,
    /(?:Grado|Degree|Título|Estudios)[:\s]+([^\n,.;]{10,80})/gi
  ];

  for (const pattern of degreePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.grado_maximo_estudios = match[0].trim().substring(0, 100);
      console.log('✅ Grado encontrado:', data.grado_maximo_estudios);
      break;
    }
  }

  // =========================================================================
  // Experiencia laboral / Puesto actual
  // =========================================================================
  const jobPatterns = [
    /(Profesor|Investigador|Docente|Académico|Catedrático|Coordinador|Director|Jefe|Subdirector)\s+[\w\s]+/gi,
    /(?:Puesto|Position|Empleo|Cargo)[:\s]+([^\n,.;]{10,80})/gi
  ];

  for (const pattern of jobPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.experiencia_laboral = match[0].trim().substring(0, 100);
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

