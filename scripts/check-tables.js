require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos PostgreSQL...\n');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log(`\n✅ Total: ${result.rows.length} tablas\n`);
    
    // Verificar estructura de la tabla investigadores si existe
    const hasInvestigadores = result.rows.some(r => r.table_name === 'investigadores');
    
    if (hasInvestigadores) {
      console.log('� Estructura de tabla "investigadores":');
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'investigadores'
        ORDER BY ordinal_position
      `);
      
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
      });
    }
      const columns = await getSQL(`PRAGMA table_info(${table.name})`);
      console.log('   Columnas:');
      columns.forEach(col => {
        console.log(`     - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      // Obtener conteo de registros
    
  } catch (error) {
    console.error('❌ Error al consultar tablas:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ Conexión cerrada.');
  }
}

checkTables();

