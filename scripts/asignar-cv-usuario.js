/**
 * Script para asignar el CV de prueba al usuario actual
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
          run: (sql, params = []) => {
            return new Promise((resolve, reject) => {
              db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
              });
            });
          },
          close: () => db.close()
        });
      }
    });
  });
}

async function asignarCvUsuario() {
  try {
    console.log('🔄 Asignando CV de prueba al usuario actual...\n');
    
    const db = await getDatabase();
    
    // URL del CV de prueba
    const cvUrl = 'https://1ik1hzemt4ky6z8h.public.blob.vercel-storage.com/cvs/cv_prueba_1760468004773.pdf';
    
    // Buscar el usuario dinero@gmail.com (el usuario actual)
    const usuarios = await db.execute(
      `SELECT id, correo, cv_url FROM investigadores WHERE correo = 'dinero@gmail.com'`
    );
    
    if (usuarios.length === 0) {
      console.log('❌ No se encontró el usuario dinero@gmail.com');
      console.log('💡 Vamos a ver qué usuarios hay...');
      
      const todosUsuarios = await db.execute(
        `SELECT id, correo, cv_url FROM investigadores LIMIT 5`
      );
      
      console.log('👥 Usuarios encontrados:');
      for (const usuario of todosUsuarios) {
        console.log(`   - ${usuario.correo} (ID: ${usuario.id})`);
      }
      
      await db.close();
      return;
    }
    
    const usuario = usuarios[0];
    console.log(`👤 Usuario encontrado: ${usuario.correo} (ID: ${usuario.id})`);
    console.log(`📄 CV actual: ${usuario.cv_url || 'Sin CV'}`);
    
    // Asignar el CV de prueba
    await db.run(
      `UPDATE investigadores SET cv_url = ? WHERE id = ?`,
      [cvUrl, usuario.id]
    );
    
    console.log('✅ CV de prueba asignado exitosamente!');
    console.log(`✅ Usuario ${usuario.correo} ahora tiene el CV`);
    
    await db.close();
    
    console.log('\n🎉 ¡Listo!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Recarga la página del dashboard');
    console.log('2. Ahora deberías ver la sección de CV');
    console.log('3. Verás los botones de prueba');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

asignarCvUsuario();

