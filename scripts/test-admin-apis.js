/**
 * Script para verificar que todas las APIs del panel de admin funcionen correctamente
 */

const BASE_URL = 'http://localhost:3000'

const endpoints = [
  '/api/admin/verificar',
  '/api/admin/usuarios-stats',
  '/api/investigadores',
  '/api/proyectos',
  '/api/publicaciones',
  '/api/instituciones',
  '/api/investigadores/featured',
  '/api/proyectos/recent'
]

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Probando: ${endpoint}`)
    const response = await fetch(`${BASE_URL}${endpoint}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ${endpoint} - Status: ${response.status}`)
      console.log(`   Datos recibidos: ${JSON.stringify(data).substring(0, 100)}...`)
      return { endpoint, status: response.status, ok: true }
    } else {
      const text = await response.text()
      console.log(`❌ ${endpoint} - Status: ${response.status}`)
      console.log(`   Error: ${text.substring(0, 200)}`)
      return { endpoint, status: response.status, ok: false, error: text }
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - Error de conexión`)
    console.log(`   ${error.message}`)
    return { endpoint, status: 0, ok: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de APIs del panel de admin...')
  console.log('=' .repeat(60))
  
  const results = []
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 500)) // Esperar 500ms entre requests
  }
  
  console.log('\n\n📊 RESUMEN DE PRUEBAS')
  console.log('=' .repeat(60))
  
  const passed = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length
  
  console.log(`\n✅ Exitosas: ${passed}/${results.length}`)
  console.log(`❌ Fallidas: ${failed}/${results.length}`)
  
  if (failed > 0) {
    console.log('\n❌ APIs con problemas:')
    results.filter(r => !r.ok).forEach(r => {
      console.log(`   - ${r.endpoint} (Status: ${r.status})`)
    })
  } else {
    console.log('\n🎉 ¡Todas las APIs funcionan correctamente!')
  }
}

runTests()
