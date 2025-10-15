// Script para actualizar la URL del CV en la base de datos
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');
const nuevaUrl = 'https://res.cloudinary.com/sei-cloudinary/raw/upload/s--HyXUeE6n--/v1/investigadores-cvs/cv_1760458470433?_a=BAMAK+ZW0';

console.log('🔄 Actualizando URL del CV en la base de datos...\n');
console.log('Nueva URL:', nuevaUrl);
console.log('');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
    process.exit(1);
  }
});

// Actualizar la URL del CV para el usuario
db.run(`
  UPDATE investigadores 
  SET cv_url = ? 
  WHERE correo = 'dinero@gmail.com'
`, [nuevaUrl], function(err) {
  if (err) {
    console.error('❌ Error al actualizar:', err.message);
    db.close();
    process.exit(1);
  }

  console.log(`✅ CV URL actualizada exitosamente`);
  console.log(`   Filas actualizadas: ${this.changes}`);
  console.log('');

  // Verificar la actualización
  db.get(`
    SELECT nombre_completo, correo, cv_url 
    FROM investigadores 
    WHERE correo = 'dinero@gmail.com'
  `, (err, row) => {
    if (err) {
      console.error('❌ Error al verificar:', err.message);
    } else if (row) {
      console.log('📋 Datos actualizados:');
      console.log(`   Usuario: ${row.nombre_completo}`);
      console.log(`   Email: ${row.correo}`);
      console.log(`   CV URL: ${row.cv_url}`);
      console.log('');
      console.log('✅ Ahora recarga tu perfil y el CV debería mostrarse correctamente');
    }

    db.close();
  });
});


