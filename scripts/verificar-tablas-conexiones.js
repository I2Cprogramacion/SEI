/**
 * Script para verificar la estructura de las tablas
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function verificarTablas() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Verificando estructura de tablas...\n')

    // Verificar tabla conexiones
    try {
      const conexionesInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'conexiones'
        ORDER BY ordinal_position
      `)
      
      if (conexionesInfo.rows.length > 0) {
        console.log('📋 Tabla CONEXIONES existe con columnas:')
        conexionesInfo.rows.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`)
        })
      } else {
        console.log('⚠️  Tabla CONEXIONES no existe')
      }
    } catch (e) {
      console.log('⚠️  Tabla CONEXIONES no existe')
    }

    console.log()

    // Verificar tabla mensajes
    try {
      const mensajesInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'mensajes'
        ORDER BY ordinal_position
      `)
      
      if (mensajesInfo.rows.length > 0) {
        console.log('📋 Tabla MENSAJES existe con columnas:')
        mensajesInfo.rows.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`)
        })
      } else {
        console.log('⚠️  Tabla MENSAJES no existe')
      }
    } catch (e) {
      console.log('⚠️  Tabla MENSAJES no existe')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

verificarTablas()
