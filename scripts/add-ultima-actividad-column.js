/**
 * Script para agregar la columna ultima_actividad a la tabla investigadores
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function addLastActiveColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Conectando a la base de datos...')
    
    // Verificar estructura actual
    const checkColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'investigadores'
      ORDER BY ordinal_position;
    `)
    console.log('📋 Columnas actuales en investigadores:')
    checkColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`)
    })

    // Agregar columna si no existe
    await pool.query(`
      ALTER TABLE investigadores 
      ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `)
    console.log('\n✅ Columna ultima_actividad agregada exitosamente')

    // Actualizar valores existentes
    await pool.query(`
      UPDATE investigadores 
      SET ultima_actividad = fecha_registro 
      WHERE ultima_actividad IS NULL;
    `)
    console.log('✅ Valores existentes actualizados')

    // Crear índice para mejor rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_investigadores_ultima_actividad 
      ON investigadores(ultima_actividad DESC);
    `)
    console.log('✅ Índice creado para mejor rendimiento')

    console.log('\n✅ Migración completada exitosamente')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

addLastActiveColumn()
