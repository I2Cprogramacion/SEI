// Script para probar el login de admin y verificar cookies
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

async function testAdminLogin() {
  console.log('\n🧪 PRUEBA DE LOGIN DE ADMIN\n');
  console.log('='.repeat(50));
  
  try {
    // 1. Intentar login
    console.log('\n1️⃣ Intentando login con admin@sei.com.mx...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sei.com.mx',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('\n📊 Respuesta del servidor:');
    console.log(JSON.stringify(loginData, null, 2));
    
    // Verificar cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('\n🍪 Cookies recibidas:');
    if (cookies) {
      console.log(cookies);
    } else {
      console.log('❌ NO SE RECIBIERON COOKIES');
    }
    
    // Verificar datos del usuario
    if (loginData.success) {
      console.log('\n✅ LOGIN EXITOSO');
      console.log('\n👤 Datos del usuario:');
      console.log(`   ID: ${loginData.user.id}`);
      console.log(`   Email: ${loginData.user.email}`);
      console.log(`   Nombre: ${loginData.user.nombre}`);
      console.log(`   Es Admin: ${loginData.user.isAdmin ? '✅ SÍ' : '❌ NO'}`);
      
      if (loginData.user.isAdmin) {
        console.log('\n✅ El usuario TIENE permisos de admin');
        console.log('   Debería poder acceder a /admin');
      } else {
        console.log('\n❌ El usuario NO tiene permisos de admin');
        console.log('   NO podrá acceder a /admin');
      }
    } else {
      console.log('\n❌ LOGIN FALLIDO');
      console.log(`   Error: ${loginData.error || 'Desconocido'}`);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
}

// Ejecutar la prueba
testAdminLogin();

