/**
 * Script to create the `publicaciones` table using DATABASE_URL env var.
 * Usage (local):
 *   copy .env.local.example -> .env.local and set DATABASE_URL
 *   node scripts/create-publicaciones-table.js
 */
require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const { Client } = require('pg')

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not set in environment (.env.local).')
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  try {
    await client.connect()
    const sql = fs.readFileSync('scripts/create-publicaciones-table.sql', 'utf8')
    console.log('Running SQL to create publicaciones table...')
    await client.query(sql)
    console.log('✅ Table `publicaciones` created or already exists.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Failed to create publicaciones table:')
    console.error(err)
    process.exit(2)
  } finally {
    try { await client.end() } catch (_) {}
  }
}

main()
