// Configuración para Google Vision API
// Para usar este sistema, necesitas configurar Google Vision API

module.exports = {
  // Opción 1: Usar credenciales de archivo JSON
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './google-credentials.json',
  
  // Opción 2: Usar credenciales de variables de entorno
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
  
  // Opción 3: Usar credenciales por defecto (si están configuradas en el sistema)
  // No se requiere configuración adicional
}

