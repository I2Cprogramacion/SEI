require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getTableStructure() {
  try {
    console.log('📋 Estructura de la tabla PUBLICACIONES:\n');
    
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'publicaciones'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas disponibles:');
    console.log('='.repeat(80));
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'OPCIONAL' : 'REQUERIDO';
      const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
      console.log(`• ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });
    
    console.log('\n📝 SQL de ejemplo basado en la estructura real:\n');
    console.log('INSERT INTO publicaciones (');
    const columnNames = columns.rows
      .filter(col => !col.column_default || !col.column_default.includes('nextval'))
      .map(col => `  ${col.column_name}`)
      .join(',\n');
    console.log(columnNames);
    console.log(') VALUES (');
    console.log("  'Valor 1',");
    console.log("  'Valor 2',");
    console.log("  ...");
    console.log(');');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

getTableStructure();
