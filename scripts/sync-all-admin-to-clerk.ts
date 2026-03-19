#!/usr/bin/env node

/**
 * Script: sync-all-admin-to-clerk.ts
 * 
 * Sincroniza todos los investigadores con es_admin=true en la BD
 * a Clerk custom claims.
 * 
 * Útil para:
 * - Migración inicial desde BD-based verification a Clerk-based
 * - Sincronizar en batch si hubiera fallos
 * 
 * Uso:
 * npx tsx scripts/sync-all-admin-to-clerk.ts
 */

import { sql } from '@vercel/postgres'

const CLERK_API_URL = 'https://api.clerk.com/v1/users'

interface Investigador {
  id: string
  nombre_completo: string
  correo: string
  clerk_user_id: string
  es_admin: boolean
  es_evaluador: boolean
}

async function getClerkSecretKey(): Promise<string> {
  const key = process.env.CLERK_SECRET_KEY
  if (!key) {
    throw new Error('CLERK_SECRET_KEY environment variable not set')
  }
  return key
}

async function getAdminInvestigadores(): Promise<Investigador[]> {
  console.log('📋 Obteniendo investigadores con es_admin=true de la BD...')
  
  const result = await sql`
    SELECT 
      id, 
      nombre_completo, 
      correo, 
      clerk_user_id, 
      es_admin, 
      es_evaluador 
    FROM investigadores 
    WHERE es_admin = true 
    AND clerk_user_id IS NOT NULL
    ORDER BY nombre_completo
  `
  
  return result.rows as Investigador[]
}

async function syncToClerk(
  investigador: Investigador,
  clerkSecretKey: string
): Promise<boolean> {
  try {
    console.log(`  🔄 Sincronizando ${investigador.nombre_completo} (${investigador.correo})...`)
    
    const response = await fetch(`${CLERK_API_URL}/${investigador.clerk_user_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          es_admin: investigador.es_admin,
          es_evaluador: investigador.es_evaluador,
          sync_timestamp: new Date().toISOString()
        }
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`    ❌ Error: ${error}`)
      return false
    }
    
    console.log(`    ✅ OK`)
    return true
    
  } catch (error) {
    console.error(`    ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🔐 Sync All Admin to Clerk - Batch Synchronization')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  try {
    // Obtener CLERK_SECRET_KEY
    const clerkSecretKey = await getClerkSecretKey()
    console.log('✅ CLERK_SECRET_KEY loaded\n')
    
    // Obtener todos los investigadores con es_admin=true
    const investigadores = await getAdminInvestigadores()
    console.log(`✅ Found ${investigadores.length} admin users to sync\n`)
    
    if (investigadores.length === 0) {
      console.log('ℹ️  No admin users found')
      return
    }
    
    // Sincronizar cada uno
    console.log('🔄 Starting synchronization...\n')
    let successCount = 0
    let failCount = 0
    
    for (const investigador of investigadores) {
      const success = await syncToClerk(investigador, clerkSecretKey)
      if (success) {
        successCount++
      } else {
        failCount++
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('📊 Summary:')
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📋 Total: ${investigadores.length}`)
    console.log('═══════════════════════════════════════════════════════════════\n')
    
    if (failCount === 0) {
      console.log('🎉 All admin users synced successfully!')
      process.exit(0)
    } else {
      console.log('⚠️  Some users failed. Check logs above.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main()
