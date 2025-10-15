/**
 * Script para generar slugs automáticamente para todos los investigadores
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

/**
 * Convierte un nombre a slug (URL-friendly)
 * Ejemplo: "José García López" -> "jose-garcia-lopez"
 */
function generarSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
}

async function generarSlugs() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Generando slugs para investigadores...\n')
    
    // Obtener investigadores sin slug
    const result = await pool.query(`
      SELECT id, nombre_completo, slug
      FROM investigadores
      WHERE slug IS NULL OR slug = ''
    `)

    if (result.rowCount === 0) {
      console.log('✅ Todos los investigadores ya tienen slug')
      return
    }

    console.log(`📋 Encontrados ${result.rowCount} investigadores sin slug\n`)

    // Generar y actualizar slugs
    for (const row of result.rows) {
      const slug = generarSlug(row.nombre_completo)
      
      // Verificar si el slug ya existe
      const existeSlug = await pool.query(`
        SELECT id FROM investigadores 
        WHERE slug = $1 AND id != $2
      `, [slug, row.id])

      let slugFinal = slug
      if (existeSlug.rowCount > 0) {
        // Si existe, agregar el ID al final
        slugFinal = `${slug}-${row.id}`
        console.log(`⚠️  Slug duplicado detectado, usando: ${slugFinal}`)
      }

      // Actualizar el slug
      await pool.query(`
        UPDATE investigadores 
        SET slug = $1 
        WHERE id = $2
      `, [slugFinal, row.id])

      console.log(`✅ ${row.nombre_completo}`)
      console.log(`   Slug: ${slugFinal}`)
      console.log(`   URL: /investigadores/${slugFinal}`)
      console.log()
    }

    // Verificar resultado final
    const verificacion = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(slug) as con_slug
      FROM investigadores
    `)

    console.log('\n📊 Resultado final:')
    console.log(`   Total investigadores: ${verificacion.rows[0].total}`)
    console.log(`   Con slug: ${verificacion.rows[0].con_slug}`)
    
    if (verificacion.rows[0].total === verificacion.rows[0].con_slug) {
      console.log('\n✅ ¡Todos los investigadores tienen slug ahora!')
    } else {
      console.log('\n⚠️  Algunos investigadores aún sin slug')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

generarSlugs()
