const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
});

// Consultar usuario admin
db.get('SELECT * FROM investigadores WHERE correo = ?', ['admin@sei.com.mx'], (err, row) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else if (!row) {
    console.log('❌ Usuario admin no encontrado');
  } else {
    console.log('\n📋 Credenciales del usuario admin:\n');
    console.log(`   Email: ${row.correo}`);
    console.log(`   Password: ${row.password || 'admin123 (por defecto)'}`);
    console.log(`   Is Admin: ${row.is_admin ? 'Sí' : 'No'}`);
    console.log('\n📝 Para iniciar sesión, usa:');
    console.log(`   Email: ${row.correo}`);
    console.log(`   Password: ${row.password || 'admin123'}`);
  }
  db.close();
});

