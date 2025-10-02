# 🔧 Configuración de Variables de Entorno para OCR

## **Archivo .env.local**

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Configuración de la base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/researcher_platform"

# Configuración de OCR
# Opción 1: OCR.space API (Recomendado - Gratis)
# Obtén tu API key en: https://ocr.space/ocrapi/freekey
OCR_SPACE_API_KEY=tu_api_key_de_ocr_space_aqui

# Opción 2: Google Vision API (Más preciso)
# Configura las credenciales de Google Cloud Vision
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Configuración de NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_key_aqui

# Configuración de Vercel (si usas Vercel Postgres)
POSTGRES_URL=tu_postgres_url_de_vercel
POSTGRES_PRISMA_URL=tu_postgres_prisma_url_de_vercel
POSTGRES_URL_NON_POOLING=tu_postgres_url_non_pooling_de_vercel
POSTGRES_USER=tu_usuario_postgres
POSTGRES_HOST=tu_host_postgres
POSTGRES_PASSWORD=tu_password_postgres
POSTGRES_DATABASE=tu_database_postgres
```

## **Configuración Rápida para OCR.space**

1. **Obtener API Key:**
   - Ve a: https://ocr.space/ocrapi/freekey
   - Regístrate (es gratis)
   - Copia tu API key

2. **Configurar en .env.local:**
   ```bash
   OCR_SPACE_API_KEY=tu_api_key_real_aqui
   ```

3. **Reiniciar el servidor:**
   ```bash
   npm run dev
   ```

## **Configuración para Google Vision API**

1. **Crear proyecto en Google Cloud:**
   - Ve a: https://console.cloud.google.com/
   - Crea proyecto: `researcher-platform-ocr`
   - Habilita Vision API

2. **Crear Service Account:**
   - Ve a "APIs y servicios" → "Credenciales"
   - Crea "Cuenta de servicio"
   - Descarga archivo JSON
   - Renómbralo a `google-credentials.json`
   - Ponlo en la raíz del proyecto

3. **Configurar en .env.local:**
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   ```

## **Verificar Configuración**

Para verificar que las variables están configuradas correctamente, puedes:

1. **Revisar la consola del servidor** cuando subas un archivo
2. **Ver los logs** que muestran si las APIs están configuradas
3. **Probar con un archivo real** en `/registro`

## **Fallback Automático**

El sistema tiene un fallback automático:
1. **Google Vision API** (si está configurado)
2. **Tesseract.js local** (siempre disponible)
3. **OCR.space API** (si está configurado)
4. **Modo demostración** (si todo falla)

¡El sistema funcionará incluso sin configuración adicional!

