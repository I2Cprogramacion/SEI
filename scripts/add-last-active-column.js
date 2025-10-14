/**
 * Script para agregar la columna lastActive a la tabla users
 * Ejecutar con: node scripts/add-last-active-column.js
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function addLastActiveColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Conectando a la base de datos...')
    
    // Agregar columna si no existe
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
    `)
    console.log('✅ Columna lastActive agregada exitosamente')

    // Actualizar valores existentes
    await pool.query(`
      UPDATE users 
      SET "lastActive" = "createdAt" 
      WHERE "lastActive" IS NULL;
    `)
    console.log('✅ Valores existentes actualizados')

    // Verificar
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'lastActive';
    `)
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación exitosa:', result.rows[0])
    }

    console.log('✅ Migración completada exitosamente')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

addLastActiveColumn()
