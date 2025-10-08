import { v2 as cloudinary } from 'cloudinary';

// Verificar que las variables de entorno estén disponibles
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Cloudinary Config:', {
  cloudName: cloudName ? 'Presente' : 'Faltante',
  apiKey: apiKey ? 'Presente' : 'Faltante',
  apiSecret: apiSecret ? 'Presente' : 'Faltante'
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Variables de entorno de Cloudinary faltantes');
  throw new Error('Variables de entorno de Cloudinary no configuradas correctamente');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;

