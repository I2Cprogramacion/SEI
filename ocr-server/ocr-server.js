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
// CURP: soporta prefijo y líneas separadas
const reCURP = /CURP[:\s\n-]*([A-Z]{4}\d{6}[A-Z]{6}\d{2})\b|\b([A-Z]{4}\d{6}[A-Z]{6}\d{2})\b/gi;
// RFC: soporta prefijo y líneas separadas
const reRFC = /RFC[:\s\n-]*([A-Z]{4}\d{6}[A-Z0-9]{3})\b|\b([A-Z]{4}\d{6}[A-Z0-9]{3})\b/gi;
// CVU: soporta NO.CVU y CVU
const reCVU = /NO\.CVU[:\s-]*([0-9]{5,})|CVU[:\s-]*([0-9]{5,})/gi;
// Email
const reEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Teléfono: soporta CELULAR: y TELÉFONO:
const reTel = /(?:CELULAR|TEL[ÉE]FONO)[:\s-]*([0-9]{7,15})/gi;

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
  // (Eliminado log de texto extraído para reducir el rate limit)

    // Helper para obtener el primer grupo no undefined de un match
    function getFirstGroup(re, text) {
      re.lastIndex = 0;
      let m = re.exec(text);
      while (m) {
        for (let i = 1; i < m.length; i++) {
          if (m[i]) return m[i];
        }
        m = re.exec(text);
      }
      return null;
    }

    const curp = getFirstGroup(reCURP, text);
    const rfc = getFirstGroup(reRFC, text);
    const no_cvu = getFirstGroup(reCVU, text);
    // Para email/teléfono usamos el texto original (sensibles a mayúsculas/minúsculas)
    const correo = getFirstGroup(reEmail, data.text || '');
    const telefono = getFirstGroup(reTel, data.text || '');

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OCR DEBUG] Extraídos:', {
        curp,
        rfc,
        no_cvu,
        correo,
        telefono
      });
    }
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
  // (Eliminado log de inicio del servidor para reducir el rate limit)
});
