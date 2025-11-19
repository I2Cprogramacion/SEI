/**
 * Script to fix conexiones table schema
 * Drops old table and recreates with investigador IDs instead of clerk_user_id
 */
require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const { Client } = require('pg')

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env.local')
    process.exit(1)
  }

  const client = new Client({ 
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    console.log('✅ Connected to database')
    
    const sql = fs.readFileSync('scripts/fix-conexiones-table.sql', 'utf8')
    console.log('🔄 Executing SQL to fix conexiones table...')
    
    await client.query(sql)
    
    console.log('✅ Tabla conexiones actualizada correctamente')
    console.log('')
    console.log('Cambios realizados:')
    console.log('  - ID: SERIAL → TEXT (cuid)')
    console.log('  - investigador_origen_id → investigador_id')
    console.log('  - Agregado: conectado_con_id')
    console.log('  - investigador_destino_id (mantenido)')
    console.log('  - fecha_solicitud → created_at')
    console.log('  - fecha_respuesta → updated_at')
    console.log('  - Foreign keys agregadas a investigadores(id)')
    console.log('')
    
    process.exit(0)
  } catch (err) {
    console.error('❌ Failed to update conexiones table:')
    console.error(err)
    process.exit(2)
  } finally {
    try { await client.end() } catch (_) {}
  }
}

main()
