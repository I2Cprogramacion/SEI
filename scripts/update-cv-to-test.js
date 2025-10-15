// Actualizar el CV en la BD con la URL de prueba de Vercel Blob
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');
const testCvUrl = 'https://1ik1hzemt4ky6z8h.public.blob.vercel-storage.com/cvs/test_cv_1760464766636.pdf';

console.log('🔄 Actualizando CV en la base de datos...\n');

const db = new sqlite3.Database(dbPath);

db.run(`
  UPDATE investigadores 
  SET cv_url = ? 
  WHERE correo = 'dinero@gmail.com'
`, [testCvUrl], function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('✅ CV actualizado exitosamente');
    console.log(`   Filas actualizadas: ${this.changes}`);
    console.log('');
    console.log('📋 Nueva URL (Vercel Blob):');
    console.log('   ' + testCvUrl);
    console.log('');
    console.log('🎉 Ahora el CV está en la nube!');
    console.log('');
    console.log('💡 Recarga tu perfil y debería mostrarse correctamente');
  }
  db.close();
});


