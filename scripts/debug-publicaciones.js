const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function debugPublicaciones() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('📋 Todas las publicaciones en la base de datos:\n')
    const result = await pool.query(`
      SELECT 
        p.id,
        p.titulo,
        p.autor,
        p.acceso,
        p.editorial,
        p.archivo_url,
        i.nombre_completo as investigador_nombre
      FROM publicaciones p
      LEFT JOIN investigadores i ON p.clerk_user_id = i.clerk_user_id
      ORDER BY p.id
    `)
    
    result.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.titulo}`)
      console.log(`   Autor: ${row.autor || 'N/A'}`)
      console.log(`   Acceso: ${row.acceso || 'N/A'}`)
      console.log(`   Editorial: ${row.editorial || 'N/A'}`)
      console.log(`   Archivo URL: ${row.archivo_url || 'N/A'}`)
      console.log(`   Investigador: ${row.investigador_nombre || 'N/A'}`)
      console.log('')
    })
    
    console.log(`Total: ${result.rows.length} publicaciones`)
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

debugPublicaciones()
