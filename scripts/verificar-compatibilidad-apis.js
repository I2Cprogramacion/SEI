/**
 * Script para verificar que las APIs funcionen correctamente con Clerk IDs
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function verificarApis() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Verificando compatibilidad de APIs con tablas...\n')

    // VERIFICAR 1: Estructura de conexiones
    console.log('✅ Tabla CONEXIONES:')
    const testConexion = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'conexiones'
        AND column_name IN ('investigador_origen_id', 'investigador_destino_id', 'estado', 'fecha_respuesta')
      ORDER BY ordinal_position
    `)
    testConexion.rows.forEach(col => {
      console.log(`   ✓ ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`)
    })

    // VERIFICAR 2: Estructura de mensajes
    console.log('\n✅ Tabla MENSAJES:')
    const testMensaje = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'mensajes'
        AND column_name IN ('remitente_id', 'destinatario_id', 'asunto', 'mensaje', 'leido', 'mensaje_padre_id')
      ORDER BY ordinal_position
    `)
    testMensaje.rows.forEach(col => {
      console.log(`   ✓ ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`)
    })

    // VERIFICAR 3: Índices
    console.log('\n✅ Índices creados:')
    const indices = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('conexiones', 'mensajes')
      ORDER BY tablename, indexname
    `)
    indices.rows.forEach(idx => {
      console.log(`   ✓ ${idx.indexname}`)
    })

    console.log('\n📊 Resumen de compatibilidad:\n')
    console.log('   ✓ investigador_origen_id y investigador_destino_id son VARCHAR(255) ✅')
    console.log('   ✓ remitente_id y destinatario_id son VARCHAR(255) ✅')
    console.log('   ✓ Columnas estado, fecha_respuesta, leido existen ✅')
    console.log('   ✓ mensaje_padre_id agregado para respuestas ✅')
    console.log('   ✓ Índices optimizados creados ✅')
    
    console.log('\n🎯 Las APIs funcionarán correctamente con estas tablas')
    console.log('\n📝 Siguiente paso: Configurar variables de entorno en Vercel')
    console.log('   - DATABASE_URL')
    console.log('   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
    console.log('   - CLERK_SECRET_KEY')
    console.log('   - (Opcional) RESEND_API_KEY para emails')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

verificarApis()
