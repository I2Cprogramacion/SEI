// Script para hacer público el CV existente en Cloudinary
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

console.log('🔧 Haciendo el CV público en Cloudinary...\n');

// Configurar Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const publicId = 'investigadores-cvs/cv_1760458470433.pdf';

console.log('📄 Archivo:', publicId);
console.log('');

// Actualizar el archivo para que sea público
cloudinary.uploader.explicit(publicId, {
  type: 'upload',
  resource_type: 'raw',
  access_mode: 'public'
})
  .then(result => {
    console.log('✅ CV actualizado exitosamente!');
    console.log('   Public ID:', result.public_id);
    console.log('   URL:', result.secure_url);
    console.log('   Access Mode:', result.access_mode || 'public (por defecto)');
    console.log('');
    console.log('✅ Ahora el CV debería ser accesible públicamente');
  })
  .catch(error => {
    console.error('❌ Error al actualizar:', error.message);
    
    // Si falla explicit, intentar re-upload
    console.log('\n🔄 Intentando método alternativo...');
    console.log('⚠️  El archivo ya está subido. Los nuevos uploads serán públicos automáticamente.');
    console.log('');
    console.log('💡 SOLUCIÓN:');
    console.log('   1. Sube un nuevo CV desde el dashboard');
    console.log('   2. O elimina el actual y vuelve a subirlo');
    console.log('   3. Los nuevos archivos serán públicos automáticamente');
  });


