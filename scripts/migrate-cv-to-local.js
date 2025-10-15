// Script para migrar el CV de Cloudinary a almacenamiento local
const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(process.cwd(), 'database.db');
const cvDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');

console.log('🔄 Migrando CV de Cloudinary a almacenamiento local...\n');

// URL firmada actual del CV
const cloudinaryUrl = 'https://res.cloudinary.com/sei-cloudinary/raw/upload/s--HyXUeE6n--/v1/investigadores-cvs/cv_1760458470433?_a=BAMAK+ZW0';
const localFileName = `Dynhora_CV_${Date.now()}.pdf`;
const localPath = path.join(cvDir, localFileName);

console.log('📥 Descargando CV desde Cloudinary...');
console.log('   URL:', cloudinaryUrl);

const file = fs.createWriteStream(localPath);

https.get(cloudinaryUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`❌ Error al descargar: Status ${response.statusCode}`);
    console.log('\n💡 SOLUCIÓN ALTERNATIVA:');
    console.log('   1. Descarga manualmente tu CV desde Cloudinary');
    console.log('   2. Guárdalo en: public/uploads/cvs/');
    console.log('   3. Sube el CV nuevamente desde el dashboard');
    console.log('      (Ahora usará almacenamiento local)');
    process.exit(1);
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('✅ CV descargado exitosamente');
    console.log('   Archivo:', localFileName);
    console.log('   Ubicación:', localPath);
    console.log('');

    // Actualizar la base de datos
    const db = new sqlite3.Database(dbPath);
    const newUrl = `/uploads/cvs/${localFileName}`;

    db.run(`
      UPDATE investigadores 
      SET cv_url = ? 
      WHERE correo = 'dinero@gmail.com'
    `, [newUrl], function(err) {
      if (err) {
        console.error('❌ Error al actualizar BD:', err.message);
      } else {
        console.log('✅ Base de datos actualizada');
        console.log('   Nueva URL:', newUrl);
        console.log('');
        console.log('🎉 Migración completada!');
        console.log('   Tu CV ahora se sirve localmente sin Cloudinary');
        console.log('   Recarga tu perfil para verlo');
      }
      db.close();
    });
  });

  file.on('error', (err) => {
    fs.unlink(localPath, () => {});
    console.error('❌ Error al guardar archivo:', err.message);
  });
}).on('error', (err) => {
  console.error('❌ Error en la descarga:', err.message);
  console.log('\n💡 Ejecuta: npm run dev');
  console.log('   Luego sube tu CV nuevamente desde el dashboard');
});


