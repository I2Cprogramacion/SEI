// Script para eliminar investigadores de PostgreSQL
// Ejecutar: node scripts/clean-postgres-users.js

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function cleanPostgresUsers() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL no encontrada en .env.local');
    console.log('📝 Asegúrate de tener el archivo .env.local con DATABASE_URL o POSTGRES_URL');
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Conectando a PostgreSQL...\n');
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');
    
    // Obtener lista de investigadores
    const result = await client.query(`
      SELECT 
        id,
        nombre_completo,
        correo,
        fecha_registro
      FROM investigadores
      ORDER BY fecha_registro DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('✅ No hay investigadores en la base de datos');
      await client.end();
      rl.close();
      return;
    }

    console.log(`📋 Encontrados ${result.rows.length} investigadores en PostgreSQL:\n`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (let i = 0; i < result.rows.length; i++) {
      const inv = result.rows[i];
      console.log(`${i + 1}. 👤 ${inv.nombre_completo || 'Sin nombre'}`);
      console.log(`   📧 Email: ${inv.correo || 'Sin email'}`);
      console.log(`   🆔 ID: ${inv.id}`);
      console.log(`   📅 Registrado: ${inv.fecha_registro ? new Date(inv.fecha_registro).toLocaleString('es-MX') : 'Fecha desconocida'}`);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los investigadores de PostgreSQL');
    console.log('⚠️  Esta acción NO se puede deshacer\n');
    
    const confirmacion = await pregunta('¿Estás seguro de eliminar TODOS los investigadores? (escribe "SI" para confirmar): ');
    
    if (confirmacion.trim().toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada por el usuario');
      await client.end();
      rl.close();
      return;
    }
    
    console.log('\n🗑️  Eliminando investigadores de PostgreSQL...\n');
    
    const deleteResult = await client.query('DELETE FROM investigadores');
    
    console.log(`✅ Eliminados ${deleteResult.rowCount} investigadores de PostgreSQL\n`);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Resumen:');
    console.log(`   ✅ Investigadores eliminados: ${deleteResult.rowCount}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('✅ Limpieza de PostgreSQL completada!');
    console.log('💡 Ahora la base de datos está limpia para nuevos registros\n');
    
    await client.end();
    rl.close();

  } catch (error) {
    console.error('\n❌ Error durante el proceso:', error.message);
    console.error('📝 Detalles:', error);
    
    try {
      await client.end();
    } catch (e) {
      // Ignorar error al cerrar
    }
    
    rl.close();
    process.exit(1);
  }
}

cleanPostgresUsers();
