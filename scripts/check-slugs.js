/**
 * Script para verificar los slugs de los investigadores
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function checkSlugs() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Verificando slugs de investigadores...\n')
    
    // Obtener todos los investigadores con sus slugs
    const result = await pool.query(`
      SELECT 
        id,
        nombre_completo,
        correo,
        slug,
        CASE 
          WHEN slug IS NULL THEN '❌ SIN SLUG'
          WHEN slug = '' THEN '⚠️  VACÍO'
          ELSE '✅'
        END as estado
      FROM investigadores
      ORDER BY id
    `)

    console.log(`📊 Total investigadores: ${result.rowCount}\n`)
    
    result.rows.forEach(row => {
      console.log(`${row.estado} ${row.nombre_completo}`)
      console.log(`   ID: ${row.id}`)
      console.log(`   Email: ${row.correo}`)
      console.log(`   Slug: ${row.slug || '(no tiene)'}`)
      console.log(`   URL: /investigadores/${row.slug || 'ERROR'}`)
      console.log()
    })

    // Contar problemas
    const sinSlug = result.rows.filter(r => !r.slug || r.slug === '').length
    if (sinSlug > 0) {
      console.log(`\n⚠️  ${sinSlug} investigadores sin slug`)
      console.log('\n💡 Solución: Ejecuta el script de generar slugs:')
      console.log('   node scripts/generar-slugs.js')
    } else {
      console.log('\n✅ Todos los investigadores tienen slug')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkSlugs()
