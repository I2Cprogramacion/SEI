/**
 * Script para corregir la estructura de la base de datos
 * - Agrega columna clerk_user_id a investigadores
 * - Crea tablas mensajes y conexiones
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function fixDatabaseStructure() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  try {
    console.log('🔄 Conectando a la base de datos...\n')

    // 1. Agregar columna clerk_user_id si no existe
    console.log('📋 Verificando columna clerk_user_id...')
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigadores' 
      AND column_name = 'clerk_user_id'
    `)

    if (checkColumn.rows.length === 0) {
      console.log('➕ Agregando columna clerk_user_id...')
      await pool.query(`
        ALTER TABLE investigadores 
        ADD COLUMN clerk_user_id TEXT
      `)
      console.log('✅ Columna clerk_user_id agregada')
    } else {
      console.log('✅ Columna clerk_user_id ya existe')
    }

    // 2. Crear tabla de conexiones
    console.log('\n📋 Creando tabla de conexiones...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conexiones (
        id SERIAL PRIMARY KEY,
        clerk_user_id_1 TEXT NOT NULL,
        clerk_user_id_2 TEXT NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
        mensaje TEXT,
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_aceptacion TIMESTAMP,
        UNIQUE(clerk_user_id_1, clerk_user_id_2)
      )
    `)
    console.log('✅ Tabla conexiones creada/verificada')

    // 3. Crear tabla de mensajes
    console.log('\n📋 Creando tabla de mensajes...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id SERIAL PRIMARY KEY,
        clerk_remitente_id TEXT NOT NULL,
        clerk_destinatario_id TEXT NOT NULL,
        asunto VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        leido BOOLEAN DEFAULT FALSE
      )
    `)
    console.log('✅ Tabla mensajes creada/verificada')

    // 4. Crear índices para mejor performance
    console.log('\n📊 Creando índices...')
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conexiones_user1 
      ON conexiones(clerk_user_id_1)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conexiones_user2 
      ON conexiones(clerk_user_id_2)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_mensajes_remitente 
      ON mensajes(clerk_remitente_id)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario 
      ON mensajes(clerk_destinatario_id)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_investigadores_clerk 
      ON investigadores(clerk_user_id)
    `)
    
    console.log('✅ Índices creados')

    // 5. Verificar estructura final
    console.log('\n📊 Verificando estructura final...')
    
    const tablas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('investigadores', 'mensajes', 'conexiones')
      ORDER BY table_name
    `)

    console.log('\n✅ Tablas verificadas:')
    tablas.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`)
    })

    // Verificar conteos
    const investigadoresCount = await pool.query('SELECT COUNT(*) FROM investigadores')
    const conexionesCount = await pool.query('SELECT COUNT(*) FROM conexiones')
    const mensajesCount = await pool.query('SELECT COUNT(*) FROM mensajes')

    console.log('\n📊 Estado de las tablas:')
    console.log(`   Investigadores: ${investigadoresCount.rows[0].count}`)
    console.log(`   Conexiones: ${conexionesCount.rows[0].count}`)
    console.log(`   Mensajes: ${mensajesCount.rows[0].count}`)

    console.log('\n✅ ¡Base de datos corregida exitosamente!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await pool.end()
  }
}

fixDatabaseStructure()


