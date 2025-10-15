/**
 * Script para crear las tablas de conexiones y mensajes
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function crearTablas() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Verificando y creando tablas...\n')

    // Tabla de conexiones
    console.log('📋 Creando tabla de conexiones...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conexiones (
        id SERIAL PRIMARY KEY,
        investigador_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
        conectado_con_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
        mensaje TEXT,
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_aceptacion TIMESTAMP,
        UNIQUE(investigador_id, conectado_con_id)
      )
    `)
    console.log('✅ Tabla conexiones creada/verificada')

    // Tabla de mensajes
    console.log('📋 Creando tabla de mensajes...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id SERIAL PRIMARY KEY,
        remitente_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
        destinatario_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
        asunto VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        leido BOOLEAN DEFAULT FALSE
      )
    `)
    console.log('✅ Tabla mensajes creada/verificada')

    // Crear índices para mejor performance
    console.log('\n📊 Creando índices...')
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conexiones_investigador 
      ON conexiones(investigador_id)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conexiones_conectado 
      ON conexiones(conectado_con_id)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_mensajes_remitente 
      ON mensajes(remitente_id)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario 
      ON mensajes(destinatario_id)
    `)
    
    console.log('✅ Índices creados')

    // Verificar conteo
    const conexionesCount = await pool.query('SELECT COUNT(*) FROM conexiones')
    const mensajesCount = await pool.query('SELECT COUNT(*) FROM mensajes')

    console.log('\n📊 Estado de las tablas:')
    console.log(`   Conexiones: ${conexionesCount.rows[0].count}`)
    console.log(`   Mensajes: ${mensajesCount.rows[0].count}`)

    console.log('\n✅ ¡Tablas creadas exitosamente!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

crearTablas()
