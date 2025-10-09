require('dotenv').config({ path: '.env.local' });

const { Client } = require('pg');

async function checkPostgresUsers() {
  console.log('🔍 Verificando usuarios en PostgreSQL...');
  
  // Configuración de conexión
  // base de derek(prueba) - Configuración anterior con variables separadas:
  // const client = new Client({
  //   host: process.env.POSTGRES_HOST,
  //   port: process.env.POSTGRES_PORT || 5432,
  //   database: process.env.POSTGRES_DATABASE,
  //   user: process.env.POSTGRES_USER,
  //   password: process.env.POSTGRES_PASSWORD,
  //   ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
  // });

  // Nueva configuración usando DATABASE_URL (compatible con Prisma)
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si existe la tabla investigadores
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'investigadores'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla "investigadores" no existe en PostgreSQL');
      return;
    }

    console.log('✅ Tabla "investigadores" encontrada');

    // Contar total de investigadores
    const countResult = await client.query('SELECT COUNT(*) as total FROM investigadores');
    const total = countResult.rows[0].total;


    console.log(`\n📊 Total de investigadores: ${total}`);

    if (total > 0) {
      // Obtener todos los investigadores
      const result = await client.query(`
        SELECT 
          id, 
          correo, 
          nombre_completo, 
          institucion, 
          area, 
          password IS NOT NULL as tiene_contrasena,
          fecha_registro
        FROM investigadores 
        ORDER BY id
      `);

      console.log(`\n👥 Lista de investigadores (${result.rows.length}):`);
      
      let adminCount = 0;
      let regularCount = 0;

      result.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. 👤 ID: ${user.id}`);
        console.log(`   📧 Email: ${user.correo}`);
        console.log(`   👤 Nombre: ${user.nombre_completo || 'No especificado'}`);
        console.log(`   🏢 Institución: ${user.institucion || 'No especificada'}`);
        console.log(`   🔬 Área: ${user.area || 'No especificada'}`);
        console.log(`   🔑 Contraseña: ${user.tiene_contrasena ? '✅ Configurada' : '❌ Sin contraseña'}`);
        console.log(`   📅 Registro: ${user.fecha_registro || 'No especificado'}`);
        
        // Verificar si es admin (por email)
        if (user.correo === 'admin@sei.com.mx') {
          console.log(`   👑 Admin: ✅ SÍ`);
          adminCount++;
        } else {
          console.log(`   👑 Admin: ❌ NO`);
          regularCount++;
        }
      });

      console.log('\n📊 RESUMEN:');
      console.log(`   👑 Administradores: ${adminCount}`);
      console.log(`   👤 Usuarios regulares: ${regularCount}`);
      console.log(`   📈 Total: ${result.rows.length}`);

      // Verificar si existe el admin
      const adminExists = result.rows.find(user => user.correo === 'admin@sei.com.mx');
      if (!adminExists) {
        console.log('\n⚠️  ADVERTENCIA: No se encontró el usuario admin@sei.com.mx');
        console.log('💡 Necesitas crear el usuario administrador');
      } else {
        console.log('\n✅ Usuario administrador encontrado');
      }

    } else {
      console.log('\n❌ No hay investigadores en la base de datos');
      console.log('💡 Necesitas crear usuarios, incluyendo el administrador');
    }

  } catch (error) {
    console.error('❌ Error al verificar usuarios en PostgreSQL:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verificar que las variables de entorno estén configuradas');
      console.log('2. Verificar que la base de datos esté ejecutándose');
      console.log('3. Verificar las credenciales de conexión');
    }
  } finally {
    await client.end();
    console.log('\n✅ Conexión cerrada');
  }
}

checkPostgresUsers().catch(console.error);
