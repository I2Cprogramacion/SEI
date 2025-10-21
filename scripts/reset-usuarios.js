/**
 * Script para RESETEAR COMPLETAMENTE usuarios
 * 
 * ADVERTENCIA: Esto eliminará TODOS los usuarios y datos relacionados
 * - Tabla Usuario
 * - Tabla Conexion
 * - Tabla Mensaje
 * - Tabla UltimaActividad
 * 
 * USA CON PRECAUCIÓN - ACCIÓN IRREVERSIBLE
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function resetearUsuarios() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('\n🚨 ADVERTENCIA: Vas a eliminar TODOS los usuarios');
    console.log('Este proceso eliminará:');
    console.log('  - Todos los investigadores de la tabla investigadores');
    console.log('  - Todas las conexiones (tabla conexiones)');
    console.log('  - Todos los mensajes (tabla mensajes)');
    console.log('  - Todas las notificaciones (tabla notificaciones)');
    console.log('\n⚠️  ESTA ACCIÓN ES IRREVERSIBLE\n');

    // Esperar 3 segundos para que el usuario cancele si no está seguro
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Iniciando proceso de reset...\n');

    // 1. Eliminar mensajes (depende de conexiones)
    console.log('📧 Eliminando mensajes...');
    const mensajesResult = await pool.query('DELETE FROM mensajes');
    console.log(`   ✅ ${mensajesResult.rowCount} mensajes eliminados`);

    // 2. Eliminar conexiones (depende de usuarios)
    console.log('🔗 Eliminando conexiones...');
    const conexionesResult = await pool.query('DELETE FROM conexiones');
    console.log(`   ✅ ${conexionesResult.rowCount} conexiones eliminadas`);

    // 3. Eliminar notificaciones
    console.log('🔔 Eliminando notificaciones...');
    const notificacionesResult = await pool.query('DELETE FROM notificaciones');
    console.log(`   ✅ ${notificacionesResult.rowCount} notificaciones eliminadas`);

    // 4. Eliminar investigadores (usuarios principales)
    console.log('👥 Eliminando investigadores...');
    const investigadoresResult = await pool.query('DELETE FROM investigadores');
    console.log(`   ✅ ${investigadoresResult.rowCount} investigadores eliminados`);

    console.log('\n✅ BASE DE DATOS LIMPIA\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 SIGUIENTE PASO: LIMPIAR CLERK DASHBOARD');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('1. Ve a: https://dashboard.clerk.com');
    console.log('2. Selecciona tu aplicación');
    console.log('3. Ve a: Users → (selecciona todos)');
    console.log('4. Click en "Actions" → "Delete users"');
    console.log('5. Confirma la eliminación');
    console.log('\n🔄 O usa el endpoint de Clerk para eliminar usuarios:');
    console.log('   Necesitarás llamar a la API de Clerk para cada usuario\n');

    // Verificar que todo está vacío
    console.log('═══════════════════════════════════════════════════');
    console.log('🔍 VERIFICACIÓN FINAL');
    console.log('═══════════════════════════════════════════════════\n');
    
    const verificacion = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM investigadores) as investigadores,
        (SELECT COUNT(*) FROM conexiones) as conexiones,
        (SELECT COUNT(*) FROM mensajes) as mensajes,
        (SELECT COUNT(*) FROM notificaciones) as notificaciones
    `);
    
    const stats = verificacion.rows[0];
    console.log('Investigadores: ', stats.investigadores);
    console.log('Conexiones:     ', stats.conexiones);
    console.log('Mensajes:       ', stats.mensajes);
    console.log('Notificaciones: ', stats.notificaciones);
    
    if (stats.investigadores === '0' && stats.conexiones === '0' && 
        stats.mensajes === '0' && stats.notificaciones === '0') {
      console.log('\n✅ Todas las tablas están vacías');
    } else {
      console.log('\n⚠️  Advertencia: Algunas tablas no están completamente vacías');
    }

    console.log('\n═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error al resetear usuarios:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
console.log('\n═══════════════════════════════════════════════════');
console.log('🔄 RESET COMPLETO DE USUARIOS - SEI');
console.log('═══════════════════════════════════════════════════\n');

resetearUsuarios()
  .then(() => {
    console.log('✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
