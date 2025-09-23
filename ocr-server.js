// Log global para toda request entrante
app.use((req, res, next) => {
  console.log('[OCR LOG] Request recibida:', req.method, req.url, new Date().toISOString());
  next();
});
// Archivo eliminado, ahora está en ocr-server/ para Railway
const express = require('express');
const pdf = require('pdf-parse');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer();
app.use(cors());

function extractFields(text) {
  function extract(pattern, text) {
    const match = text.match(pattern);
    return match ? match[0].trim() : '';
  }
  return {
    curp: extract(/[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d/gi, text),
    rfc: extract(/[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}/gi, text),
    no_cvu: extract(/CVU\s*:?\s*\d+/gi, text).replace(/CVU\s*:?\s*/i, ''),
    correo: extract(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, text),
    telefono: extract(/\b\d{10}\b/g, text),
  };
}

app.post('/process-pdf', upload.single('file'), async (req, res) => {
  try {
    console.log('OCR: petición recibida', req.file ? req.file.originalname : 'sin archivo');
    if (!req.file) {
      console.error('OCR: No se proporcionó archivo');
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }
    const data = await pdf(req.file.buffer);
    const text = data.text || '';
    const fields = extractFields(text);
    console.log('OCR: extracción exitosa', fields);
    res.json({ data: fields });
  } catch (error) {
    console.error('Error en OCR Node:', error);
    res.status(500).json({ error: 'Error interno del servidor OCR Node', details: error.message, stack: error.stack });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log('==============================');
  console.log(`[OCR LOG] SERVIDOR INICIADO en puerto ${PORT} (${new Date().toISOString()})`);
  console.log('==============================');
});
