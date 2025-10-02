require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createAdminInPostgres() {
  // base de derek(prueba) - Configuración anterior con variables separadas:
  // const client = new Client({
  //   host: process.env.POSTGRES_HOST || 'localhost',
  //   port: parseInt(process.env.POSTGRES_PORT || '5432'),
  //   database: process.env.POSTGRES_DATABASE || 'researcher_platform',
  //   user: process.env.POSTGRES_USER || 'postgres',
  //   password: process.env.POSTGRES_PASSWORD || '',
  //   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // });

  // Nueva configuración usando DATABASE_URL (compatible con Prisma)
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔗 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si la tabla existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'investigadores'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla investigadores no existe en PostgreSQL');
      return;
    }

    // Verificar si ya existe un usuario admin
    const existingAdmin = await client.query(
      'SELECT * FROM investigadores WHERE correo = $1',
      ['admin@sei.com.mx']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('ℹ️ Usuario admin ya existe, actualizando permisos...');
      await client.query(
        'UPDATE investigadores SET password = $1 WHERE correo = $2',
        ['admin123', 'admin@sei.com.mx']
      );
      console.log('✅ Usuario admin actualizado exitosamente');
    } else {
      // Crear usuario admin
      console.log('Creando usuario admin...');
      const result = await client.query(`
        INSERT INTO investigadores (
          nombre_completo, 
          correo, 
          password, 
          institucion, 
          nacionalidad,
          fecha_registro
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        'Administrador del Sistema',
        'admin@sei.com.mx',
        'admin123',
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
      console.log(`   Es Admin: ${user.correo === 'admin@sei.com.mx' ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   Institución: ${user.institucion}`);
    }

    console.log('\n🎉 ¡Usuario admin creado exitosamente en PostgreSQL!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email: admin@sei.com.mx');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error al crear usuario admin en PostgreSQL:', error);
  } finally {
    await client.end();
    console.log('Conexión a PostgreSQL cerrada.');
  }
}

createAdminInPostgres();
