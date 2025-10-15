/**
 * Script para verificar si el usuario tiene CV en la base de datos
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

async function verificarCvUsuario() {
  try {
    console.log('🔍 Verificando CV del usuario en la base de datos...\n');
    
    const db = await getDatabase();
    
    // Buscar el usuario que tiene CV
    const usuariosConCv = await db.execute(
      `SELECT correo, cv_url FROM investigadores WHERE cv_url IS NOT NULL AND cv_url != ''`
    );
    
    if (usuariosConCv.length === 0) {
      console.log('❌ No se encontraron usuarios con CV en la base de datos');
      console.log('\n💡 Solución:');
      console.log('1. Ve a http://localhost:3000/dashboard');
      console.log('2. Sube tu CV usando el componente de upload');
      console.log('3. Verifica que se guarde en la base de datos');
      return;
    }
    
    console.log(`📋 Usuarios con CV encontrados: ${usuariosConCv.length}\n`);
    
    for (const usuario of usuariosConCv) {
      console.log(`👤 Usuario: ${usuario.correo}`);
      console.log(`📄 CV URL: ${usuario.cv_url}`);
      
      // Verificar si la URL es accesible
      try {
        const response = await fetch(usuario.cv_url);
        if (response.ok) {
          console.log('✅ URL del CV es accesible');
        } else {
          console.log(`❌ URL del CV no es accesible: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ Error al verificar URL: ${error.message}`);
      }
      
      console.log('---');
    }
    
    await db.close();
    
  } catch (error) {
    console.error('❌ Error al verificar CV:', error);
  }
}

verificarCvUsuario();

