/**
 * Script para verificar la columna ultima_actividad en investigadores
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function checkActividadColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Verificando columna ultima_actividad...\n')
    
    // Verificar si existe la columna
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'investigadores' 
      AND column_name = 'ultima_actividad'
    `)
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ La columna ultima_actividad NO existe')
      console.log('➕ Agregando columna...')
      
      await pool.query(`
        ALTER TABLE investigadores 
        ADD COLUMN ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `)
      
      console.log('✅ Columna agregada exitosamente')
    } else {
      console.log('✅ La columna ultima_actividad existe:')
      console.log(`   Tipo: ${columnCheck.rows[0].data_type}`)
      console.log(`   Nullable: ${columnCheck.rows[0].is_nullable}`)
      console.log(`   Default: ${columnCheck.rows[0].column_default || 'ninguno'}`)
    }

    // Verificar cuántos usuarios tienen actividad registrada
    const activityCount = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(ultima_actividad) as con_actividad,
        COUNT(*) - COUNT(ultima_actividad) as sin_actividad
      FROM investigadores
    `)

    console.log('\n📊 Estadísticas de actividad:')
    console.log(`   Total usuarios: ${activityCount.rows[0].total}`)
    console.log(`   Con actividad: ${activityCount.rows[0].con_actividad}`)
    console.log(`   Sin actividad: ${activityCount.rows[0].sin_actividad}`)

    // Mostrar últimas actividades
    const recentActivity = await pool.query(`
      SELECT 
        nombre_completo,
        correo,
        ultima_actividad,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ultima_actividad)) / 60 as minutos_desde_actividad
      FROM investigadores
      WHERE ultima_actividad IS NOT NULL
      ORDER BY ultima_actividad DESC
      LIMIT 5
    `)

    if (recentActivity.rows.length > 0) {
      console.log('\n🕐 Últimas actividades:')
      recentActivity.rows.forEach(row => {
        const minutos = Math.round(row.minutos_desde_actividad || 0)
        console.log(`   ${row.nombre_completo} (${row.correo})`)
        console.log(`      Hace ${minutos} minutos - ${row.ultima_actividad}`)
      })
    } else {
      console.log('\n⚠️  No hay actividades registradas aún')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkActividadColumn()
