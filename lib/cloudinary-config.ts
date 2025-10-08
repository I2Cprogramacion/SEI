import { v2 as cloudinary } from 'cloudinary';

// Verificar que las variables de entorno estén disponibles
const cloudinaryUrl = process.env.CLOUDINARY_URL;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Cloudinary Config:', {
  cloudinaryUrl: cloudinaryUrl ? 'Presente' : 'Faltante',
  cloudName: cloudName ? 'Presente' : 'Faltante',
  apiKey: apiKey ? 'Presente' : 'Faltante',
  apiSecret: apiSecret ? 'Presente' : 'Faltante'
});

// Configurar Cloudinary usando CLOUDINARY_URL (preferido) o variables separadas
if (cloudinaryUrl) {
  // Usar CLOUDINARY_URL (más simple)
  cloudinary.config({
    cloudinary_url: cloudinaryUrl
  });
  console.log('✅ Cloudinary configurado con CLOUDINARY_URL');
} else if (cloudName && apiKey && apiSecret) {
  // Usar variables separadas (fallback)
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configurado con variables separadas');
} else {
  console.warn('⚠️ Variables de entorno de Cloudinary no configuradas. El upload de imágenes no funcionará.');
}

// Función helper para verificar si Cloudinary está configurado
export function isCloudinaryConfigured(): boolean {
  return !!(cloudinaryUrl || (cloudName && apiKey && apiSecret));
}

export default cloudinary;

