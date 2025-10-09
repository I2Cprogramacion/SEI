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

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla...\n');

    // Obtener información de la tabla
    const tableInfo = await getSQL(`
      PRAGMA table_info(investigadores)
    `);

    if (tableInfo.length === 0) {
      console.log('❌ La tabla "investigadores" no existe.');
      return;
    }

    console.log('📋 Estructura de la tabla "investigadores":\n');
    tableInfo.forEach((column, index) => {
      console.log(`${index + 1}. ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : 'NULL'} ${column.pk ? 'PRIMARY KEY' : ''}`);
    });

    console.log('\n🔍 Consultando usuarios con columnas disponibles...\n');

    // Obtener todos los usuarios con las columnas que existen
    const users = await getSQL(`
      SELECT * FROM investigadores 
      ORDER BY id DESC
    `);

    if (users.length === 0) {
      console.log('📭 No hay usuarios registrados en la base de datos.');
      return;
    }

    console.log(`👥 Se encontraron ${users.length} usuario(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 Usuario ID: ${user.id}`);
      console.log(`   📧 Email: ${user.correo || 'No especificado'}`);
      console.log(`   👤 Nombre: ${user.nombre_completo || 'No especificado'}`);
      console.log(`   🏢 Institución: ${user.institucion || 'No especificada'}`);
      console.log(`   🔬 Área: ${user.area || 'No especificada'}`);
      console.log(`   👑 Admin: ${user.is_admin ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   🔑 CURP: ${user.curp || 'No especificado'}`);
      console.log(`   📄 RFC: ${user.rfc || 'No especificado'}`);
      console.log(`   🆔 CVU: ${user.no_cvu || 'No especificado'}`);
      console.log('');
    });

    // Mostrar resumen
    const adminCount = users.filter(u => u.is_admin).length;
    const regularCount = users.length - adminCount;

    console.log('📊 RESUMEN:');
    console.log(`   👑 Administradores: ${adminCount}`);
    console.log(`   👤 Usuarios regulares: ${regularCount}`);
    console.log(`   📈 Total: ${users.length}`);

  } catch (error) {
    console.error('❌ Error al consultar la tabla:', error.message);
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

checkTableStructure();
