const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Ruta a la base de datos
const dbPath = path.join(__dirname, '..', 'database.db')

console.log('🔍 Consultando investigadores existentes...\n')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message)
    return
  }
  console.log('Conectado a la base de datos SQLite.')
})

// Consultar investigadores
db.all("SELECT id, nombre_completo, correo, institucion, area FROM investigadores LIMIT 10", [], (err, rows) => {
  if (err) {
    console.error('❌ Error al consultar investigadores:', err.message)
    return
  }

  if (rows.length === 0) {
    console.log('❌ No se encontraron investigadores en la base de datos.')
  } else {
    console.log(`✅ Se encontraron ${rows.length} investigador(es):\n`)
    
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}`)
      console.log(`   Nombre: ${row.nombre_completo || 'No especificado'}`)
      console.log(`   Email: ${row.correo || 'No especificado'}`)
      console.log(`   Institución: ${row.institucion || 'No especificada'}`)
      console.log(`   Área: ${row.area || 'No especificada'}`)
      console.log('')
    })
  }
})

// Cerrar la conexión
db.close((err) => {
  if (err) {
    console.error('❌ Error al cerrar la conexión:', err.message)
  } else {
    console.log('✅ Conexión cerrada.')
  }
})
