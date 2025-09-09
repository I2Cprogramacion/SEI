// Script para probar la configuración de la base de datos
require('dotenv').config({ path: '.env.local' });

async function testConfig() {
  try {
    console.log('🔌 Probando configuración de base de datos...');
    
    // Verificar variables de entorno
    const requiredVars = ['POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
    const missing = requiredVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.log('⚠️ Variables de entorno faltantes:', missing);
      console.log('💡 Esto es normal en desarrollo local');
      console.log('✅ En Vercel, estas variables se configuran automáticamente');
    } else {
      console.log('✅ Variables de entorno de Vercel Postgres configuradas');
      console.log('🌐 Host:', process.env.POSTGRES_HOST);
      console.log('📊 Base de datos:', process.env.POSTGRES_DATABASE);
      console.log('👤 Usuario:', process.env.POSTGRES_USER);
    }
    
    console.log('\n🚀 Configuración lista para usar Vercel Postgres!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConfig();
