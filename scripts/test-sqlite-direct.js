const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, '..', 'database.db');

console.log('🔍 Probando conexión directa a SQLite...');
console.log('📁 Ruta de la base de datos:', dbPath);

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite.');
});

// Función para obtener datos
function getSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

async function testSQLite() {
  try {
    console.log('\n🔍 Verificando si el usuario admin existe...');
    const adminUser = await getSQL('SELECT * FROM investigadores WHERE correo = ?', ['admin@sei.com.mx']);
    
    if (adminUser) {
      console.log('✅ Usuario admin encontrado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Nombre: ${adminUser.nombre_completo}`);
      console.log(`   Email: ${adminUser.correo}`);
      console.log(`   Password: ${adminUser.password}`);
      console.log(`   Es Admin: ${adminUser.is_admin}`);
    } else {
      console.log('❌ Usuario admin NO encontrado');
    }
    
    console.log('\n🔍 Contando total de investigadores...');
    const count = await getSQL('SELECT COUNT(*) as total FROM investigadores');
    console.log(`Total de investigadores: ${count.total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar la conexión
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      } else {
        console.log('\n✅ Conexión a la base de datos cerrada.');
      }
    });
  }
}

testSQLite();
