// Script para limpiar usuarios de prueba en Clerk usando la API REST
// Ejecutar: node scripts/clean-clerk-test-users.js

require('dotenv').config({ path: '.env.local' });

async function cleanTestUsers() {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  
  if (!CLERK_SECRET_KEY) {
    console.error('❌ Error: CLERK_SECRET_KEY no encontrada en .env.local');
    process.exit(1);
  }

  try {
    console.log('🔍 Buscando usuarios de prueba en Clerk...\n');
    
    // Obtener lista de usuarios usando la API de Clerk
    const response = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const users = await response.json();
    
    if (!users || users.length === 0) {
      console.log('✅ No hay usuarios para limpiar');
      return;
    }

    console.log(`📋 Encontrados ${users.length} usuarios:\n`);
    
    for (const user of users) {
      const email = user.email_addresses?.[0]?.email_address || 'Sin email';
      console.log(`  📧 ${email}`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Creado: ${new Date(user.created_at).toLocaleString()}\n`);
    }

    console.log('⚠️  NOTA: Para borrar usuarios, descomenta la sección de eliminación en el script\n');
    console.log('📝 O ve manualmente a: https://dashboard.clerk.com/apps/YOUR_APP_ID/users\n');
    
    /* DESCOMENTA ESTO PARA HABILITAR LA ELIMINACIÓN:
    
    console.log('🗑️  Eliminando usuarios...\n');
    
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
        } else {
          console.error(`❌ Error eliminando ${email}: ${deleteResponse.status}`);
        }
      } catch (error) {
        console.error(`❌ Error eliminando ${email}:`, error.message);
      }
    }
    
    console.log('\n✅ Limpieza completada!');
    */

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanTestUsers();
