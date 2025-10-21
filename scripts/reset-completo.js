/**
 * Script MAESTRO para RESET COMPLETO
 * 
 * Ejecuta en orden:
 * 1. Reset de base de datos (PostgreSQL)
 * 2. Reset de Clerk (usuarios de autenticación)
 * 
 * ADVERTENCIA: ESTO ELIMINARÁ TODO
 * - Todos los usuarios de PostgreSQL
 * - Todos los usuarios de Clerk
 * - Todas las conexiones, mensajes y actividad
 * 
 * USA CON EXTREMA PRECAUCIÓN
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function ejecutarScript(nombreScript, descripcion) {
  console.log(`\n▶️  Ejecutando: ${descripcion}`);
  console.log(`   Script: ${nombreScript}\n`);
  
  try {
    const { stdout, stderr } = await execAsync(`node scripts/${nombreScript}`);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`✅ ${descripcion} - Completado\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${descripcion}:`);
    console.error(error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

async function resetCompleto() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║                                                   ║');
  console.log('║        🔄 RESET COMPLETO DEL SISTEMA 🔄          ║');
  console.log('║                                                   ║');
  console.log('║   Base de Datos PostgreSQL + Clerk Auth          ║');
  console.log('║                                                   ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  console.log('🚨 ADVERTENCIA FINAL:');
  console.log('   Este proceso eliminará TODOS los usuarios y datos');
  console.log('   Esta acción es IRREVERSIBLE');
  console.log('   Tienes 5 segundos para cancelar (Ctrl+C)\n');

  // Countdown
  for (let i = 5; i > 0; i--) {
    process.stdout.write(`\r   Iniciando en ${i}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\r   Iniciando AHORA      \n');

  // Paso 1: Reset de base de datos
  const paso1 = await ejecutarScript(
    'reset-usuarios.js',
    'PASO 1: Reset de Base de Datos PostgreSQL'
  );

  if (!paso1) {
    console.log('\n❌ Error en Paso 1. Abortando proceso.');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Paso 2: Reset de Clerk
  const paso2 = await ejecutarScript(
    'reset-clerk.js',
    'PASO 2: Reset de Clerk (Autenticación)'
  );

  if (!paso2) {
    console.log('\n⚠️  Advertencia: Hubo problemas con Clerk.');
    console.log('   Puedes eliminar usuarios manualmente en:');
    console.log('   https://dashboard.clerk.com → Users\n');
  }

  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║                                                   ║');
  console.log('║              ✅ RESET COMPLETADO ✅              ║');
  console.log('║                                                   ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  console.log('📋 RESUMEN:');
  console.log(`   Base de Datos: ${paso1 ? '✅ Limpia' : '❌ Error'}`);
  console.log(`   Clerk Auth:    ${paso2 ? '✅ Limpio' : '⚠️  Verificar manualmente'}`);
  console.log('\n🎯 SIGUIENTE PASO:');
  console.log('   El sistema está listo para nuevos usuarios');
  console.log('   Puedes empezar a registrar usuarios desde cero\n');

  console.log('═══════════════════════════════════════════════════\n');
}

// Ejecutar
resetCompleto()
  .then(() => {
    console.log('✅ Proceso maestro completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal en proceso maestro:', error);
    process.exit(1);
  });
