/**
 * Script para eliminar TODOS los usuarios de Clerk
 * ⚠️ PELIGRO: Este script eliminará permanentemente todos los usuarios de Clerk
 * Solo usar en desarrollo para resetear el sistema
 * 
 * Uso: node scripts/delete-all-clerk-users.js
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const { clerkClient } = require('@clerk/clerk-sdk-node')

async function deleteAllClerkUsers() {
  try {
    console.log('🔍 Obteniendo lista de usuarios de Clerk...\n')

    // Obtener todos los usuarios (la API ahora retorna directamente el array)
    const users = await clerkClient.users.getUserList({
      limit: 500 // Clerk permite hasta 500 por página
    })

    const totalCount = users.totalCount || users.length

    console.log(`📊 Total de usuarios encontrados: ${totalCount}\n`)

    if (totalCount === 0 || users.length === 0) {
      console.log('✅ No hay usuarios para eliminar')
      return
    }

    // Confirmar antes de eliminar
    console.log('⚠️  ADVERTENCIA: Esta acción eliminará TODOS los usuarios de Clerk')
    console.log('⚠️  Esta acción NO SE PUEDE DESHACER\n')

    // Lista de usuarios que se eliminarán
    console.log('👥 Usuarios que serán eliminados:')
    users.data?.forEach((user, index) => {
      const email = user.emailAddresses[0]?.emailAddress || 'Sin email'
      const name = user.firstName || user.username || 'Sin nombre'
      console.log(`   ${index + 1}. ${name} (${email}) - ID: ${user.id}`)
    }) || users.forEach((user, index) => {
      const email = user.emailAddresses[0]?.emailAddress || 'Sin email'
      const name = user.firstName || user.username || 'Sin nombre'
      console.log(`   ${index + 1}. ${name} (${email}) - ID: ${user.id}`)
    })

    console.log('\n⏳ Iniciando eliminación en 3 segundos...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Eliminar cada usuario
    let deleted = 0
    let errors = 0

    const userList = users.data || users

    for (const user of userList) {
      try {
        const email = user.emailAddresses[0]?.emailAddress || 'Sin email'
        const name = user.firstName || user.username || 'Sin nombre'
        
        await clerkClient.users.deleteUser(user.id)
        deleted++
        console.log(`✅ Eliminado: ${name} (${email})`)
      } catch (error) {
        errors++
        console.error(`❌ Error al eliminar usuario ${user.id}:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`📊 RESUMEN:`)
    console.log(`   ✅ Eliminados exitosamente: ${deleted}`)
    console.log(`   ❌ Errores: ${errors}`)
    console.log(`   📋 Total procesados: ${userList.length}`)
    console.log('='.repeat(50))

    if (deleted === userList.length) {
      console.log('\n🎉 Todos los usuarios de Clerk han sido eliminados exitosamente')
    } else {
      console.log('\n⚠️  Algunos usuarios no pudieron ser eliminados. Revisa los errores.')
    }

  } catch (error) {
    console.error('\n❌ Error al ejecutar el script:', error)
    console.error('\n💡 Verifica que:')
    console.error('   1. Tengas CLERK_SECRET_KEY en tu archivo .env.local')
    console.error('   2. La clave tenga permisos de administrador')
    console.error('   3. Tu conexión a internet esté funcionando')
    process.exit(1)
  }
}

// Verificar que exista CLERK_SECRET_KEY
if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌ Error: CLERK_SECRET_KEY no está configurada')
  console.error('💡 Asegúrate de que existe en tu archivo .env.local')
  process.exit(1)
}

console.log('\n' + '='.repeat(50))
console.log('🗑️  SCRIPT DE ELIMINACIÓN MASIVA DE USUARIOS CLERK')
console.log('='.repeat(50) + '\n')

deleteAllClerkUsers()
