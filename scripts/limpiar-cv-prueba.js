/**
 * Script para limpiar el CV de prueba de la base de datos
 * y permitir que el usuario suba su CV real
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuración de base de datos
const dbPath = path.join(__dirname, '..', 'database.db');

function getDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          execute: (sql, params = []) => {
            return new Promise((resolve, reject) => {
              db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
              });
            });
          },
          close: () => db.close()
        });
      }
    });
  });
}

async function limpiarCvPrueba() {
  try {
    console.log('🧹 Limpiando CV de prueba de la base de datos...\n');
    
    const db = await getDatabase();
    
    // Buscar el usuario que tiene el CV de prueba
    const usuariosConCvPrueba = await db.execute(
      `SELECT correo, cv_url FROM investigadores WHERE cv_url LIKE '%test_cv_%'`
    );
    
    if (usuariosConCvPrueba.length === 0) {
      console.log('✅ No se encontraron usuarios con CV de prueba');
      return;
    }
    
    console.log(`📋 Usuarios con CV de prueba encontrados: ${usuariosConCvPrueba.length}`);
    
    for (const usuario of usuariosConCvPrueba) {
      console.log(`\n👤 Usuario: ${usuario.correo}`);
      console.log(`📄 CV actual: ${usuario.cv_url}`);
      
      // Limpiar el CV de prueba
      await db.execute(
        `UPDATE investigadores SET cv_url = NULL WHERE correo = ?`,
        [usuario.correo]
      );
      
      console.log('✅ CV de prueba eliminado - Usuario puede subir su CV real');
    }
    
    console.log('\n🎉 ¡Limpieza completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Reinicia el servidor (Ctrl+C → npm run dev)');
    console.log('2. Ve a http://localhost:3000/dashboard');
    console.log('3. Sube tu CV real');
    console.log('4. El botón "Abrir en nueva pestaña" funcionará correctamente');
    
  } catch (error) {
    console.error('❌ Error al limpiar CV de prueba:', error);
  }
}

limpiarCvPrueba();
