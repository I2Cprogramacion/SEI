// Script para probar la conexión a Vercel Postgres
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a Vercel Postgres...');
    
    // Verificar variables de entorno
    const requiredVars = ['POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
    const missing = requiredVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Variables de entorno faltantes:', missing);
      console.log('💡 Asegúrate de tener un archivo .env.local con las variables de Vercel Postgres');
      return;
    }
    
    console.log('✅ Variables de entorno configuradas correctamente');
    
    // Probar conexión
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    console.log('✅ Conexión exitosa a Vercel Postgres!');
    console.log('🕐 Hora actual:', result.rows[0].current_time);
    console.log('📊 Versión de PostgreSQL:', result.rows[0].postgres_version);
    
  } catch (error) {
    console.error('❌ Error conectando a Vercel Postgres:', error.message);
    console.log('💡 Verifica que:');
    console.log('   1. Tengas las variables de entorno correctas');
    console.log('   2. La base de datos esté activa en Vercel');
    console.log('   3. Tu IP esté permitida (si usas restricciones)');
  }
}

testConnection();
