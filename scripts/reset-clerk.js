/**
 * Script para eliminar TODOS los usuarios de Clerk
 * 
 * ADVERTENCIA: Esto eliminará TODOS los usuarios de Clerk
 * USA CON PRECAUCIÓN - ACCIÓN IRREVERSIBLE
 */

require('dotenv').config({ path: '.env.local' });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API_URL = 'https://api.clerk.com/v1';

if (!CLERK_SECRET_KEY) {
  console.error('❌ Error: CLERK_SECRET_KEY no está definida en .env.local');
  process.exit(1);
}

async function listarUsuariosClerk() {
  try {
    const response = await fetch(`${CLERK_API_URL}/users?limit=500`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error al listar usuarios de Clerk:', error.message);
    throw error;
  }
}

async function eliminarUsuarioClerk(userId) {
  try {
    const response = await fetch(`${CLERK_API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar usuario ${userId}:`, error.message);
    return false;
  }
}

async function resetearClerk() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🔄 RESET DE USUARIOS EN CLERK');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('🚨 ADVERTENCIA: Vas a eliminar TODOS los usuarios de Clerk');
  console.log('⚠️  ESTA ACCIÓN ES IRREVERSIBLE\n');

  // Esperar 3 segundos
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('1️⃣ Obteniendo lista de usuarios de Clerk...\n');

  const usuarios = await listarUsuariosClerk();
  
  if (!usuarios || usuarios.length === 0) {
    console.log('✅ No hay usuarios en Clerk para eliminar');
    return;
  }

  console.log(`📊 Encontrados ${usuarios.length} usuarios en Clerk\n`);

  console.log('2️⃣ Eliminando usuarios...\n');

  let eliminados = 0;
  let errores = 0;

  for (let i = 0; i < usuarios.length; i++) {
    const usuario = usuarios[i];
    const email = usuario.email_addresses?.[0]?.email_address || 'Sin email';
    const nombre = usuario.first_name || usuario.username || 'Sin nombre';
    
    process.stdout.write(`   [${i + 1}/${usuarios.length}] Eliminando: ${nombre} (${email})... `);
    
    const resultado = await eliminarUsuarioClerk(usuario.id);
    
    if (resultado) {
      eliminados++;
      console.log('✅');
    } else {
      errores++;
      console.log('❌');
    }

    // Pequeño delay para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 RESUMEN');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`✅ Usuarios eliminados: ${eliminados}`);
  console.log(`❌ Errores:             ${errores}`);
  console.log(`📋 Total procesados:    ${usuarios.length}`);
  console.log('\n═══════════════════════════════════════════════════\n');

  // Verificación final
  console.log('3️⃣ Verificación final...\n');
  const verificacion = await listarUsuariosClerk();
  
  if (verificacion.length === 0) {
    console.log('✅ Clerk está completamente limpio - 0 usuarios');
  } else {
    console.log(`⚠️  Aún quedan ${verificacion.length} usuarios en Clerk`);
    console.log('   Puede que algunos no se hayan eliminado por permisos');
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

// Ejecutar
resetearClerk()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
