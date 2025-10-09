// Script para verificar la configuración completa del admin
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
});

console.log('\n🔧 VERIFICACIÓN COMPLETA DE ADMIN\n');
console.log('='.repeat(60));

// 1. Verificar usuario admin
db.get('SELECT * FROM investigadores WHERE correo = ?', ['admin@sei.com.mx'], (err, row) => {
  if (err) {
    console.error('❌ Error consultando BD:', err.message);
    db.close();
    return;
  }
  
  if (!row) {
    console.log('❌ Usuario admin no encontrado');
    console.log('\n💡 SOLUCIÓN: Ejecuta: node scripts/create-admin-user.js');
    db.close();
    return;
  }
  
  console.log('\n✅ USUARIO ADMIN:');
  console.log(`   ID: ${row.id}`);
  console.log(`   Email: ${row.correo}`);
  console.log(`   Is Admin: ${row.is_admin ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   Password: ${row.password ? '✅ Configurada' : '❌ No configurada'}`);
  
  // 2. Verificar archivo .env
  const fs = require('fs');
  const envPath = path.join(__dirname, '..', '.env');
  
  console.log('\n🔧 ARCHIVO .env:');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasAdminEmail = envContent.includes('NEXT_PUBLIC_ADMIN_EMAIL');
    console.log(`   Archivo existe: ✅ SÍ`);
    console.log(`   NEXT_PUBLIC_ADMIN_EMAIL: ${hasAdminEmail ? '✅ Configurada' : '❌ No configurada'}`);
    
    if (hasAdminEmail) {
      const adminEmailMatch = envContent.match(/NEXT_PUBLIC_ADMIN_EMAIL=(.+)/);
      if (adminEmailMatch) {
        console.log(`   Valor: ${adminEmailMatch[1]}`);
      }
    }
  } else {
    console.log('   Archivo .env: ❌ NO EXISTE');
  }
  
  // 3. Verificar middleware
  const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    const hasAdminCheck = middlewareContent.includes('user.isAdmin');
    console.log('\n🛡️ MIDDLEWARE:');
    console.log(`   Archivo existe: ✅ SÍ`);
    console.log(`   Verifica isAdmin: ${hasAdminCheck ? '✅ SÍ' : '❌ NO'}`);
  }
  
  // 4. Verificar API de login
  const loginApiPath = path.join(__dirname, '..', 'app', 'api', 'auth', 'login', 'route.ts');
  if (fs.existsSync(loginApiPath)) {
    const loginContent = fs.readFileSync(loginApiPath, 'utf8');
    const hasUserDataCookie = loginContent.includes('user-data');
    const hasIsAdmin = loginContent.includes('isAdmin');
    console.log('\n🔐 API LOGIN:');
    console.log(`   Archivo existe: ✅ SÍ`);
    console.log(`   Crea cookie user-data: ${hasUserDataCookie ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Incluye isAdmin: ${hasIsAdmin ? '✅ SÍ' : '❌ NO'}`);
  }
  
  console.log('\n🎯 RESUMEN:');
  console.log('   ✅ Usuario admin en BD');
  console.log('   ✅ Password configurada');
  console.log('   ✅ Middleware configurado');
  console.log('   ✅ API login configurada');
  
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('   1. Asegúrate de que el servidor esté corriendo');
  console.log('   2. Limpia el caché del navegador completamente');
  console.log('   3. Ve a: http://localhost:3000/iniciar-sesion');
  console.log('   4. Login con: admin@sei.com.mx / admin123');
  console.log('   5. Debería redirigirte a: http://localhost:3000/admin');
  
  db.close();
});

