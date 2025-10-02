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

// Función para ejecutar SQL
function runSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

async function createSimpleUsers() {
  try {
    console.log('Iniciando creación de usuarios de prueba...');

    // Lista de usuarios de prueba - VACÍA (datos dummy eliminados)
    const testUsers = [];

    let createdCount = 0;
    let skippedCount = 0;

    for (const user of testUsers) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM investigadores WHERE correo = ?', [user.correo], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        
        if (existingUser) {
          console.log(`ℹ️ Usuario ya existe: ${user.nombre_completo}`);
          skippedCount++;
          continue;
        }

        // Crear el usuario
        await runSQL(`
          INSERT INTO investigadores (
            nombre_completo, 
            correo, 
            telefono,
            institucion, 
            nacionalidad,
            password, 
            is_admin, 
            fecha_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          user.nombre_completo,
          user.correo,
          user.telefono,
          user.institucion,
          user.nacionalidad,
          user.password,
          user.is_admin,
          new Date().toISOString()
        ]);

        console.log(`✅ Usuario creado: ${user.nombre_completo}`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error al crear usuario ${user.nombre_completo}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   Usuarios creados: ${createdCount}`);
    console.log(`   Usuarios omitidos: ${skippedCount}`);
    console.log(`   Total procesados: ${testUsers.length}`);

    // Verificar el total de usuarios
    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM investigadores', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    console.log(`\n📋 Total de usuarios en la base de datos: ${totalUsers.total}`);

    console.log('\n🎉 ¡Usuarios de prueba creados exitosamente!');
    console.log('\n📝 Credenciales de prueba (todos usan la misma contraseña):');
    console.log('   Contraseña: password123');
    console.log('\n👥 Usuarios creados:');
    testUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nombre_completo} (${user.correo})`);
    });

  } catch (error) {
    console.error('❌ Error al crear usuarios de prueba:', error);
  } finally {
    // Cerrar la conexión
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      } else {
        console.log('Conexión a la base de datos cerrada.');
      }
    });
  }
}

// Ejecutar la función
createSimpleUsers();

