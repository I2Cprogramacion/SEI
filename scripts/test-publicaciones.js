import { getDatabase } from '../lib/db.js'

async function testPublicaciones() {
  try {
    console.log('🧪 Probando funcionalidad de publicaciones...')
    
    const db = await getDatabase()
    await db.inicializar()
    
    // Verificar si la tabla existe
    const tableExists = await db.db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='publicaciones'
    `)
    
    if (!tableExists) {
      console.log('❌ La tabla publicaciones no existe')
      return
    }
    
    console.log('✅ La tabla publicaciones existe')
    
    // Obtener todas las publicaciones
    const publicaciones = await db.obtenerPublicaciones()
    console.log(`📚 Se encontraron ${publicaciones.length} publicaciones:`)
    
    publicaciones.forEach((pub, index) => {
      console.log(`${index + 1}. ${pub.titulo} - ${pub.autor} (${pub.año_creacion})`)
    })
    
    // Probar insertar una publicación de prueba
    const publicacionPrueba = {
      titulo: "Publicación de Prueba",
      autor: "Dr. Juan Pérez",
      institucion: "Universidad de Chihuahua",
      editorial: "Revista de Prueba",
      año_creacion: 2024,
      doi: "10.1000/test",
      resumen: "Esta es una publicación de prueba",
      palabras_clave: "prueba, test, investigación",
      categoria: "Ciencias Naturales",
      tipo: "Artículo de investigación",
      acceso: "Abierto",
      volumen: "1",
      numero: "1",
      paginas: "1-10",
      archivo: null,
      archivo_url: null,
      fecha_creacion: new Date().toISOString()
    }
    
    console.log('📝 Insertando publicación de prueba...')
    const resultado = await db.insertarPublicacion(publicacionPrueba)
    
    if (resultado.success) {
      console.log('✅ Publicación insertada exitosamente:', resultado.id)
    } else {
      console.log('❌ Error al insertar publicación:', resultado.message)
    }
    
    // Verificar que se insertó
    const publicacionesActualizadas = await db.obtenerPublicaciones()
    console.log(`📚 Ahora hay ${publicacionesActualizadas.length} publicaciones`)
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

testPublicaciones()
