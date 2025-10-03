const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Ruta a la base de datos
const dbPath = path.join(__dirname, '..', 'database.db')

console.log('🔍 Probando búsqueda directa...\n')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message)
    return
  }
  console.log('Conectado a la base de datos SQLite.')
})

// Probar la misma consulta que usa buscarInvestigadores
const termino = 'Jesus'
const terminoBusqueda = `%${termino.toLowerCase()}%`

const query = `
  SELECT id, nombre_completo as nombre, correo as email, institucion, area
  FROM investigadores 
  WHERE (
    LOWER(nombre_completo) LIKE ? OR 
    LOWER(correo) LIKE ? OR 
    LOWER(institucion) LIKE ? OR
    LOWER(area) LIKE ?
  )
  ORDER BY nombre_completo ASC
  LIMIT 10
`

console.log('Query:', query)
console.log('Parámetros:', [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda])

db.all(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda], (err, rows) => {
  if (err) {
    console.error('❌ Error en la consulta:', err.message)
    return
  }

  console.log(`\n✅ Resultados encontrados: ${rows.length}`)
  console.log('Datos:', JSON.stringify(rows, null, 2))
})

// Cerrar la conexión
db.close((err) => {
  if (err) {
    console.error('❌ Error al cerrar la conexión:', err.message)
  } else {
    console.log('\n✅ Conexión cerrada.')
  }
})
