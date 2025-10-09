const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, '..', 'database.db');

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('Conectado a la base de datos SQLite.');
});

// Primero verificar estructura de la tabla
db.all("PRAGMA table_info(investigadores)", (err, columns) => {
  if (err) {
    console.error('❌ Error al consultar estructura:', err.message);
    db.close();
    return;
  }
  
  console.log(`\n📋 Columnas de la tabla investigadores:\n`);
  columns.forEach(col => {
    console.log(`   ${col.name} (${col.type})`);
  });
  
  // Consultar todos los usuarios
  db.all('SELECT * FROM investigadores', (err, rows) => {
    if (err) {
      console.error('❌ Error al consultar usuarios:', err.message);
    } else {
      console.log(`\n👥 Usuarios en la base de datos (${rows.length}):\n`);
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}`);
        console.log(`   Nombre: ${row.nombre_completo || 'Sin nombre'}`);
        console.log(`   Email: ${row.correo}`);
        console.log('');
      });
      
      // Buscar usuario admin
      const adminUser = rows.find(r => r.correo && r.correo.toLowerCase().includes('admin'));
      if (adminUser) {
        console.log(`\n✅ Usuario admin encontrado:`);
        console.log(`   Email: ${adminUser.correo}`);
        console.log(`\n📝 Agregar esta variable a .env:`);
        console.log(`   NEXT_PUBLIC_ADMIN_EMAIL=${adminUser.correo}`);
      } else {
        console.log(`\n⚠️ No se encontró usuario admin`);
        console.log(`\n💡 Para crear uno, ejecuta:`);
        console.log(`   node scripts/create-admin-user.js`);
      }
    }
    
    db.close();
  });
});

