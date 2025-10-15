// Script para simular el upload de CV y verificar que funciona
require('dotenv').config({ path: '.env.local' });
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

console.log('🧪 Probando upload de CV a Vercel Blob...\n');

// Verificar token
const token = process.env.BLOB_READ_WRITE_TOKEN;
console.log('📋 Token configurado:', token ? '✅ Sí' : '❌ No');

if (!token) {
  console.log('\n❌ Error: BLOB_READ_WRITE_TOKEN no está configurado');
  console.log('   Agrega el token a .env.local y reinicia el servidor');
  process.exit(1);
}

// Crear un archivo PDF de prueba
const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test CV) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000262 00000 n\n0000000343 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n435\n%%EOF');

async function testUpload() {
  try {
    console.log('📤 Iniciando upload de prueba...\n');
    
    const fileName = `cvs/test_cv_${Date.now()}.pdf`;
    
    const blob = await put(fileName, testPdfContent, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/pdf'
    });

    console.log('✅ Upload exitoso!');
    console.log('   Archivo:', blob.pathname);
    console.log('   URL:', blob.url);
    console.log('   Tamaño:', blob.size, 'bytes');
    console.log('');
    console.log('🎉 Vercel Blob funciona correctamente!');
    console.log('');
    console.log('💡 Próximo paso:');
    console.log('   1. Asegúrate de que el servidor Next.js esté reiniciado');
    console.log('   2. Abre la consola del navegador (F12)');
    console.log('   3. Intenta subir el CV desde el dashboard');
    console.log('   4. Revisa si hay errores en la consola');

  } catch (error) {
    console.error('❌ Error en el upload:', error.message);
    console.error('\nDetalles:', error);
    
    if (error.message.includes('token')) {
      console.log('\n💡 Solución: Verifica que el token sea correcto');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Solución: Verifica tu conexión a internet');
    } else {
      console.log('\n💡 Solución: Revisa que @vercel/blob esté instalado correctamente');
    }
  }
}

testUpload();


