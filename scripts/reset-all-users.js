// Script COMPLETO para resetear Clerk + PostgreSQL
// Elimina TODOS los usuarios de Clerk y PostgreSQL en una sola ejecución
// Ejecutar: node scripts/reset-all-users.js

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

async function resetAllUsers() {
  console.log('🔄 RESET COMPLETO DE USUARIOS\n');
  console.log('Este script eliminará:');
  console.log('  1. 👤 Todos los usuarios de Clerk');
  console.log('  2. 📊 Todos los investigadores de PostgreSQL\n');
  
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!CLERK_SECRET_KEY) {
    console.error('❌ Error: CLERK_SECRET_KEY no encontrada en .env.local');
    process.exit(1);
  }
  
  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL no encontrada en .env.local');
    process.exit(1);
  }

  try {
    // ========== PASO 1: LISTAR USUARIOS DE CLERK ==========
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 PASO 1: USUARIOS EN CLERK');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const clerkResponse = await fetch('https://api.clerk.com/v1/users?limit=500', {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!clerkResponse.ok) {
      throw new Error(`Error HTTP ${clerkResponse.status}`);
    }

    const clerkUsers = await clerkResponse.json();
    
    if (clerkUsers && clerkUsers.length > 0) {
      console.log(`Encontrados ${clerkUsers.length} usuarios en Clerk:\n`);
      for (const user of clerkUsers) {
        const email = user.email_addresses?.[0]?.email_address || 'Sin email';
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre';
        console.log(`  👤 ${name} (${email})`);
      }
    } else {
      console.log('✅ No hay usuarios en Clerk');
    }
    
    // ========== PASO 2: LISTAR INVESTIGADORES EN POSTGRESQL ==========
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 PASO 2: INVESTIGADORES EN POSTGRESQL');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const pgClient = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await pgClient.connect();
    
    const pgResult = await pgClient.query(`
      SELECT id, nombre_completo, correo 
      FROM investigadores 
      ORDER BY id
    `);
    
    if (pgResult.rows.length > 0) {
      console.log(`Encontrados ${pgResult.rows.length} investigadores en PostgreSQL:\n`);
      for (const inv of pgResult.rows) {
        console.log(`  📊 ${inv.nombre_completo || 'Sin nombre'} (${inv.correo || 'Sin email'})`);
      }
    } else {
      console.log('✅ No hay investigadores en PostgreSQL');
    }
    
    // ========== CONFIRMACIÓN ==========
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('⚠️  ADVERTENCIA FINAL');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const totalUsuarios = (clerkUsers?.length || 0) + pgResult.rows.length;
    
    if (totalUsuarios === 0) {
      console.log('✅ No hay datos para eliminar. Todo está limpio.\n');
      await pgClient.end();
      rl.close();
      return;
    }
    
    console.log(`Se eliminarán ${totalUsuarios} registros en total:`);
    console.log(`  - ${clerkUsers?.length || 0} usuarios de Clerk`);
    console.log(`  - ${pgResult.rows.length} investigadores de PostgreSQL\n`);
    console.log('⚠️  Esta acción NO se puede deshacer\n');
    
    const confirmacion = await pregunta('¿Continuar con la eliminación? (escribe "ELIMINAR TODO" para confirmar): ');
    
    if (confirmacion.trim() !== 'ELIMINAR TODO') {
      console.log('\n❌ Operación cancelada por el usuario');
      await pgClient.end();
      rl.close();
      return;
    }
    
    // ========== PASO 3: ELIMINAR DE CLERK ==========
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🗑️  PASO 3: ELIMINANDO USUARIOS DE CLERK');
    console.log('═══════════════════════════════════════════════════════\n');
    
    let clerkEliminados = 0;
    
    if (clerkUsers && clerkUsers.length > 0) {
      for (const user of clerkUsers) {
        const email = user.email_addresses?.[0]?.email_address || 'Sin email';
        try {
          const deleteResponse = await fetch(`https://api.clerk.com/v1/users/${user.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (deleteResponse.ok) {
            console.log(`  ✅ Clerk: ${email}`);
            clerkEliminados++;
          } else {
            console.error(`  ❌ Error con ${email}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`  ❌ Error con ${email}:`, error.message);
        }
      }
    }
    
    // ========== PASO 4: ELIMINAR DE POSTGRESQL ==========
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🗑️  PASO 4: ELIMINANDO DE POSTGRESQL');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const deleteResult = await pgClient.query('DELETE FROM investigadores');
    console.log(`  ✅ PostgreSQL: ${deleteResult.rowCount} investigadores eliminados`);
    
    await pgClient.end();
    
    // ========== RESUMEN FINAL ==========
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN FINAL');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`  ✅ Clerk: ${clerkEliminados} usuarios eliminados`);
    console.log(`  ✅ PostgreSQL: ${deleteResult.rowCount} investigadores eliminados`);
    console.log(`  ✅ Total: ${clerkEliminados + deleteResult.rowCount} registros eliminados\n`);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ¡RESET COMPLETO EXITOSO!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('💡 Próximos pasos:');
    console.log('   1. Ve a http://localhost:3000/registro');
    console.log('   2. Registra tu cuenta nuevamente');
    console.log('   3. Tu correo ahora está disponible para registro\n');
    
    rl.close();

  } catch (error) {
    console.error('\n❌ Error durante el proceso:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetAllUsers();
