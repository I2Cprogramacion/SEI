/**
 * Script para verificar y arreglar la columna ultima_actividad
 * Ejecutar: node scripts/fix-ultima-actividad.js
 */

import 'dotenv/config'
import { sql } from '@vercel/postgres'

async function fixUltimaActividad() {
  try {
    console.log('🔍 Verificando columna ultima_actividad...\n')

    // 1. Verificar si existe la columna
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigadores' 
        AND column_name = 'ultima_actividad'
    `

    if (checkColumn.rows.length === 0) {
      console.log('❌ Columna ultima_actividad NO existe')
      console.log('✅ Creando columna...')

      await sql`
        ALTER TABLE investigadores 
        ADD COLUMN ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `

      console.log('✅ Columna creada exitosamente\n')
    } else {
      console.log('✅ Columna ultima_actividad ya existe\n')
    }

    // 2. Crear índice si no existe
    console.log('🔍 Verificando índice...')
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ultima_actividad 
      ON investigadores(ultima_actividad)
    `

    console.log('✅ Índice verificado/creado\n')

    // 3. Actualizar registros NULL
    console.log('🔄 Actualizando registros con ultima_actividad NULL...')

    const updateResult = await sql`
      UPDATE investigadores 
      SET ultima_actividad = CURRENT_TIMESTAMP 
      WHERE ultima_actividad IS NULL
    `

    console.log(`✅ ${updateResult.rowCount} registros actualizados\n`)

    // 4. Mostrar estadísticas
    console.log('📊 Estadísticas:')
    
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(ultima_actividad) as con_actividad,
        COUNT(*) - COUNT(ultima_actividad) as sin_actividad
      FROM investigadores
    `

    const { total, con_actividad, sin_actividad } = stats.rows[0]
    
    console.log(`   Total investigadores: ${total}`)
    console.log(`   Con actividad: ${con_actividad}`)
    console.log(`   Sin actividad: ${sin_actividad}`)

    // 5. Mostrar usuarios recientes
    console.log('\n📋 Últimos 5 usuarios con actividad:')
    
    const recientes = await sql`
      SELECT 
        nombre_completo,
        correo,
        ultima_actividad,
        CASE 
          WHEN ultima_actividad >= NOW() - INTERVAL '1 minute' THEN '🟢 Activo ahora'
          WHEN ultima_actividad >= NOW() - INTERVAL '10 minutes' THEN '🟡 Activo hace poco'
          ELSE '⚪ Inactivo'
        END as estado
      FROM investigadores
      WHERE ultima_actividad IS NOT NULL
      ORDER BY ultima_actividad DESC
      LIMIT 5
    `

    recientes.rows.forEach((user, index) => {
      console.log(`\n   ${index + 1}. ${user.nombre_completo}`)
      console.log(`      Email: ${user.correo}`)
      console.log(`      Última actividad: ${new Date(user.ultima_actividad).toLocaleString()}`)
      console.log(`      Estado: ${user.estado}`)
    })

    console.log('\n\n✅ ¡Todo listo! La columna ultima_actividad está configurada correctamente.')
    console.log('   Reinicia el servidor con: npm run dev\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\n💡 Posibles causas:')
    console.error('   - Variables de entorno no configuradas (.env.local)')
    console.error('   - Conexión a Neon fallando')
    console.error('   - Permisos insuficientes en la BD')
    process.exit(1)
  }
}

// Ejecutar
fixUltimaActividad()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
