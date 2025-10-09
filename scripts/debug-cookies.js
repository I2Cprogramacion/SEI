// Script para debuggear las cookies del admin
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
});

console.log('\n🔍 DIAGNÓSTICO DE COOKIES DE ADMIN\n');
console.log('='.repeat(60));

// 1. Verificar usuario admin en BD
db.get('SELECT * FROM investigadores WHERE correo = ?', ['admin@sei.com.mx'], (err, row) => {
  if (err) {
    console.error('❌ Error consultando BD:', err.message);
    db.close();
    return;
  }
  
  if (!row) {
    console.log('❌ Usuario admin no encontrado en BD');
    db.close();
    return;
  }
  
  console.log('\n📋 USUARIO ADMIN EN BD:');
  console.log(`   ID: ${row.id}`);
  console.log(`   Email: ${row.correo}`);
  console.log(`   Nombre: ${row.nombre_completo}`);
  console.log(`   Password: ${row.password ? 'Configurada' : 'No configurada'}`);
  console.log(`   Is Admin: ${row.is_admin ? 'Sí' : 'No'}`);
  
  // 2. Verificar variable de entorno
  console.log('\n🔧 VARIABLES DE ENTORNO:');
  console.log(`   NEXT_PUBLIC_ADMIN_EMAIL: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'NO CONFIGURADA'}`);
  
  // 3. Simular verificación de admin
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sei.com.mx';
  const isAdmin = row.correo === adminEmail;
  
  console.log('\n✅ VERIFICACIÓN DE ADMIN:');
  console.log(`   Email en BD: ${row.correo}`);
  console.log(`   Email esperado: ${adminEmail}`);
  console.log(`   ¿Coinciden?: ${isAdmin ? '✅ SÍ' : '❌ NO'}`);
  
  if (isAdmin) {
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('   ✅ Usuario admin existe en BD');
    console.log('   ✅ Email coincide con variable de entorno');
    console.log('   ❌ PROBLEMA: Las cookies no se están creando correctamente');
    console.log('\n💡 SOLUCIÓN:');
    console.log('   1. Limpia el caché del navegador');
    console.log('   2. Cierra todas las pestañas');
    console.log('   3. Reinicia el servidor de desarrollo');
    console.log('   4. Intenta login nuevamente');
  } else {
    console.log('\n❌ PROBLEMA: Email no coincide');
    console.log(`   Configura NEXT_PUBLIC_ADMIN_EMAIL=${row.correo}`);
  }
  
  db.close();
});

