# 🔧 Configuración de Variables de Entorno Locales

Este archivo contiene las instrucciones para configurar las variables de entorno necesarias en tu máquina local.

## 📋 Archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Google Vision API - Para OCR
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Base de Datos - PostgreSQL (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-late-wind-a8thhxch-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"

# Cloudinary - Gestión de imágenes de perfil
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diyesba9p
CLOUDINARY_API_KEY=648673473235137
CLOUDINARY_API_SECRET=GfKCclizQuOdP-gO2Aoj8xteeAg
```

## ⚠️ Importante

- Este archivo **NO debe subirse a GitHub** (ya está en `.gitignore`)
- Cada desarrollador debe crear su propio archivo `.env.local`
- Si trabajas en otra computadora, copia este contenido

## 🚀 Después de crear el archivo

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Verifica que las variables estén cargadas:
   - Deberías ver la opción de subir fotografía en el formulario de registro
   - El componente de upload de Cloudinary debería aparecer

## 🌐 Variables de Entorno en Vercel

Para producción, agrega estas mismas variables en:
**Vercel Dashboard → Settings → Environment Variables**

Variables a agregar:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `DATABASE_URL` (ya debería estar configurada)
- `GOOGLE_APPLICATION_CREDENTIALS` (si usas OCR)

Después de agregarlas, haz **Redeploy** del proyecto.

