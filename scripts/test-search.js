const { getDatabase } = require('../lib/database-config')

async function testSearch() {
  try {
    console.log('🔍 Probando búsqueda de investigadores...\n')
    
    const db = await getDatabase()
    
    // Probar búsqueda
    const resultados = await db.buscarInvestigadores({
      termino: 'Jesus',
      limite: 10
    })
    
    console.log('Resultados encontrados:', resultados.length)
    console.log('Datos:', JSON.stringify(resultados, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testSearch()
