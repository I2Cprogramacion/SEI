// Script para listar y eliminar TODOS los usuarios de Clerk
// Ejecutar: node scripts/reset-clerk-users.js

require('dotenv').config({ path: '.env.local' });
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetClerkUsers() {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  
  if (!CLERK_SECRET_KEY) {
    console.error('❌ Error: CLERK_SECRET_KEY no encontrada en .env.local');
    console.log('📝 Asegúrate de tener el archivo .env.local con CLERK_SECRET_KEY');
    process.exit(1);
  }

  try {
    console.log('🔍 Buscando TODOS los usuarios en Clerk...\n');
    
    // Obtener lista de usuarios usando la API de Clerk
    const response = await fetch('https://api.clerk.com/v1/users?limit=500', {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const users = await response.json();
    
    if (!users || users.length === 0) {
      console.log('✅ No hay usuarios en Clerk para eliminar');
      rl.close();
      return;
    }

    console.log(`📋 Encontrados ${users.length} usuarios:\n`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const email = user.email_addresses?.[0]?.email_address || 'Sin email';
      const username = user.username || 'Sin username';
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Sin nombre';
      
      console.log(`${i + 1}. 👤 ${fullName}`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   👤 Username: ${username}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   📅 Creado: ${new Date(user.created_at).toLocaleString('es-MX')}`);
      console.log(`   🔐 Verificado: ${user.email_addresses?.[0]?.verification?.status || 'No'}`);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los usuarios de Clerk');
    console.log('⚠️  Esta acción NO se puede deshacer\n');
    
    const confirmacion = await pregunta('¿Estás seguro de eliminar TODOS los usuarios? (escribe "SI" para confirmar): ');
    
    if (confirmacion.trim().toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada por el usuario');
      rl.close();
      return;
    }
    
    console.log('\n🗑️  Eliminando usuarios...\n');
    
    let eliminados = 0;
    let errores = 0;
    
    for (const user of users) {
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
          console.log(`✅ Eliminado: ${email}`);
          eliminados++;
        } else {
          const errorText = await deleteResponse.text();
          console.error(`❌ Error eliminando ${email} (${deleteResponse.status}): ${errorText}`);
          errores++;
        }
        
        // Pequeña pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error eliminando ${email}:`, error.message);
        errores++;
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 Resumen:');
    console.log(`   ✅ Eliminados exitosamente: ${eliminados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📋 Total procesados: ${users.length}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (eliminados > 0) {
      console.log('✅ Limpieza completada!');
      console.log('💡 Ahora puedes registrarte nuevamente con tu correo');
    }
    
    rl.close();

  } catch (error) {
    console.error('\n❌ Error durante el proceso:', error.message);
    console.error('📝 Detalles:', error);
    rl.close();
    process.exit(1);
  }
}

resetClerkUsers();
