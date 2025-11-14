/**
 * Script para limpiar usuarios duplicados o incompletos en la base de datos
 * 
 * Este script:
 * 1. Identifica usuarios duplicados por correo o CURP
 * 2. Identifica usuarios incompletos (sin clerk_user_id o sin campos críticos)
 * 3. Ofrece opciones para eliminar o consolidar registros
 * 
 * IMPORTANTE: 
 * - Revisar cuidadosamente antes de ejecutar
 * - Se recomienda hacer un backup de la base de datos antes
 * - Los usuarios con clerk_user_id se consideran válidos y completos
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function conectar() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    process.exit(1);
  }
}

async function encontrarDuplicadosPorCorreo() {
  console.log('\n🔍 Buscando usuarios duplicados por correo...');
  
  const query = `
    SELECT 
      correo,
      COUNT(*) as cantidad,
      ARRAY_AGG(id ORDER BY id) as ids,
      ARRAY_AGG(nombre_completo ORDER BY id) as nombres,
      ARRAY_AGG(clerk_user_id ORDER BY id) as clerk_ids,
      ARRAY_AGG(fecha_registro ORDER BY id) as fechas
    FROM investigadores
    WHERE correo IS NOT NULL AND correo != ''
    GROUP BY correo
    HAVING COUNT(*) > 1
    ORDER BY cantidad DESC
  `;
  
  const result = await client.query(query);
  
  if (result.rows.length === 0) {
    console.log('✅ No se encontraron usuarios duplicados por correo');
    return [];
  }
  
  console.log(`\n⚠️  Encontrados ${result.rows.length} correos duplicados:\n`);
  
  result.rows.forEach((row, index) => {
    console.log(`${index + 1}. Correo: ${row.correo}`);
    console.log(`   Cantidad: ${row.cantidad} registros`);
    console.log(`   IDs: ${row.ids.join(', ')}`);
    console.log(`   Nombres: ${row.nombres.join(' | ')}`);
    console.log(`   Clerk IDs: ${row.clerk_ids.map(id => id || 'NULL').join(' | ')}`);
    console.log(`   Fechas: ${row.fechas.map(f => f ? new Date(f).toLocaleDateString() : 'NULL').join(' | ')}`);
    console.log('');
  });
  
  return result.rows;
}

async function encontrarUsuariosIncompletos() {
  console.log('\n🔍 Buscando usuarios incompletos (sin clerk_user_id)...');
  
  const query = `
    SELECT 
      id,
      nombre_completo,
      correo,
      curp,
      rfc,
      no_cvu,
      telefono,
      clerk_user_id,
      fecha_registro,
      origen
    FROM investigadores
    WHERE clerk_user_id IS NULL OR clerk_user_id = ''
    ORDER BY fecha_registro DESC
  `;
  
  const result = await client.query(query);
  
  if (result.rows.length === 0) {
    console.log('✅ No se encontraron usuarios incompletos');
    return [];
  }
  
  console.log(`\n⚠️  Encontrados ${result.rows.length} usuarios incompletos (sin Clerk User ID):\n`);
  
  result.rows.forEach((row, index) => {
    console.log(`${index + 1}. ID: ${row.id}`);
    console.log(`   Nombre: ${row.nombre_completo || 'NO CAPTURADO'}`);
    console.log(`   Correo: ${row.correo || 'NO CAPTURADO'}`);
    console.log(`   CURP: ${row.curp || 'NO CAPTURADO'}`);
    console.log(`   RFC: ${row.rfc || 'NO CAPTURADO'}`);
    console.log(`   CVU: ${row.no_cvu || 'NO CAPTURADO'}`);
    console.log(`   Teléfono: ${row.telefono || 'NO CAPTURADO'}`);
    console.log(`   Fecha registro: ${row.fecha_registro ? new Date(row.fecha_registro).toLocaleString() : 'NO CAPTURADO'}`);
    console.log(`   Origen: ${row.origen || 'DESCONOCIDO'}`);
    console.log('');
  });
  
  return result.rows;
}

async function eliminarUsuariosIncompletos(dryRun = true) {
  const incompletos = await encontrarUsuariosIncompletos();
  
  if (incompletos.length === 0) {
    return;
  }
  
  const ids = incompletos.map(u => u.id);
  
  if (dryRun) {
    console.log('\n🔔 MODO PRUEBA (DRY RUN)');
    console.log(`Se eliminarían ${ids.length} usuarios incompletos con IDs: ${ids.join(', ')}`);
    console.log('\nPara ejecutar la eliminación real, ejecuta:');
    console.log('node scripts/limpiar-usuarios-duplicados.js --eliminar-incompletos');
  } else {
    console.log('\n⚠️  ELIMINANDO usuarios incompletos...');
    
    const query = `
      DELETE FROM investigadores
      WHERE id = ANY($1::int[])
      RETURNING id, nombre_completo, correo
    `;
    
    const result = await client.query(query, [ids]);
    
    console.log(`\n✅ Eliminados ${result.rows.length} usuarios incompletos:`);
    result.rows.forEach(row => {
      console.log(`   - ID ${row.id}: ${row.nombre_completo || 'Sin nombre'} (${row.correo || 'Sin correo'})`);
    });
  }
}

async function eliminarDuplicadosPorCorreo(dryRun = true) {
  const duplicados = await encontrarDuplicadosPorCorreo();
  
  if (duplicados.length === 0) {
    return;
  }
  
  console.log('\n🔍 Analizando duplicados para decidir cuál mantener...\n');
  
  const idsAEliminar = [];
  
  for (const dup of duplicados) {
    console.log(`📧 Correo: ${dup.correo}`);
    
    // Estrategia: mantener el registro con clerk_user_id, eliminar los demás
    const conClerkId = dup.ids.filter((id, idx) => dup.clerk_ids[idx]);
    const sinClerkId = dup.ids.filter((id, idx) => !dup.clerk_ids[idx]);
    
    if (conClerkId.length === 1 && sinClerkId.length > 0) {
      // Caso ideal: 1 con clerk_id, varios sin clerk_id
      console.log(`   ✅ Mantener: ID ${conClerkId[0]} (tiene Clerk User ID)`);
      console.log(`   ❌ Eliminar: IDs ${sinClerkId.join(', ')} (sin Clerk User ID)`);
      idsAEliminar.push(...sinClerkId);
    } else if (conClerkId.length > 1) {
      // Problema: múltiples registros con clerk_id
      console.log(`   ⚠️  PROBLEMA: Múltiples registros con Clerk ID`);
      console.log(`   IDs con Clerk: ${conClerkId.join(', ')}`);
      console.log(`   ⚠️  ACCIÓN MANUAL REQUERIDA: Revisar y consolidar manualmente`);
    } else if (conClerkId.length === 0) {
      // Todos sin clerk_id - mantener el más reciente
      const masReciente = dup.ids[dup.ids.length - 1];
      const otrosIds = dup.ids.slice(0, -1);
      console.log(`   ✅ Mantener: ID ${masReciente} (más reciente, todos sin Clerk ID)`);
      console.log(`   ❌ Eliminar: IDs ${otrosIds.join(', ')}`);
      idsAEliminar.push(...otrosIds);
    } else {
      // Caso único con clerk_id
      console.log(`   ✅ Solo hay un registro con Clerk ID, no se elimina nada`);
    }
    
    console.log('');
  }
  
  if (idsAEliminar.length === 0) {
    console.log('✅ No hay registros duplicados que se puedan eliminar automáticamente');
    return;
  }
  
  if (dryRun) {
    console.log('\n🔔 MODO PRUEBA (DRY RUN)');
    console.log(`Se eliminarían ${idsAEliminar.length} registros duplicados con IDs: ${idsAEliminar.join(', ')}`);
    console.log('\nPara ejecutar la eliminación real, ejecuta:');
    console.log('node scripts/limpiar-usuarios-duplicados.js --eliminar-duplicados');
  } else {
    console.log('\n⚠️  ELIMINANDO registros duplicados...');
    
    const query = `
      DELETE FROM investigadores
      WHERE id = ANY($1::int[])
      RETURNING id, nombre_completo, correo, clerk_user_id
    `;
    
    const result = await client.query(query, [idsAEliminar]);
    
    console.log(`\n✅ Eliminados ${result.rows.length} registros duplicados:`);
    result.rows.forEach(row => {
      console.log(`   - ID ${row.id}: ${row.nombre_completo || 'Sin nombre'} (${row.correo}) [Clerk: ${row.clerk_user_id || 'NULL'}]`);
    });
  }
}

async function mostrarEstadisticas() {
  console.log('\n📊 ESTADÍSTICAS DE LA BASE DE DATOS\n');
  
  // Total de usuarios
  const totalResult = await client.query('SELECT COUNT(*) as total FROM investigadores');
  console.log(`Total de usuarios: ${totalResult.rows[0].total}`);
  
  // Usuarios con Clerk ID
  const conClerkResult = await client.query(
    'SELECT COUNT(*) as total FROM investigadores WHERE clerk_user_id IS NOT NULL AND clerk_user_id != \'\''
  );
  console.log(`Usuarios con Clerk ID: ${conClerkResult.rows[0].total}`);
  
  // Usuarios sin Clerk ID
  const sinClerkResult = await client.query(
    'SELECT COUNT(*) as total FROM investigadores WHERE clerk_user_id IS NULL OR clerk_user_id = \'\''
  );
  console.log(`Usuarios sin Clerk ID (incompletos): ${sinClerkResult.rows[0].total}`);
  
  // Correos duplicados
  const duplicadosResult = await client.query(`
    SELECT COUNT(*) as total
    FROM (
      SELECT correo
      FROM investigadores
      WHERE correo IS NOT NULL AND correo != ''
      GROUP BY correo
      HAVING COUNT(*) > 1
    ) as dup
  `);
  console.log(`Correos duplicados: ${duplicadosResult.rows[0].total}`);
  
  // Usuarios por origen
  const origenResult = await client.query(`
    SELECT origen, COUNT(*) as total
    FROM investigadores
    GROUP BY origen
    ORDER BY total DESC
  `);
  console.log('\nUsuarios por origen:');
  origenResult.rows.forEach(row => {
    console.log(`   ${row.origen || 'NULL'}: ${row.total}`);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const eliminarIncompletos = args.includes('--eliminar-incompletos');
  const eliminarDuplicados = args.includes('--eliminar-duplicados');
  const eliminarTodo = args.includes('--eliminar-todo');
  
  await conectar();
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  LIMPIEZA DE USUARIOS DUPLICADOS E INCOMPLETOS          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  await mostrarEstadisticas();
  
  // Encontrar y mostrar problemas
  await encontrarDuplicadosPorCorreo();
  await encontrarUsuariosIncompletos();
  
  // Ejecutar limpieza si se especificó
  if (eliminarTodo || eliminarIncompletos) {
    await eliminarUsuariosIncompletos(!eliminarIncompletos && !eliminarTodo);
  }
  
  if (eliminarTodo || eliminarDuplicados) {
    await eliminarDuplicadosPorCorreo(!eliminarDuplicados && !eliminarTodo);
  }
  
  // Mostrar estadísticas finales si se eliminó algo
  if (eliminarIncompletos || eliminarDuplicados || eliminarTodo) {
    console.log('\n' + '='.repeat(60));
    await mostrarEstadisticas();
  }
  
  if (!eliminarIncompletos && !eliminarDuplicados && !eliminarTodo) {
    console.log('\n💡 INSTRUCCIONES:');
    console.log('   Este script se ejecutó en modo PRUEBA (dry run)');
    console.log('   Para ejecutar las acciones de limpieza, usa:');
    console.log('');
    console.log('   - Eliminar usuarios incompletos:');
    console.log('     node scripts/limpiar-usuarios-duplicados.js --eliminar-incompletos');
    console.log('');
    console.log('   - Eliminar duplicados por correo:');
    console.log('     node scripts/limpiar-usuarios-duplicados.js --eliminar-duplicados');
    console.log('');
    console.log('   - Eliminar ambos:');
    console.log('     node scripts/limpiar-usuarios-duplicados.js --eliminar-todo');
    console.log('');
    console.log('   ⚠️  IMPORTANTE: Hacer backup de la BD antes de ejecutar');
  }
  
  await client.end();
  console.log('\n✅ Desconectado de la base de datos');
}

// Ejecutar script
main().catch(error => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
