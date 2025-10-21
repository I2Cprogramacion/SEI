/**
 * Script para subir un CV de prueba a Vercel Blob
 * y actualizar la base de datos para que puedas ver el componente funcionando
 */

const fs = require('fs');
const path = require('path');

async function subirCvPrueba() {
  try {
    console.log('📤 Subiendo CV de prueba a Vercel Blob...\n');
    
    // Crear un PDF de prueba simple
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(CV de Prueba - Funcionando) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;

    // Guardar el PDF temporalmente
    const tempPdfPath = path.join(__dirname, 'cv_prueba.pdf');
    fs.writeFileSync(tempPdfPath, pdfContent);
    
    console.log('✅ PDF de prueba creado');
    
    // Subir a Vercel Blob usando la API
    const formData = new FormData();
    const file = new File([pdfContent], 'cv_prueba.pdf', { type: 'application/pdf' });
    formData.append('file', file);
    
    console.log('📤 Subiendo a Vercel Blob...');
    
    const response = await fetch('http://localhost:3000/api/upload-cv-vercel', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ CV subido exitosamente');
    console.log('URL:', result.url);
    
    // Actualizar la base de datos
    console.log('\n💾 Actualizando base de datos...');
    
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '..', 'database.db');
    
    const db = new sqlite3.Database(dbPath);
    
    // Actualizar el primer usuario con el CV de prueba
    db.run(
      `UPDATE investigadores SET cv_url = ? WHERE id = (SELECT MIN(id) FROM investigadores)`,
      [result.url],
      function(err) {
        if (err) {
          console.error('❌ Error al actualizar BD:', err);
        } else {
          console.log('✅ Base de datos actualizada');
          console.log(`✅ Usuario actualizado con CV: ${result.url}`);
        }
        
        db.close();
        
        // Limpiar archivo temporal
        fs.unlinkSync(tempPdfPath);
        
        console.log('\n🎉 ¡CV de prueba configurado!');
        console.log('\n📝 Próximos pasos:');
        console.log('1. Recarga la página del dashboard');
        console.log('2. Deberías ver el CV en la tarjeta');
        console.log('3. Haz clic en el botón de ojo para abrir el modal');
      }
    );
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Verificar si estamos en Node.js con fetch disponible
if (typeof fetch === 'undefined') {
  console.log('❌ Este script necesita Node.js 18+ con fetch habilitado');
  console.log('💡 Alternativa: Sube tu CV manualmente desde el dashboard');
} else {
  subirCvPrueba();
}

