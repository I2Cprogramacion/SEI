/**
 * Script para agregar columnas faltantes a la tabla publicaciones
 * Ejecutar: node scripts/add-publicaciones-columns.js
 */

const fs = require('fs')
const path = require('path')

async function main() {
  console.log('🔧 Agregando columnas faltantes a tabla publicaciones...\n')

  // Leer la URL de la base de datos
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ No se encontró el archivo .env.local')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/)
  
  if (!dbUrlMatch) {
    console.error('❌ No se encontró DATABASE_URL en .env.local')
    process.exit(1)
  }

  const DATABASE_URL = dbUrlMatch[1]

  // Importar el cliente de PostgreSQL
  const { Client } = require('pg')
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()
    console.log('✅ Conectado a la base de datos')

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-publicaciones-columns.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Ejecutar el SQL
    console.log('\n📝 Ejecutando migraciones...')
    await client.query(sql)

    console.log('✅ Columnas agregadas exitosamente\n')

    // Verificar las columnas
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length, column_default
      FROM information_schema.columns
      WHERE table_name = 'publicaciones'
      ORDER BY ordinal_position
    `)

    console.log('📊 Estructura actual de la tabla publicaciones:')
    console.log('─'.repeat(80))
    result.rows.forEach(row => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : ''
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : ''
      console.log(`  ${row.column_name.padEnd(25)} ${row.data_type}${length}${defaultVal}`)
    })
    console.log('─'.repeat(80))

    // Contar registros
    const countResult = await client.query('SELECT COUNT(*) as total FROM publicaciones')
    console.log(`\n📈 Total de publicaciones en la tabla: ${countResult.rows[0].total}`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n✅ Conexión cerrada')
  }
}

main()
