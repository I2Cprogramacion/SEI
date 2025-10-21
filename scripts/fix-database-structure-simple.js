/**
 * Script para corregir la estructura de la base de datos
 * - Agrega columna clerk_user_id a investigadores
 * - Crea tablas mensajes y conexiones
 */

const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env' })

async function fixDatabaseStructure() {
  // Usar la URL de la variable de entorno
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL no está configurada')
    console.log('\nPor favor ejecuta este comando con la variable de entorno:')
    console.log('$env:DATABASE_URL="tu_url"; node scripts/fix-database-structure-simple.js')
    process.exit(1)
  }

  console.log('🔄 Conectando a la base de datos...\n')
  console.log('📡 URL:', databaseUrl.replace(/:[^:@]+@/, ':***@'), '\n')

  const sql = neon(databaseUrl)

  try {
    // 1. Verificar y agregar columna clerk_user_id
    console.log('📋 Verificando columna clerk_user_id...')
    try {
      await sql`
        ALTER TABLE investigadores 
        ADD COLUMN IF NOT EXISTS clerk_user_id TEXT
      `
      console.log('✅ Columna clerk_user_id verificada/agregada')
    } catch (error) {
      if (error.code === '42701') {
        console.log('✅ Columna clerk_user_id ya existe')
      } else {
        throw error
      }
    }

    // 2. Crear tabla de conexiones
    console.log('\n📋 Creando tabla de conexiones...')
    await sql`
      CREATE TABLE IF NOT EXISTS conexiones (
        id SERIAL PRIMARY KEY,
        clerk_user_id_1 TEXT NOT NULL,
        clerk_user_id_2 TEXT NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
        mensaje TEXT,
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_aceptacion TIMESTAMP,
        CONSTRAINT unique_conexion UNIQUE(clerk_user_id_1, clerk_user_id_2)
      )
    `
    console.log('✅ Tabla conexiones creada/verificada')

    // 3. Crear tabla de mensajes
    console.log('\n📋 Creando tabla de mensajes...')
    await sql`
      CREATE TABLE IF NOT EXISTS mensajes (
        id SERIAL PRIMARY KEY,
        clerk_remitente_id TEXT NOT NULL,
        clerk_destinatario_id TEXT NOT NULL,
        asunto VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        leido BOOLEAN DEFAULT FALSE
      )
    `
    console.log('✅ Tabla mensajes creada/verificada')

    // 4. Crear índices
    console.log('\n📊 Creando índices...')
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_conexiones_user1 ON conexiones(clerk_user_id_1)`
      await sql`CREATE INDEX IF NOT EXISTS idx_conexiones_user2 ON conexiones(clerk_user_id_2)`
    } catch (e) {
      console.log('  ⚠️  Índices de conexiones ya existen')
    }
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(clerk_remitente_id)`
      await sql`CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(clerk_destinatario_id)`
    } catch (e) {
      console.log('  ⚠️  Índices de mensajes ya existen')
    }
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_investigadores_clerk ON investigadores(clerk_user_id)`
    } catch (e) {
      console.log('  ⚠️  Índice de investigadores ya existe')
    }
    
    console.log('✅ Índices verificados')

    // 5. Verificar estructura final
    console.log('\n📊 Verificando estructura final...')
    
    const investigadoresCount = await sql`SELECT COUNT(*) as count FROM investigadores`
    const conexionesCount = await sql`SELECT COUNT(*) as count FROM conexiones`
    const mensajesCount = await sql`SELECT COUNT(*) as count FROM mensajes`

    console.log('\n📊 Estado de las tablas:')
    console.log(`   Investigadores: ${investigadoresCount[0].count}`)
    console.log(`   Conexiones: ${conexionesCount[0].count}`)
    console.log(`   Mensajes: ${mensajesCount[0].count}`)

    console.log('\n✅ ¡Base de datos corregida exitosamente!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Código:', error.code)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

fixDatabaseStructure()

