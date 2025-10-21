/**
 * Script para verificar el schema de la tabla investigadores
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkSchema() {
  try {
    console.log('\n📋 Verificando esquema de tabla investigadores...\n')
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'investigadores'
      ORDER BY ordinal_position
    `)
    
    console.log('Columnas encontradas:\n')
    result.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name}`)
      console.log(`   Tipo: ${col.data_type}`)
      console.log(`   Nulo: ${col.is_nullable}`)
      console.log(`   Default: ${col.column_default || 'N/A'}`)
      console.log('')
    })
    
    console.log(`Total: ${result.rows.length} columnas\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkSchema()
