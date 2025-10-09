// Script para probar el acceso a /admin
const http = require('http');

console.log('\n🧪 PROBANDO ACCESO DIRECTO A /admin\n');
console.log('='.repeat(60));

// Simular una petición a /admin sin cookies
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin',
  method: 'GET',
  headers: {
    'User-Agent': 'Test-Script'
  }
};

console.log('📡 Enviando petición a /admin...');

const req = http.request(options, (res) => {
  console.log(`\n📊 STATUS: ${res.statusCode}`);
  console.log(`📊 LOCATION: ${res.headers.location || 'No redirect'}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 302 || res.statusCode === 307) {
      console.log('\n🔄 REDIRECCIÓN DETECTADA');
      console.log(`   A: ${res.headers.location}`);
      
      if (res.headers.location.includes('/iniciar-sesion')) {
        console.log('   ✅ Correcto: Redirige al login (sin cookies)');
      } else {
        console.log('   ❌ Incorrecto: Redirige a otro lugar');
      }
    } else if (res.statusCode === 200) {
      console.log('\n✅ ACCESO PERMITIDO');
      console.log('   El middleware no está bloqueando');
    } else {
      console.log(`\n❓ STATUS INESPERADO: ${res.statusCode}`);
    }
    
    console.log('\n💡 PRÓXIMO PASO:');
    console.log('   Ahora intenta hacer login en el navegador y ve a /admin');
    console.log('   Los logs del middleware aparecerán en la terminal del servidor');
  });
});

req.on('error', (e) => {
  console.error(`\n❌ ERROR DE CONEXIÓN: ${e.message}`);
  console.log('\n💡 Asegúrate de que el servidor esté corriendo en localhost:3000');
});

req.end();
