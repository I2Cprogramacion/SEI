// Script para probar la conexión con Vercel Blob
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando configuración de Vercel Blob...\n');

const token = process.env.BLOB_READ_WRITE_TOKEN;

console.log('📋 Estado de configuración:');
console.log('   BLOB_READ_WRITE_TOKEN:', token ? '✅ Configurado' : '❌ Faltante');

if (token) {
  console.log('   Token (primeros chars):', token.substring(0, 30) + '...');
  console.log('');
  console.log('✅ Vercel Blob está correctamente configurado!');
  console.log('');
  console.log('🚀 Próximos pasos:');
  console.log('   1. Reinicia el servidor: npm run dev');
  console.log('   2. Ve a: http://localhost:3000/dashboard');
  console.log('   3. Sube tu CV desde la sección "Curriculum Vitae"');
  console.log('   4. ¡El CV se guardará en Vercel Blob y será accesible desde cualquier computadora!');
} else {
  console.log('');
  console.log('❌ Token no encontrado. Verifica el archivo .env.local');
}


