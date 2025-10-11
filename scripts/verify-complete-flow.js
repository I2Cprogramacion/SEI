require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verificarFlujoCompleto() {
  try {
    log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     🔍 VERIFICACIÓN COMPLETA DEL FLUJO DE LA APLICACIÓN     ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════════════╝\n', 'cyan');

    // ==========================================
    // 1. VERIFICAR CONEXIÓN
    // ==========================================
    log('📡 1. VERIFICANDO CONEXIÓN A BASE DE DATOS', 'blue');
    log('─'.repeat(60), 'cyan');
    
    const testConnection = await pool.query('SELECT NOW() as tiempo_servidor, current_database() as database');
    log(`   ✅ Conexión exitosa`, 'green');
    log(`   📅 Hora del servidor: ${testConnection.rows[0].tiempo_servidor}`, 'cyan');
    log(`   🗄️  Base de datos: ${testConnection.rows[0].database}`, 'cyan');
    
    // ==========================================
    // 2. VERIFICAR TABLAS NECESARIAS
    // ==========================================
    log('\n📋 2. VERIFICANDO ESTRUCTURA DE TABLAS', 'blue');
    log('─'.repeat(60), 'cyan');
    
    const tablas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tablasRequeridas = ['investigadores', 'publicaciones', 'proyectos', 'conexiones', 'mensajes', 'notificaciones'];
    const tablasExistentes = tablas.rows.map(r => r.table_name);
    
    log(`   Tablas encontradas: ${tablasExistentes.length}`, 'cyan');
    tablasRequeridas.forEach(tabla => {
      if (tablasExistentes.includes(tabla)) {
        log(`   ✅ ${tabla}`, 'green');
      } else {
        log(`   ⚠️  ${tabla} - NO EXISTE`, 'yellow');
      }
    });
    
    // ==========================================
    // 3. DATOS EN INVESTIGADORES
    // ==========================================
    log('\n👥 3. VERIFICANDO DATOS DE INVESTIGADORES', 'blue');
    log('─'.repeat(60), 'cyan');
    
    const countInv = await pool.query('SELECT COUNT(*) as total FROM investigadores');
    const totalInvestigadores = parseInt(countInv.rows[0].total);
    
    if (totalInvestigadores === 0) {
      log('   ❌ NO HAY INVESTIGADORES REGISTRADOS', 'red');
      log('   ⚠️  Las rutas API de investigadores retornarán vacío', 'yellow');
    } else {
      log(`   ✅ ${totalInvestigadores} investigadores registrados`, 'green');
      
      const investigadores = await pool.query(`
        SELECT id, nombre_completo, correo, institucion 
        FROM investigadores 
        ORDER BY id 
        LIMIT 3
      `);
      
      investigadores.rows.forEach((inv, idx) => {
        log(`   ${idx + 1}. ${inv.nombre_completo} (${inv.correo})`, 'cyan');
      });
    }
    
    // ==========================================
    // 4. DATOS EN PUBLICACIONES
    // ==========================================
    log('\n📚 4. VERIFICANDO DATOS DE PUBLICACIONES', 'blue');
    log('─'.repeat(60), 'cyan');
    
    const countPub = await pool.query('SELECT COUNT(*) as total FROM publicaciones');
    const totalPublicaciones = parseInt(countPub.rows[0].total);
    
    if (totalPublicaciones === 0) {
      log('   ⚠️  NO HAY PUBLICACIONES REGISTRADAS', 'yellow');
      log('   📝 Inserta datos con: scripts/neon-insert-publicaciones.sql', 'cyan');
      log('   🌐 API /api/publicaciones retornará array vacío', 'yellow');
    } else {
      log(`   ✅ ${totalPublicaciones} publicaciones registradas`, 'green');
      
      // Verificar estructura
      const columnas = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'publicaciones' 
        AND column_name IN ('titulo', 'autor', 'año_creacion', 'tipo', 'doi')
      `);
      
      const columnasNecesarias = ['titulo', 'autor'];
      const columnasExistentes = columnas.rows.map(c => c.column_name);
      
      columnasNecesarias.forEach(col => {
        if (columnasExistentes.includes(col)) {
          log(`   ✅ Columna '${col}' existe`, 'green');
        } else {
          log(`   ❌ Columna '${col}' NO EXISTE`, 'red');
        }
      });
      
      // Mostrar algunos registros
      const publicaciones = await pool.query(`
        SELECT titulo, tipo, año_creacion 
        FROM publicaciones 
        ORDER BY fecha_creacion DESC 
        LIMIT 3
      `);
      
      log(`\n   Últimas publicaciones:`, 'cyan');
      publicaciones.rows.forEach((pub, idx) => {
        log(`   ${idx + 1}. [${pub.tipo || 'N/A'}] ${pub.titulo} (${pub.año_creacion || 'N/A'})`, 'cyan');
      });
    }
    
    // ==========================================
    // 5. DATOS EN PROYECTOS
    // ==========================================
    log('\n🔬 5. VERIFICANDO DATOS DE PROYECTOS', 'blue');
    log('─'.repeat(60), 'cyan');
    
    const countProy = await pool.query('SELECT COUNT(*) as total FROM proyectos');
    const totalProyectos = parseInt(countProy.rows[0].total);
    
    if (totalProyectos === 0) {
      log('   ⚠️  NO HAY PROYECTOS REGISTRADOS', 'yellow');
      log('   📝 Inserta datos con: scripts/neon-insert-proyectos.sql', 'cyan');
      log('   🌐 API /api/proyectos usará datos del archivo JSON (fallback)', 'yellow');
    } else {
      log(`   ✅ ${totalProyectos} proyectos registrados`, 'green');
      
      // Verificar estructura
      const columnas = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'proyectos' 
        AND column_name IN ('titulo', 'descripcion', 'estado', 'fecha_inicio')
      `);
      
      const columnasNecesarias = ['titulo'];
      const columnasExistentes = columnas.rows.map(c => c.column_name);
      
      columnasNecesarias.forEach(col => {
        if (columnasExistentes.includes(col)) {
          log(`   ✅ Columna '${col}' existe`, 'green');
        } else {
          log(`   ❌ Columna '${col}' NO EXISTE`, 'red');
        }
      });
      
      // Mostrar algunos registros
      const proyectos = await pool.query(`
        SELECT titulo, estado, fecha_inicio 
        FROM proyectos 
        ORDER BY fecha_registro DESC 
        LIMIT 3
      `);
      
      log(`\n   Últimos proyectos:`, 'cyan');
      proyectos.rows.forEach((proy, idx) => {
        log(`   ${idx + 1}. [${proy.estado || 'N/A'}] ${proy.titulo}`, 'cyan');
      });
    }
    
    // ==========================================
    // 6. VERIFICAR RUTAS API (SIMULACIÓN)
    // ==========================================
    log('\n🌐 6. RUTAS API DISPONIBLES', 'blue');
    log('─'.repeat(60), 'cyan');
    
    const rutasAPI = [
      { ruta: '/api/investigadores', funciona: totalInvestigadores > 0, tabla: 'investigadores' },
      { ruta: '/api/investigadores/[slug]', funciona: totalInvestigadores > 0, tabla: 'investigadores' },
      { ruta: '/api/investigadores/[slug]/publicaciones', funciona: totalInvestigadores > 0 && totalPublicaciones > 0, tabla: 'publicaciones' },
      { ruta: '/api/publicaciones', funciona: true, tabla: 'publicaciones', nota: 'Retorna array vacío si no hay datos' },
      { ruta: '/api/proyectos', funciona: true, tabla: 'proyectos', nota: 'Usa JSON fallback si BD vacía' },
      { ruta: '/api/proyectos/recent', funciona: totalProyectos > 0, tabla: 'proyectos' },
      { ruta: '/api/dashboard/estadisticas', funciona: totalInvestigadores > 0, tabla: 'investigadores' },
      { ruta: '/api/search', funciona: totalInvestigadores > 0, tabla: 'investigadores, proyectos' }
    ];
    
    rutasAPI.forEach(({ ruta, funciona, tabla, nota }) => {
      const icono = funciona ? '✅' : '⚠️';
      const color = funciona ? 'green' : 'yellow';
      log(`   ${icono} ${ruta}`, color);
      if (nota) {
        log(`      ℹ️  ${nota}`, 'cyan');
      }
    });
    
    // ==========================================
    // 7. RESUMEN Y RECOMENDACIONES
    // ==========================================
    log('\n' + '═'.repeat(60), 'magenta');
    log('📊 RESUMEN FINAL', 'magenta');
    log('═'.repeat(60), 'magenta');
    
    const problemas = [];
    const advertencias = [];
    
    if (totalInvestigadores === 0) {
      problemas.push('No hay investigadores registrados');
    }
    
    if (totalPublicaciones === 0) {
      advertencias.push('No hay publicaciones - la página /publicaciones estará vacía');
    }
    
    if (totalProyectos === 0) {
      advertencias.push('No hay proyectos - se mostrarán datos del JSON de ejemplo');
    }
    
    if (problemas.length === 0) {
      log('\n✅ LA APLICACIÓN ESTÁ LISTA PARA FUNCIONAR', 'green');
      log('\nConexión a BD: ✅', 'green');
      log(`Investigadores: ✅ (${totalInvestigadores})`, 'green');
      log(`Publicaciones: ${totalPublicaciones > 0 ? '✅' : '⚠️'} (${totalPublicaciones})`, totalPublicaciones > 0 ? 'green' : 'yellow');
      log(`Proyectos: ${totalProyectos > 0 ? '✅' : '⚠️'} (${totalProyectos})`, totalProyectos > 0 ? 'green' : 'yellow');
    } else {
      log('\n⚠️  PROBLEMAS ENCONTRADOS:', 'red');
      problemas.forEach(p => log(`   • ${p}`, 'red'));
    }
    
    if (advertencias.length > 0) {
      log('\n⚠️  ADVERTENCIAS:', 'yellow');
      advertencias.forEach(a => log(`   • ${a}`, 'yellow'));
    }
    
    log('\n📝 ACCIONES RECOMENDADAS:', 'cyan');
    if (totalPublicaciones === 0) {
      log('   1. Copia scripts/neon-insert-publicaciones.sql', 'cyan');
      log('   2. Pégalo en SQL Editor de Neon Console', 'cyan');
      log('   3. Ejecuta el SQL', 'cyan');
    }
    if (totalProyectos === 0) {
      log('   1. Copia scripts/neon-insert-proyectos.sql', 'cyan');
      log('   2. Pégalo en SQL Editor de Neon Console', 'cyan');
      log('   3. Ejecuta el SQL', 'cyan');
    }
    
    log('\n🚀 PARA VERIFICAR LA APLICACIÓN:', 'green');
    log('   npm run dev', 'cyan');
    log('   http://localhost:3000/investigadores', 'cyan');
    log('   http://localhost:3000/publicaciones', 'cyan');
    log('   http://localhost:3000/proyectos', 'cyan');
    
  } catch (error) {
    log(`\n❌ ERROR CRÍTICO: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await pool.end();
    log('\n🔌 Conexión cerrada.\n', 'cyan');
  }
}

verificarFlujoCompleto();
