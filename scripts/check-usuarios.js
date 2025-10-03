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

// Función para obtener datos
function getSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function checkUsuarios() {
  try {
    console.log('🔍 Consultando usuarios existentes...\n');

    // Verificar si la tabla existe
    const tableExists = await getSQL(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='usuarios'
    `);

    if (tableExists.length === 0) {
      console.log('❌ La tabla "usuarios" no existe.');
      return;
    }

    // Obtener todos los usuarios
    const users = await getSQL(`
      SELECT 
        id, 
        email, 
        nombre, 
        nombreCompleto,
        isAdmin,
        institucion,
        area,
        email_verificado
      FROM usuarios 
      ORDER BY id DESC
    `);

    if (users.length === 0) {
      console.log('📭 No hay usuarios registrados en la base de datos.');
      console.log('\n💡 Para crear usuarios, ejecuta:');
      console.log('   node scripts/create-admin-user.js');
      console.log('   node scripts/create-test-users.js');
      return;
    }

    console.log(`👥 Se encontraron ${users.length} usuario(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.nombre || user.nombreCompleto || 'Sin nombre'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏢 Institución: ${user.institucion || 'No especificada'}`);
      console.log(`   🔬 Área: ${user.area || 'No especificada'}`);
      console.log(`   👑 Admin: ${user.isAdmin ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   ✅ Verificado: ${user.email_verificado ? 'SÍ' : 'NO'}`);
      console.log('');
    });

    // Mostrar resumen
    const adminCount = users.filter(u => u.isAdmin).length;
    const verifiedCount = users.filter(u => u.email_verificado).length;
    const regularCount = users.length - adminCount;

    console.log('📊 RESUMEN:');
    console.log(`   👑 Administradores: ${adminCount}`);
    console.log(`   👤 Usuarios regulares: ${regularCount}`);
    console.log(`   ✅ Verificados: ${verifiedCount}`);
    console.log(`   📈 Total: ${users.length}`);

  } catch (error) {
    console.error('❌ Error al consultar usuarios:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      } else {
        console.log('\n✅ Conexión cerrada.');
      }
    });
  }
}

checkUsuarios();
