const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();
const upload = multer();

app.use(cors());

// Endpoint principal para OCR
app.post('/process-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió archivo PDF' });
  }
  try {
    const data = await pdfParse(req.file.buffer);
    // Aquí puedes extraer CURP, RFC, CVU, etc. del texto extraído
    // Por ahora solo regresa el texto completo
    res.json({ data: { text: data.text } });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el PDF', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('OCR server running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OCR server listening on port ${PORT}`);
});
