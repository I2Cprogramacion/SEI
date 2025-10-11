require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testReadDatabase() {
  try {
    log('\n🔌 Conectando a Neon PostgreSQL...', 'cyan');
    
    // Test de conexión
    const testQuery = await pool.query('SELECT NOW() as hora_servidor');
    log(`✅ Conexión exitosa`, 'green');
    log(`   Hora del servidor: ${testQuery.rows[0].hora_servidor}`, 'cyan');
    
    log('\n' + '='.repeat(70), 'magenta');
    log('📊 ESTADÍSTICAS DE LA BASE DE DATOS', 'magenta');
    log('='.repeat(70), 'magenta');
    
    // 1. Investigadores
    log('\n👥 INVESTIGADORES:', 'blue');
    const countInv = await pool.query('SELECT COUNT(*) as total FROM investigadores');
    log(`   Total registrados: ${countInv.rows[0].total}`, 'cyan');
    
    const investigadores = await pool.query(`
      SELECT id, nombre_completo, correo, institucion, area_investigacion 
      FROM investigadores 
      ORDER BY id
    `);
    
    investigadores.rows.forEach((inv, idx) => {
      console.log(`\n   ${idx + 1}. ${inv.nombre_completo}`);
      console.log(`      📧 Email: ${inv.correo}`);
      console.log(`      🏛️  Institución: ${inv.institucion || 'No especificada'}`);
      console.log(`      🔬 Área: ${inv.area_investigacion || 'No especificada'}`);
    });
    
    // 2. Publicaciones
    log('\n\n📚 PUBLICACIONES:', 'blue');
    const countPub = await pool.query('SELECT COUNT(*) as total FROM publicaciones');
    log(`   Total registradas: ${countPub.rows[0].total}`, 'cyan');
    
    if (parseInt(countPub.rows[0].total) > 0) {
      // Obtener estructura de la tabla para saber qué columnas usar
      const columnsQuery = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'publicaciones'
        ORDER BY ordinal_position
      `);
      
      const columns = columnsQuery.rows.map(r => r.column_name);
      log(`\n   📋 Columnas disponibles:`, 'yellow');
      columns.forEach(col => log(`      • ${col}`, 'cyan'));
      
      // Consultar publicaciones usando solo columnas que sabemos que existen
      const publicaciones = await pool.query(`
        SELECT * FROM publicaciones LIMIT 5
      `);
      
      log(`\n   📖 Primeras ${publicaciones.rows.length} publicaciones:`, 'yellow');
      publicaciones.rows.forEach((pub, idx) => {
        console.log(`\n   ${idx + 1}. ID: ${pub.id}`);
        Object.keys(pub).forEach(key => {
          if (pub[key] && key !== 'id') {
            console.log(`      ${key}: ${pub[key]}`);
          }
        });
      });
    }
    
    // 3. Proyectos
    log('\n\n🔬 PROYECTOS:', 'blue');
    const countProy = await pool.query('SELECT COUNT(*) as total FROM proyectos');
    log(`   Total registrados: ${countProy.rows[0].total}`, 'cyan');
    
    if (parseInt(countProy.rows[0].total) > 0) {
      const proyectos = await pool.query(`
        SELECT * FROM proyectos LIMIT 5
      `);
      
      log(`\n   📋 Primeros ${proyectos.rows.length} proyectos:`, 'yellow');
      proyectos.rows.forEach((proy, idx) => {
        console.log(`\n   ${idx + 1}. ID: ${proy.id}`);
        Object.keys(proy).forEach(key => {
          if (proy[key] && key !== 'id') {
            console.log(`      ${key}: ${proy[key]}`);
          }
        });
      });
    }
    
    // 4. Conexiones (red social)
    log('\n\n🤝 CONEXIONES:', 'blue');
    const countCon = await pool.query('SELECT COUNT(*) as total FROM conexiones');
    log(`   Total conexiones: ${countCon.rows[0].total}`, 'cyan');
    
    // 5. Mensajes
    log('\n\n💬 MENSAJES:', 'blue');
    const countMsg = await pool.query('SELECT COUNT(*) as total FROM mensajes');
    log(`   Total mensajes: ${countMsg.rows[0].total}`, 'cyan');
    
    // 6. Notificaciones
    log('\n\n🔔 NOTIFICACIONES:', 'blue');
    const countNot = await pool.query('SELECT COUNT(*) as total FROM notificaciones');
    log(`   Total notificaciones: ${countNot.rows[0].total}`, 'cyan');
    
    // Resumen final
    log('\n' + '='.repeat(70), 'magenta');
    log('✅ RESUMEN - LA APLICACIÓN PUEDE:', 'green');
    log('='.repeat(70), 'magenta');
    log('   ✓ Conectarse a la base de datos Neon', 'green');
    log('   ✓ Leer datos de investigadores', 'green');
    log('   ✓ Leer datos de publicaciones', 'green');
    log('   ✓ Leer datos de proyectos', 'green');
    log('   ✓ Leer datos de conexiones sociales', 'green');
    log('   ✓ Leer datos de mensajes y notificaciones', 'green');
    
    log('\n📝 Nota: Solo se probó la LECTURA de datos.', 'yellow');
    log('   Para INSERTAR datos, usa la consola de Neon directamente.', 'yellow');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await pool.end();
    log('\n🔌 Conexión cerrada.\n', 'cyan');
  }
}

testReadDatabase();
