/**
 * Script para actualizar la actividad de todos los usuarios (para pruebas)
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function actualizarActividadTodos() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Actualizando actividad de todos los usuarios...\n')
    
    // Actualizar todos los usuarios para que aparezcan como activos
    const result = await pool.query(`
      UPDATE investigadores 
      SET ultima_actividad = CURRENT_TIMESTAMP
      RETURNING nombre_completo, correo, ultima_actividad
    `)

    console.log(`✅ Se actualizaron ${result.rowCount} usuarios:\n`)
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.nombre_completo} (${row.correo})`)
      console.log(`     Actividad: ${row.ultima_actividad}\n`)
    })

    // Verificar usuarios activos en el último minuto
    const activos = await pool.query(`
      SELECT COUNT(*) as total
      FROM investigadores
      WHERE ultima_actividad >= NOW() - INTERVAL '1 minute'
    `)

    console.log(`📊 Usuarios activos en el último minuto: ${activos.rows[0].total}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

actualizarActividadTodos()
