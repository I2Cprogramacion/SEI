// Script para probar si el PDF es accesible
const https = require('https');

const pdfUrl = 'https://res.cloudinary.com/sei-cloudinary/raw/upload/v1760458478/investigadores-cvs/cv_1760458470433.pdf';

console.log('🔍 Probando acceso al PDF...\n');
console.log('URL:', pdfUrl, '\n');

https.get(pdfUrl, (response) => {
  console.log('✅ Respuesta recibida:');
  console.log('   Status Code:', response.statusCode);
  console.log('   Content-Type:', response.headers['content-type']);
  console.log('   Content-Length:', response.headers['content-length'], 'bytes');
  console.log('   Access-Control-Allow-Origin:', response.headers['access-control-allow-origin'] || 'NO CONFIGURADO');
  
  if (response.statusCode === 200) {
    console.log('\n✅ El PDF es accesible públicamente');
    
    if (!response.headers['access-control-allow-origin']) {
      console.log('\n⚠️  PROBLEMA ENCONTRADO:');
      console.log('   El PDF NO tiene headers CORS configurados');
      console.log('   Esto impide su visualización en iframes desde otros dominios\n');
      console.log('💡 SOLUCIÓN:');
      console.log('   El componente cv-viewer-improved usa Google Docs Viewer como fallback');
      console.log('   Esto debería solucionar el problema de visualización\n');
    }
  } else {
    console.log('\n❌ Error al acceder al PDF');
  }
  
  response.on('data', () => {});
  response.on('end', () => {
    console.log('✅ Prueba completada');
  });
}).on('error', (error) => {
  console.error('❌ Error:', error.message);
});


