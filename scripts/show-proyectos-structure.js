require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getProyectosStructure() {
  try {
    console.log('📋 Estructura de la tabla PROYECTOS:\n');
    
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'proyectos'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas disponibles:');
    console.log('='.repeat(80));
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'OPCIONAL' : 'REQUERIDO';
      const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
      console.log(`• ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

getProyectosStructure();
