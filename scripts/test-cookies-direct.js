// Script para probar las cookies directamente
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const postData = JSON.stringify({
  email: 'admin@sei.com.mx',
  password: 'admin123'
});

console.log('\n🧪 PROBANDO LOGIN Y COOKIES DIRECTAMENTE\n');
console.log('='.repeat(60));

const req = http.request(options, (res) => {
  console.log(`\n📊 STATUS: ${res.statusCode}`);
  console.log(`📊 HEADERS:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📋 RESPUESTA DEL SERVIDOR:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      // Verificar cookies
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        console.log('\n🍪 COOKIES RECIBIDAS:');
        setCookie.forEach((cookie, index) => {
          console.log(`   ${index + 1}. ${cookie}`);
        });
        
        // Verificar si tiene las cookies necesarias
        const hasAuthToken = setCookie.some(c => c.includes('auth-token'));
        const hasUserData = setCookie.some(c => c.includes('user-data'));
        
        console.log('\n✅ VERIFICACIÓN DE COOKIES:');
        console.log(`   auth-token: ${hasAuthToken ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   user-data: ${hasUserData ? '✅ SÍ' : '❌ NO'}`);
        
        if (hasAuthToken && hasUserData) {
          console.log('\n🎉 ¡COOKIES CORRECTAS!');
          console.log('   El problema debe estar en el navegador o caché');
        } else {
          console.log('\n❌ COOKIES FALTANTES');
          console.log('   El problema está en el servidor');
        }
      } else {
        console.log('\n❌ NO SE RECIBIERON COOKIES');
      }
    } catch (error) {
      console.log('\n❌ ERROR PARSEANDO RESPUESTA:', error.message);
      console.log('Respuesta raw:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ ERROR DE CONEXIÓN: ${e.message}`);
  console.log('\n💡 Asegúrate de que el servidor esté corriendo en localhost:3000');
});

req.write(postData);
req.end();
