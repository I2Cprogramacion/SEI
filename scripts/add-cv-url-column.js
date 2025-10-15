// Script para agregar la columna cv_url a la tabla investigadores
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');

console.log('🔄 Agregando columna cv_url a la tabla investigadores...');
console.log('📁 Base de datos:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos SQLite');
});

// Agregar columna cv_url si no existe
db.run(`
  ALTER TABLE investigadores 
  ADD COLUMN cv_url TEXT
`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('ℹ️  La columna cv_url ya existe en la tabla investigadores');
    } else {
      console.error('❌ Error al agregar columna cv_url:', err.message);
      db.close();
      process.exit(1);
    }
  } else {
    console.log('✅ Columna cv_url agregada exitosamente a la tabla investigadores');
  }

  // Verificar la estructura de la tabla
  db.all(`PRAGMA table_info(investigadores)`, (err, columns) => {
    if (err) {
      console.error('❌ Error al verificar estructura:', err.message);
    } else {
      console.log('\n📋 Estructura de la tabla investigadores:');
      const cvUrlColumn = columns.find(col => col.name === 'cv_url');
      if (cvUrlColumn) {
        console.log('✅ Columna cv_url encontrada:');
        console.log('   - Nombre:', cvUrlColumn.name);
        console.log('   - Tipo:', cvUrlColumn.type);
        console.log('   - Nullable:', cvUrlColumn.notnull === 0 ? 'Sí' : 'No');
      } else {
        console.log('❌ Columna cv_url no encontrada');
      }
    }

    // Cerrar conexión
    db.close((err) => {
      if (err) {
        console.error('❌ Error al cerrar la base de datos:', err.message);
        process.exit(1);
      }
      console.log('\n✅ Migración completada. Base de datos cerrada.');
    });
  });
});


