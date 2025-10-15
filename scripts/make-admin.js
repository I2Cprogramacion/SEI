/**
 * Script para hacer un usuario administrador
 * Ejecutar con: node scripts/make-admin.js drksh2015@gmail.com
 * 
 * IMPORTANTE: Este script usa la misma conexión que las APIs (@vercel/postgres)
 */

require('dotenv').config({ path: '.env.local' })

// Usar @vercel/postgres como las APIs
const { sql } = require('@vercel/postgres')

async function makeAdmin() {
  const email = process.argv[2] || 'drksh2015@gmail.com'
  
  try {
    console.log('🔄 Conectando a la base de datos (pooler)...')
    console.log(`📧 Email a marcar como admin: ${email}`)
    
    // Verificar si el usuario existe
    const checkUser = await sql`
      SELECT id, nombre_completo, correo 
      FROM investigadores 
      WHERE correo = ${email}
    `

    if (checkUser.rows.length === 0) {
      console.log('❌ Usuario no encontrado con ese email')
      console.log('💡 Asegúrate de que el usuario esté registrado en la plataforma')
      process.exit(1)
    }

    console.log(`✅ Usuario encontrado: ${checkUser.rows[0].nombre_completo}`)

    // Verificar si la columna es_admin existe
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigadores' AND column_name = 'es_admin'
    `

    if (checkColumn.rows.length === 0) {
      console.log('📋 Creando columna es_admin...')
      await sql`
        ALTER TABLE investigadores 
        ADD COLUMN es_admin BOOLEAN DEFAULT FALSE
      `
      console.log('✅ Columna es_admin creada')
    } else {
      console.log('✅ Columna es_admin ya existe')
    }

    // Marcar usuario como admin
    const result = await sql`
      UPDATE investigadores 
      SET es_admin = TRUE 
      WHERE correo = ${email}
      RETURNING id, nombre_completo, correo, es_admin
    `

    if (result.rows.length > 0) {
      console.log('✅ Usuario marcado como administrador exitosamente!')
      console.log('📊 Datos actualizados:')
      console.log(`   - ID: ${result.rows[0].id}`)
      console.log(`   - Nombre: ${result.rows[0].nombre_completo}`)
      console.log(`   - Email: ${result.rows[0].correo}`)
      console.log(`   - Es Admin: ${result.rows[0].es_admin}`)
      console.log('')
      console.log('🎉 ¡Ahora puedes acceder a /admin!')
    }

  } catch (error) {
    console.error('❌ Error:', error.message || error)
    if (error.code) {
      console.error(`   Código de error: ${error.code}`)
    }
    process.exit(1)
  }
}

makeAdmin()
