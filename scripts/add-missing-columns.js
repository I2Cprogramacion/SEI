const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function addMissingColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Agregar area_investigacion
    console.log('\n📝 Agregando columna area_investigacion...');
    await client.query(`
      ALTER TABLE investigadores 
      ADD COLUMN IF NOT EXISTS area_investigacion TEXT;
    `);
    console.log('✅ Columna area_investigacion agregada');

    // Agregar fotografia_url
    console.log('\n📝 Agregando columna fotografia_url...');
    await client.query(`
      ALTER TABLE investigadores 
      ADD COLUMN IF NOT EXISTS fotografia_url TEXT;
    `);
    console.log('✅ Columna fotografia_url agregada');

    // Verificar las columnas
    console.log('\n📋 Columnas actuales en la tabla investigadores:');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'investigadores'
      ORDER BY ordinal_position;
    `);
    
    console.table(result.rows);
    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addMissingColumns();
