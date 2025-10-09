const { Client } = require('pg');

// Función para crear usuario admin en Neon
async function createAdminInNeon() {
  console.log('🔧 Configuración de usuario admin en Neon/PostgreSQL\n');
  
  // Verificar variables de entorno
  const requiredEnvVars = [
    'POSTGRES_HOST',
    'POSTGRES_DATABASE', 
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Variables de entorno faltantes:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    console.log('\n📝 Para configurar Neon, necesitas:');
    console.log('1. Crear una base de datos en Neon (https://neon.tech)');
    console.log('2. Obtener las credenciales de conexión');
    console.log('3. Configurar las variables de entorno:');
    console.log('\n   En tu archivo .env.local:');
    console.log('   POSTGRES_HOST=tu-host.neon.tech');
    console.log('   POSTGRES_DATABASE=tu-database');
    console.log('   POSTGRES_USER=tu-usuario');
    console.log('   POSTGRES_PASSWORD=tu-password');
    console.log('   POSTGRES_PORT=5432');
    
    console.log('\n💡 Alternativamente, puedes:');
    console.log('1. Usar Vercel Postgres (recomendado para Vercel)');
    console.log('2. O configurar las variables en Vercel directamente');
    
    return;
  }
  
  console.log('✅ Variables de entorno encontradas');
  console.log(`   Host: ${process.env.POSTGRES_HOST}`);
  console.log(`   Database: ${process.env.POSTGRES_DATABASE}`);
  console.log(`   User: ${process.env.POSTGRES_USER}`);
  console.log(`   Port: ${process.env.POSTGRES_PORT || '5432'}\n`);
  
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Conectando a Neon/PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a Neon/PostgreSQL');

    // Verificar si la tabla existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'investigadores'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla investigadores no existe en Neon');
      console.log('💡 Necesitas ejecutar las migraciones de Prisma primero:');
      console.log('   npx prisma migrate deploy');
      return;
    }

    console.log('✅ Tabla investigadores encontrada');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await client.query(
      'SELECT * FROM investigadores WHERE correo = $1',
      ['admin@sei.com.mx']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('ℹ️ Usuario admin ya existe, actualizando permisos...');
      await client.query(
        'UPDATE investigadores SET is_admin = true, password = $1 WHERE correo = $2',
        ['admin123', 'admin@sei.com.mx']
      );
      console.log('✅ Usuario admin actualizado exitosamente');
    } else {
      // Crear usuario admin
      console.log('👤 Creando usuario admin...');
      const result = await client.query(`
        INSERT INTO investigadores (
          nombre_completo, 
          correo, 
          password, 
          is_admin, 
          institucion, 
          nacionalidad,
          fecha_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        'Administrador del Sistema',
        'admin@sei.com.mx',
        'admin123',
        true,
        'SECCTI Chihuahua',
        'Mexicana',
        new Date().toISOString()
      ]);
      console.log('✅ Usuario admin creado exitosamente');
    }

    // Verificar el usuario creado
    const adminUser = await client.query(
      'SELECT * FROM investigadores WHERE correo = $1',
      ['admin@sei.com.mx']
    );

    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0];
      console.log('\n📋 Información del usuario admin:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.nombre_completo}`);
      console.log(`   Email: ${user.correo}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Es Admin: ${user.is_admin}`);
      console.log(`   Institución: ${user.institucion}`);
    }

    console.log('\n🎉 ¡Usuario admin creado exitosamente en Neon!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email: admin@sei.com.mx');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error al crear usuario admin en Neon:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verificar que las variables de entorno estén correctas');
      console.log('2. Verificar que la base de datos de Neon esté activa');
      console.log('3. Verificar que el firewall permita la conexión');
    }
  } finally {
    await client.end();
    console.log('\n✅ Conexión a Neon cerrada.');
  }
}

createAdminInNeon();
