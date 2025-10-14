/**
 * Script para agregar columna de última actividad a la tabla investigadores
 * Ejecutar con: node scripts/add-ultima-actividad.js
 */

require('dotenv').config({ path: '.env.local' })
const { sql } = require('@vercel/postgres')

async function addUltimaActividadColumn() {
  try {
    console.log('🔄 Conectando a la base de datos...')
    
    // Verificar si la columna ya existe
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigadores' AND column_name = 'ultima_actividad'
    `

    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna ultima_actividad ya existe')
    } else {
      console.log('📋 Creando columna ultima_actividad...')
      await sql`
        ALTER TABLE investigadores 
        ADD COLUMN ultima_actividad TIMESTAMP DEFAULT NOW()
      `
      console.log('✅ Columna ultima_actividad creada exitosamente')
    }

    // Inicializar con la fecha actual para todos los usuarios existentes
    console.log('🔄 Inicializando última actividad para usuarios existentes...')
    await sql`
      UPDATE investigadores 
      SET ultima_actividad = NOW() 
      WHERE ultima_actividad IS NULL
    `
    console.log('✅ Última actividad inicializada')

    // Verificar algunos registros
    const sample = await sql`
      SELECT id, nombre_completo, correo, ultima_actividad 
      FROM investigadores 
      LIMIT 5
    `

    console.log('\n📊 Muestra de registros:')
    sample.rows.forEach(row => {
      console.log(`   - ${row.nombre_completo}: ${row.ultima_actividad}`)
    })

    console.log('\n🎉 ¡Configuración completada exitosamente!')
    console.log('💡 Ahora el sistema puede rastrear usuarios activos')

  } catch (error) {
    console.error('❌ Error:', error.message || error)
    if (error.code) {
      console.error(`   Código de error: ${error.code}`)
    }
    process.exit(1)
  }
}

addUltimaActividadColumn()
