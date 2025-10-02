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

// Función para obtener datos
function getSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

async function createAdminUser() {
  try {
    console.log('Iniciando creación de usuario admin...');

    // 1. Agregar columna is_admin si no existe
    console.log('Agregando columna is_admin...');
    try {
      await runSQL('ALTER TABLE investigadores ADD COLUMN is_admin INTEGER DEFAULT 0');
      console.log('✅ Columna is_admin agregada exitosamente');
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('ℹ️ La columna is_admin ya existe');
      } else {
        throw err;
      }
    }

    // 2. Agregar columna password si no existe
    console.log('Agregando columna password...');
    try {
      await runSQL('ALTER TABLE investigadores ADD COLUMN password TEXT');
      console.log('✅ Columna password agregada exitosamente');
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('ℹ️ La columna password ya existe');
      } else {
        throw err;
      }
    }

    // 3. Verificar si ya existe un usuario admin
    const existingAdmin = await getSQL('SELECT * FROM investigadores WHERE correo = ?', ['admin@sei.com.mx']);
    
    if (existingAdmin) {
      console.log('ℹ️ Usuario admin ya existe, actualizando permisos...');
      await runSQL('UPDATE investigadores SET is_admin = 1, password = ? WHERE correo = ?', ['admin123', 'admin@sei.com.mx']);
      console.log('✅ Usuario admin actualizado exitosamente');
    } else {
      // 4. Crear usuario admin
      console.log('Creando usuario admin...');
      await runSQL(`
        INSERT INTO investigadores (
          nombre_completo, 
          correo, 
          password, 
          is_admin, 
          institucion, 
          nacionalidad,
          fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'Administrador del Sistema',
        'admin@sei.com.mx',
        'admin123',
        1,
        'SECCTI Chihuahua',
        'Mexicana',
        new Date().toISOString()
      ]);
      console.log('✅ Usuario admin creado exitosamente');
    }

    // 5. Verificar el usuario creado
    const adminUser = await getSQL('SELECT * FROM investigadores WHERE correo = ?', ['admin@sei.com.mx']);
    console.log('\n📋 Información del usuario admin:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Nombre: ${adminUser.nombre_completo}`);
    console.log(`   Email: ${adminUser.correo}`);
    console.log(`   Password: ${adminUser.password}`);
    console.log(`   Es Admin: ${adminUser.is_admin ? 'Sí' : 'No'}`);
    console.log(`   Institución: ${adminUser.institucion}`);

    console.log('\n🎉 ¡Usuario admin creado exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email: admin@sei.com.mx');
    console.log('   Password: admin123');
    console.log('\n⚠️ IMPORTANTE: Cambia la contraseña después del primer acceso por seguridad.');

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
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
createAdminUser();
