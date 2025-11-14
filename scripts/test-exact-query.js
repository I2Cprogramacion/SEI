require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

async function testQuery() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔍 Testing exact query from page.tsx...\n')
    
    const id = 7
    console.log('Testing with ID:', id, 'Type:', typeof id)
    
    const result = await pool.query(
      `SELECT 
        p.*,
        i.nombre_completo as investigador_nombre,
        i.slug as investigador_slug,
        i.institucion as investigador_institucion
       FROM publicaciones p
       LEFT JOIN investigadores i ON p.clerk_user_id = i.clerk_user_id
       WHERE p.id = $1`,
      [id]
    )
    
    console.log('📊 Result rows:', result.rows.length)
    
    if (result.rows.length > 0) {
      console.log('\n✅ Found publication:')
      console.log('Titulo:', result.rows[0].titulo)
      console.log('Autor:', result.rows[0].autor)
      console.log('clerk_user_id:', result.rows[0].clerk_user_id)
      console.log('investigador_nombre:', result.rows[0].investigador_nombre)
      console.log('\n📋 All columns:', Object.keys(result.rows[0]).join(', '))
    } else {
      console.log('\n❌ No results found')
      
      // Test simple query without JOIN
      console.log('\n🔍 Testing simple query without JOIN...')
      const simpleResult = await pool.query(
        'SELECT * FROM publicaciones WHERE id = $1',
        [id]
      )
      console.log('Simple query results:', simpleResult.rows.length)
      if (simpleResult.rows.length > 0) {
        console.log('Found with simple query! clerk_user_id:', simpleResult.rows[0].clerk_user_id)
      }
    }
    
    await pool.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

testQuery()
