const { sql } = require('@vercel/postgres');

async function createAdminInVercel() {
  try {
    console.log('🔧 Creando usuario admin en Vercel Postgres...\n');

    // Verificar si la tabla existe
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'investigadores'
      );
    `;

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla investigadores no existe en Vercel Postgres');
      console.log('💡 Necesitas ejecutar las migraciones de Prisma primero:');
      console.log('   npx prisma migrate deploy');
      return;
    }

    console.log('✅ Tabla investigadores encontrada');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await sql`
      SELECT * FROM investigadores WHERE correo = 'admin@sei.com.mx'
    `;

    if (existingAdmin.rows.length > 0) {
      console.log('ℹ️ Usuario admin ya existe, actualizando permisos...');
      await sql`
        UPDATE investigadores 
        SET is_admin = true, password = 'admin123' 
        WHERE correo = 'admin@sei.com.mx'
      `;
      console.log('✅ Usuario admin actualizado exitosamente');
    } else {
      // Crear usuario admin
      console.log('👤 Creando usuario admin...');
      const result = await sql`
        INSERT INTO investigadores (
          nombre_completo, 
          correo, 
          password, 
          is_admin, 
          institucion, 
          nacionalidad,
          fecha_registro
        ) VALUES (
          'Administrador del Sistema',
          'admin@sei.com.mx',
          'admin123',
          true,
          'SECCTI Chihuahua',
          'Mexicana',
          ${new Date().toISOString()}
        )
        RETURNING id
      `;
      console.log('✅ Usuario admin creado exitosamente');
    }

    // Verificar el usuario creado
    const adminUser = await sql`
      SELECT * FROM investigadores WHERE correo = 'admin@sei.com.mx'
    `;

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

    console.log('\n🎉 ¡Usuario admin creado exitosamente en Vercel Postgres!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email: admin@sei.com.mx');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error al crear usuario admin en Vercel Postgres:', error.message);
    
    if (error.message.includes('@vercel/postgres')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Instalar @vercel/postgres: npm install @vercel/postgres');
      console.log('2. Configurar Vercel Postgres en tu proyecto');
      console.log('3. Verificar que las variables de entorno estén configuradas');
    }
  }
}

createAdminInVercel();
