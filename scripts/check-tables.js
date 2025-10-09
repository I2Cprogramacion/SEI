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

async function checkTables() {
  try {
    console.log('🔍 Consultando tablas existentes...\n');

    // Obtener todas las tablas
    const tables = await getSQL(`
      SELECT name FROM sqlite_master 
      WHERE type='table'
      ORDER BY name
    `);

    if (tables.length === 0) {
      console.log('📭 No hay tablas en la base de datos.');
      return;
    }

    console.log(`📋 Se encontraron ${tables.length} tabla(s):\n`);

    for (const table of tables) {
      console.log(`📊 Tabla: ${table.name}`);
      
      // Obtener estructura de la tabla
      const columns = await getSQL(`PRAGMA table_info(${table.name})`);
      console.log('   Columnas:');
      columns.forEach(col => {
        console.log(`     - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      // Obtener conteo de registros
      const count = await getSQL(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`   Registros: ${count[0].count}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error al consultar tablas:', error.message);
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

checkTables();
