const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function checkPublicacion() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    const result = await pool.query('SELECT id, titulo, autor FROM publicaciones WHERE id = $1', [7])
    
    if (result.rows.length === 0) {
      console.log('❌ Publicación ID 7 NO existe en la base de datos')
      console.log('📋 Publicaciones disponibles:')
      const all = await pool.query('SELECT id, titulo FROM publicaciones ORDER BY id LIMIT 10')
      all.rows.forEach(row => {
        console.log(`   - ID ${row.id}: ${row.titulo}`)
      })
    } else {
      console.log('✅ Publicación ID 7 SÍ existe:')
      console.log(`   Título: ${result.rows[0].titulo}`)
      console.log(`   Autor: ${result.rows[0].autor}`)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkPublicacion()
