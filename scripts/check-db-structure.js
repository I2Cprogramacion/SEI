/**
 * Script para verificar las tablas en la base de datos
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function checkTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Conectando a la base de datos...')
    
    // Listar todas las tablas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)
    
    console.log('📋 Tablas en la base de datos:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })

    // Verificar columnas de la tabla users (o el nombre correcto)
    const usersTable = result.rows.find(r => r.table_name.toLowerCase().includes('user'))
    if (usersTable) {
      console.log(`\n📋 Columnas de la tabla ${usersTable.table_name}:`)
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = '${usersTable.table_name}'
        ORDER BY ordinal_position;
      `)
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkTables()
