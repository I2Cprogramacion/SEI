/**
 * Script para verificar estado de admin en la base de datos
 * Usar para diagnosticar problemas en producción/Vercel
 */

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' })

const { sql } = require('@vercel/postgres')

async function checkAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('❌ Error: Debes proporcionar un email')
    console.log('Uso: node scripts/check-admin-vercel.js EMAIL')
    process.exit(1)
  }

  try {
    console.log('🔍 Verificando configuración...')
    console.log('Email a verificar:', email)
    console.log('Base de datos:', process.env.POSTGRES_DATABASE || 'NO CONFIGURADA')
    console.log('Host:', process.env.POSTGRES_HOST || 'NO CONFIGURADO')
    console.log('')

    // Verificar que el usuario existe
    console.log('📊 Buscando usuario en la base de datos...')
    const result = await sql`
      SELECT 
        id, 
        nombre_completo, 
        correo, 
        es_admin,
        ultima_actividad,
        fecha_registro
      FROM investigadores 
      WHERE correo = ${email}
    `

    if (result.rows.length === 0) {
      console.log('❌ Usuario NO encontrado en la base de datos')
      console.log('')
      console.log('Posibles causas:')
      console.log('1. El usuario no se ha registrado en esta base de datos')
      console.log('2. Estás conectado a una base de datos diferente (local vs producción)')
      console.log('3. El email no coincide exactamente')
      console.log('')
      console.log('Solución:')
      console.log('- Verifica que estés usando las variables de entorno correctas')
      console.log('- Regístrate en el sistema si aún no lo has hecho')
      process.exit(1)
    }

    const usuario = result.rows[0]
    console.log('✅ Usuario encontrado:')
    console.log('  ID:', usuario.id)
    console.log('  Nombre:', usuario.nombre_completo || 'NO CONFIGURADO')
    console.log('  Email:', usuario.correo)
    console.log('  Es Admin:', usuario.es_admin ? '✅ SÍ' : '❌ NO')
    console.log('  Última actividad:', usuario.ultima_actividad || 'Nunca')
    console.log('  Fecha registro:', usuario.fecha_registro || 'No disponible')
    console.log('')

    if (!usuario.es_admin) {
      console.log('⚠️  El usuario NO es administrador')
      console.log('')
      console.log('Para hacer admin a este usuario, ejecuta:')
      console.log(`  node scripts/make-admin.js ${email}`)
      console.log('')
      process.exit(1)
    }

    console.log('✅ ¡El usuario ES administrador!')
    console.log('')
    console.log('Si aún tienes problemas de acceso en Vercel:')
    console.log('1. Verifica las variables de entorno en Vercel Dashboard')
    console.log('2. Asegúrate de que POSTGRES_URL apunta a la misma base de datos')
    console.log('3. Redeploy la aplicación después de cambiar variables')
    console.log('4. Limpia la caché de Vercel: Deployments → ⋯ → Redeploy')

  } catch (error) {
    console.error('❌ Error al verificar admin:', error)
    console.log('')
    console.log('Posibles causas:')
    console.log('1. Variables de entorno no configuradas correctamente')
    console.log('2. No hay conexión a la base de datos')
    console.log('3. La columna es_admin no existe en la tabla')
    console.log('')
    console.log('Verifica que tengas estas variables en .env.local:')
    console.log('  POSTGRES_URL')
    console.log('  POSTGRES_HOST')
    console.log('  POSTGRES_DATABASE')
    console.log('  POSTGRES_USER')
    console.log('  POSTGRES_PASSWORD')
    process.exit(1)
  }
}

checkAdmin()
