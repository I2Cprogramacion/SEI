// Script para verificar las URLs de CV en la base de datos
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');

console.log('🔍 Verificando URLs de CV en la base de datos...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
    process.exit(1);
  }
});

// Verificar investigadores con CV
db.all(`
  SELECT 
    id,
    nombre_completo,
    correo,
    cv_url
  FROM investigadores
  WHERE cv_url IS NOT NULL AND cv_url != ''
  ORDER BY id DESC
  LIMIT 10
`, [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }

  console.log(`📊 Investigadores con CV (últimos 10):\n`);
  
  if (rows.length === 0) {
    console.log('⚠️  No se encontraron investigadores con CV cargado');
  } else {
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.nombre_completo}`);
      console.log(`   Email: ${row.correo}`);
      console.log(`   CV URL: ${row.cv_url}`);
      console.log(`   ✅ ${row.cv_url.includes('cloudinary') ? 'URL de Cloudinary' : 'URL externa'}`);
      console.log('');
    });
  }

  // Cerrar base de datos
  db.close((err) => {
    if (err) {
      console.error('❌ Error al cerrar:', err.message);
    }
  });
});


