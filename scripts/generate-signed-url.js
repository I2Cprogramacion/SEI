// Script para generar URL firmada del CV
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

console.log('🔐 Generando URL firmada para el CV...\n');

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

const publicId = 'investigadores-cvs/cv_1760458470433';

// Generar URL firmada (válida por 1 año)
const signedUrl = cloudinary.url(publicId, {
  resource_type: 'raw',
  type: 'upload',
  sign_url: true,
  secure: true,
  expires_at: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 año
});

console.log('✅ URL Firmada generada:');
console.log(signedUrl);
console.log('');
console.log('Esta URL es válida por 1 año y funciona sin importar la configuración de privacidad');
console.log('');

// También intentar con delivery_type authenticated
const authenticatedUrl = cloudinary.url(publicId, {
  resource_type: 'raw',
  type: 'authenticated',
  sign_url: true,
  secure: true,
});

console.log('📋 URL Alternativa (authenticated):');
console.log(authenticatedUrl);


