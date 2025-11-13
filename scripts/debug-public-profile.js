require('dotenv').config({ path: '.env.local' })
const { sql } = require('@vercel/postgres')

async function debugPublicProfile() {
  try {
    console.log('🔍 Diagnóstico del Perfil Público\n')

    // 1. Ver todos los investigadores con sus slugs
    console.log('📋 Investigadores en la base de datos:')
    const investigadores = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id, slug
      FROM investigadores
      ORDER BY id
    `
    
    investigadores.rows.forEach(inv => {
      console.log(`  - ID: ${inv.id}`)
      console.log(`    Nombre: ${inv.nombre_completo}`)
      console.log(`    Email: ${inv.correo}`)
      console.log(`    Slug: ${inv.slug || 'NO TIENE SLUG'}`)
      console.log(`    Clerk ID: ${inv.clerk_user_id}\n`)
    })

    // 2. Ver todas las publicaciones
    console.log('\n📚 Publicaciones en la base de datos:')
    const publicaciones = await sql`
      SELECT id, titulo, autor, clerk_user_id
      FROM publicaciones
      ORDER BY id
    `
    
    console.log(`Total: ${publicaciones.rows.length} publicaciones\n`)
    publicaciones.rows.forEach(pub => {
      console.log(`  - ID: ${pub.id}`)
      console.log(`    Título: ${pub.titulo}`)
      console.log(`    Autor: ${pub.autor}`)
      console.log(`    Clerk ID: ${pub.clerk_user_id}\n`)
    })

    // 3. Probar búsqueda por slug para cada investigador
    console.log('\n🔗 Prueba de búsqueda por slug:')
    for (const inv of investigadores.rows) {
      if (!inv.slug) {
        console.log(`  ❌ ${inv.nombre_completo} - NO TIENE SLUG`)
        continue
      }

      const investigadorPorSlug = await sql`
        SELECT id, nombre_completo, correo, clerk_user_id
        FROM investigadores
        WHERE slug = ${inv.slug}
      `

      if (investigadorPorSlug.rows.length === 0) {
        console.log(`  ❌ ${inv.nombre_completo} - Slug "${inv.slug}" no encontrado`)
        continue
      }

      const investigadorEncontrado = investigadorPorSlug.rows[0]
      console.log(`  ✅ ${inv.nombre_completo} - Slug "${inv.slug}" encontrado`)

      // Buscar publicaciones por clerk_user_id
      if (investigadorEncontrado.clerk_user_id) {
        const pubsPorClerkId = await sql`
          SELECT id, titulo
          FROM publicaciones
          WHERE clerk_user_id = ${investigadorEncontrado.clerk_user_id}
        `

        console.log(`     📊 Publicaciones por clerk_user_id: ${pubsPorClerkId.rows.length}`)
        pubsPorClerkId.rows.forEach(pub => {
          console.log(`        - "${pub.titulo}"`)
        })
      }

      // Buscar por nombre en el campo autor
      const pubsPorNombre = await sql`
        SELECT id, titulo, autor
        FROM publicaciones
        WHERE LOWER(autor) LIKE ${`%${investigadorEncontrado.nombre_completo?.toLowerCase()}%`}
      `

      console.log(`     📊 Publicaciones por nombre en autor: ${pubsPorNombre.rows.length}`)

      if (pubsPorNombre.rows.length > 0) {
        pubsPorNombre.rows.forEach(pub => {
          console.log(`        - "${pub.titulo}"`)
        })
      }

      console.log('')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    process.exit(0)
  }
}

debugPublicProfile()
