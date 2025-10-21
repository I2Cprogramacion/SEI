// Script para probar la conexión con Cloudinary
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

console.log('🔍 Probando conexión con Cloudinary...\n');

// Mostrar configuración (ocultando secretos)
console.log('📋 Configuración detectada:');
console.log('   CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? '✅ Presente' : '❌ Faltante');
console.log('   CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'No configurado');
console.log('   API_KEY:', process.env.CLOUDINARY_API_KEY ? `✅ ***${process.env.CLOUDINARY_API_KEY.slice(-4)}` : '❌ Faltante');
console.log('   API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Faltante');
console.log('');

// Configurar Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
  console.log('✅ Cloudinary configurado con CLOUDINARY_URL');
} else if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configurado con variables separadas');
} else {
  console.error('❌ No se pudo configurar Cloudinary. Verifica tus variables de entorno.');
  process.exit(1);
}

// Probar conexión listando recursos
console.log('\n🔗 Probando conexión...');
cloudinary.api.resources({ 
  type: 'upload',
  resource_type: 'raw',
  prefix: 'investigadores-cvs/',
  max_results: 5
})
  .then(result => {
    console.log('✅ Conexión exitosa!');
    console.log(`\n📁 Carpeta: investigadores-cvs/`);
    console.log(`📊 Total de CVs encontrados: ${result.resources.length}`);
    
    if (result.resources.length > 0) {
      console.log('\n📄 CVs cargados:');
      result.resources.forEach((resource, index) => {
        console.log(`\n${index + 1}. ${resource.public_id}`);
        console.log(`   Formato: ${resource.format}`);
        console.log(`   Tamaño: ${(resource.bytes / 1024).toFixed(2)} KB`);
        console.log(`   Fecha: ${new Date(resource.created_at).toLocaleString('es-MX')}`);
        console.log(`   URL: ${resource.secure_url}`);
      });
    } else {
      console.log('\n⚠️  No se encontraron CVs en la carpeta investigadores-cvs/');
    }
  })
  .catch(error => {
    console.error('❌ Error al conectar con Cloudinary:');
    console.error('   Código:', error.error?.http_code || 'Desconocido');
    console.error('   Mensaje:', error.error?.message || error.message);
    
    if (error.error?.http_code === 401) {
      console.error('\n⚠️  Error 401: Credenciales inválidas');
      console.error('   Verifica que tu API Key y Secret sean correctos');
    }
  });


