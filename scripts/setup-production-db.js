/**
 * Script para agregar columnas faltantes en la base de datos de PRODUCCIÓN
 * Ejecutar SOLO UNA VEZ en producción
 * 
 * Agrega:
 * - es_admin: Para identificar administradores
 * - ultima_actividad: Para tracking de usuarios activos
 */

require('dotenv').config({ path: '.env.local' })
const { sql } = require('@vercel/postgres')

async function agregarColumnasProduccion() {
  console.log('🔧 Preparando actualización de base de datos de producción...')
  console.log('📊 Base de datos:', process.env.POSTGRES_DATABASE)
  console.log('🌐 Host:', process.env.POSTGRES_HOST)
  console.log('')

  try {
    // 1. Agregar columna es_admin
    console.log('➡️  Paso 1: Agregando columna es_admin...')
    try {
      await sql`
        ALTER TABLE investigadores 
        ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT false
      `
      console.log('   ✅ Columna es_admin agregada correctamente')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ℹ️  Columna es_admin ya existe')
      } else {
        throw error
      }
    }

    // 2. Agregar columna ultima_actividad
    console.log('')
    console.log('➡️  Paso 2: Agregando columna ultima_actividad...')
    try {
      await sql`
        ALTER TABLE investigadores 
        ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP DEFAULT NOW()
      `
      console.log('   ✅ Columna ultima_actividad agregada correctamente')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ℹ️  Columna ultima_actividad ya existe')
      } else {
        throw error
      }
    }

    // 3. Hacer admin al usuario principal
    const emailAdmin = process.argv[2] || 'drksh2015@gmail.com'
    console.log('')
    console.log(`➡️  Paso 3: Configurando ${emailAdmin} como administrador...`)
    
    const checkUser = await sql`
      SELECT id, nombre_completo, correo, es_admin 
      FROM investigadores 
      WHERE correo = ${emailAdmin}
    `

    if (checkUser.rows.length === 0) {
      console.log(`   ⚠️  Usuario ${emailAdmin} NO existe en la base de datos`)
      console.log('   ℹ️  Primero debes registrarte en la aplicación de producción')
      console.log(`   ℹ️  Ve a: https://tu-app.vercel.app/registro`)
      console.log('')
      console.log('   Después vuelve a ejecutar este script para hacerte admin')
    } else {
      await sql`
        UPDATE investigadores 
        SET es_admin = true 
        WHERE correo = ${emailAdmin}
      `
      
      const usuario = checkUser.rows[0]
      console.log('   ✅ Usuario configurado como administrador:')
      console.log(`      ID: ${usuario.id}`)
      console.log(`      Nombre: ${usuario.nombre_completo}`)
      console.log(`      Email: ${usuario.correo}`)
      console.log(`      Es Admin: ✅ SÍ`)
    }

    // 4. Verificación final
    console.log('')
    console.log('➡️  Paso 4: Verificación final...')
    
    const totalUsuarios = await sql`SELECT COUNT(*) as total FROM investigadores`
    const totalAdmins = await sql`SELECT COUNT(*) as total FROM investigadores WHERE es_admin = true`
    
    console.log(`   📊 Total de usuarios: ${totalUsuarios.rows[0].total}`)
    console.log(`   👑 Total de admins: ${totalAdmins.rows[0].total}`)

    console.log('')
    console.log('═══════════════════════════════════════════════════')
    console.log('✅ ¡ACTUALIZACIÓN COMPLETADA!')
    console.log('═══════════════════════════════════════════════════')
    console.log('')
    console.log('Próximos pasos:')
    console.log('1. Redeploy tu aplicación en Vercel')
    console.log('2. Accede a /admin en producción')
    console.log('3. Verifica que todo funcione correctamente')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('═══════════════════════════════════════════════════')
    console.error('❌ ERROR AL ACTUALIZAR BASE DE DATOS')
    console.error('═══════════════════════════════════════════════════')
    console.error('')
    console.error('Error:', error.message)
    console.error('')
    console.error('Posibles causas:')
    console.error('1. Variables de entorno no configuradas en .env.local')
    console.error('2. No hay conexión a la base de datos')
    console.error('3. Permisos insuficientes en la base de datos')
    console.error('')
    console.error('Verifica que tengas estas variables configuradas:')
    console.error('  POSTGRES_URL')
    console.error('  POSTGRES_HOST')
    console.error('  POSTGRES_DATABASE')
    console.error('  POSTGRES_USER')
    console.error('  POSTGRES_PASSWORD')
    console.error('')
    process.exit(1)
  }
}

// Ejecutar
console.log('')
console.log('═══════════════════════════════════════════════════')
console.log('🚀 ACTUALIZACIÓN DE BASE DE DATOS DE PRODUCCIÓN')
console.log('═══════════════════════════════════════════════════')
console.log('')

agregarColumnasProduccion()
