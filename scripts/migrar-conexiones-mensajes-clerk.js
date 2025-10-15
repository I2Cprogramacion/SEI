/**
 * Script para migrar las tablas de conexiones y mensajes para usar Clerk IDs
 * IMPORTANTE: Esto eliminará las tablas existentes y las recreará
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function migrarTablas() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Migrando tablas a Clerk IDs...\n')

    // PASO 1: Eliminar tablas existentes
    console.log('🗑️  Eliminando tablas anteriores...')
    await pool.query('DROP TABLE IF EXISTS mensajes CASCADE')
    await pool.query('DROP TABLE IF EXISTS conexiones CASCADE')
    console.log('✅ Tablas eliminadas\n')

    // PASO 2: Crear tabla de conexiones con Clerk IDs
    console.log('📋 Creando tabla CONEXIONES con Clerk IDs...')
    await pool.query(`
      CREATE TABLE conexiones (
        id SERIAL PRIMARY KEY,
        investigador_origen_id VARCHAR(255) NOT NULL,
        investigador_destino_id VARCHAR(255) NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
        mensaje TEXT,
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_respuesta TIMESTAMP,
        UNIQUE(investigador_origen_id, investigador_destino_id)
      )
    `)
    console.log('✅ Tabla CONEXIONES creada')

    // PASO 3: Crear tabla de mensajes con Clerk IDs
    console.log('📋 Creando tabla MENSAJES con Clerk IDs...')
    await pool.query(`
      CREATE TABLE mensajes (
        id SERIAL PRIMARY KEY,
        remitente_id VARCHAR(255) NOT NULL,
        destinatario_id VARCHAR(255) NOT NULL,
        asunto VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        leido BOOLEAN DEFAULT FALSE,
        mensaje_padre_id INTEGER REFERENCES mensajes(id) ON DELETE SET NULL
      )
    `)
    console.log('✅ Tabla MENSAJES creada')

    // PASO 4: Crear índices para mejor performance
    console.log('\n📊 Creando índices...')
    
    await pool.query(`
      CREATE INDEX idx_conexiones_origen 
      ON conexiones(investigador_origen_id)
    `)
    
    await pool.query(`
      CREATE INDEX idx_conexiones_destino 
      ON conexiones(investigador_destino_id)
    `)
    
    await pool.query(`
      CREATE INDEX idx_conexiones_estado 
      ON conexiones(estado)
    `)
    
    await pool.query(`
      CREATE INDEX idx_mensajes_remitente 
      ON mensajes(remitente_id)
    `)
    
    await pool.query(`
      CREATE INDEX idx_mensajes_destinatario 
      ON mensajes(destinatario_id)
    `)
    
    await pool.query(`
      CREATE INDEX idx_mensajes_leido 
      ON mensajes(leido)
    `)
    
    console.log('✅ Índices creados')

    // PASO 5: Verificar estructura
    console.log('\n🔍 Verificando estructura de CONEXIONES:')
    const conexionesInfo = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'conexiones'
      ORDER BY ordinal_position
    `)
    conexionesInfo.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : ''
      console.log(`   - ${col.column_name}: ${col.data_type}${length}`)
    })

    console.log('\n🔍 Verificando estructura de MENSAJES:')
    const mensajesInfo = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'mensajes'
      ORDER BY ordinal_position
    `)
    mensajesInfo.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : ''
      console.log(`   - ${col.column_name}: ${col.data_type}${length}`)
    })

    console.log('\n✅ ¡Migración completada exitosamente!')
    console.log('\n📌 IMPORTANTE:')
    console.log('   - Las tablas ahora usan Clerk User IDs (VARCHAR)')
    console.log('   - Todos los datos previos se han eliminado')
    console.log('   - Las APIs ya están configuradas para usar Clerk IDs')
    console.log('   - No necesitas cambiar nada más en el código')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

migrarTablas()
