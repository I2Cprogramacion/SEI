/**
 * Script para crear la tabla de publicaciones
 */

const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env' })

async function crearTablaPublicaciones() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL no está configurada')
    process.exit(1)
  }

  console.log('🔄 Conectando a la base de datos...\n')

  const sql = neon(databaseUrl)

  try {
    console.log('📋 Creando tabla de publicaciones...')
    await sql`
      CREATE TABLE IF NOT EXISTS publicaciones (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(500) NOT NULL,
        autor TEXT NOT NULL,
        institucion VARCHAR(255),
        editorial VARCHAR(255),
        año_creacion INTEGER,
        doi VARCHAR(100),
        resumen TEXT,
        palabras_clave TEXT,
        categoria VARCHAR(100),
        tipo VARCHAR(100),
        acceso VARCHAR(50),
        volumen VARCHAR(50),
        numero VARCHAR(50),
        paginas VARCHAR(50),
        archivo_url TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Tabla publicaciones creada/verificada')

    // Crear índices
    console.log('\n📊 Creando índices...')
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_publicaciones_autor ON publicaciones(autor)`
      await sql`CREATE INDEX IF NOT EXISTS idx_publicaciones_año ON publicaciones(año_creacion)`
      console.log('✅ Índices creados')
    } catch (e) {
      console.log('⚠️  Índices ya existen')
    }

    // Verificar conteo
    const count = await sql`SELECT COUNT(*) as count FROM publicaciones`
    console.log(`\n📊 Total de publicaciones: ${count[0].count}`)

    console.log('\n✅ ¡Tabla de publicaciones lista!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Código:', error.code)
    process.exit(1)
  }
}

crearTablaPublicaciones()


