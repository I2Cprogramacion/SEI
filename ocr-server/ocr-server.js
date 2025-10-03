const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();
const upload = multer(); // memoryStorage por defecto

app.use(cors());

// Salud
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ocr', ts: new Date().toISOString() });
});

// Utilidades de extracción (MX)
const reCURP = /\b([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d)\b/gi;
// RFC personas físicas o morales (13 o 12 con homoclave)
const reRFC = /\b([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})\b/gi;
// CVU: suelen ser dígitos largos; capturamos 6-12 o etiquetas "CVU: 123..."
const reCVU = /\b(?:CVU[:\s-]*)?(\d{6,12})\b/gi;
// Email
const reEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
// Teléfono (10 dígitos, con separadores)
const reTel = /\b(?:\+?52)?\s*(\d{2,3})?[.\-\s]?\d{3}[.\-\s]?\d{4}\b/g;

function firstMatch(re, text) {
  re.lastIndex = 0;
  const m = re.exec(text);
  return m ? (m[1] || m[0]) : null;
}

app.post('/process-pdf', upload.any(), async (req, res) => {
  // Soportar 'file' o 'pdf'
  const fileField = (req.files || []).find(f => f.fieldname === 'file' || f.fieldname === 'pdf');

  if (!fileField) {
    return res.status(400).json({ error: 'No se envió archivo PDF (campo "file" o "pdf")' });
  }

  try {

  const data = await pdfParse(fileField.buffer);
  const text = (data.text || '').toUpperCase();
  // Log para depuración: mostrar el texto extraído
  console.log('--- TEXTO EXTRAÍDO DEL PDF ---');
  console.log(text);
  console.log('--- FIN DEL TEXTO EXTRAÍDO ---');

    const curp = firstMatch(reCURP, text);
    const rfc = firstMatch(reRFC, text);
    const no_cvu = firstMatch(reCVU, text);
    // Para email/teléfono usamos el texto original (sensibles a mayúsculas/minúsculas)
    const correo = firstMatch(reEmail, data.text || '');
    const telefono = firstMatch(reTel, data.text || '');

    res.json({
      curp: curp || null,
      rfc: rfc || null,
      no_cvu: no_cvu || null,
      correo: correo || null,
      telefono: telefono || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el PDF', details: String(err?.message || err) });
  }
});

app.get('/', (_req, res) => res.send('OCR server running'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OCR server listening on port ${PORT}`);
});
