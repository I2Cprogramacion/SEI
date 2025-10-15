# Configuración de Cloudinary para Fotografías de Perfil

Este documento explica cómo configurar Cloudinary para la gestión de imágenes de perfil de investigadores.

## ¿Qué es Cloudinary?

Cloudinary es un servicio de gestión de imágenes en la nube que permite:
- Almacenamiento seguro de imágenes
- Optimización automática de imágenes
- Transformaciones de imágenes (redimensionado, recorte, etc.)
- CDN global para entrega rápida
- Integración nativa con Vercel

## Pasos para Configurar Cloudinary

### 1. Crear una Cuenta en Cloudinary

1. Ve a [https://cloudinary.com/](https://cloudinary.com/)
2. Haz clic en "Sign Up" para crear una cuenta gratuita
3. Completa el registro (puedes usar tu correo de Google/GitHub)

### 2. Obtener las Credenciales

Una vez que inicies sesión:

1. Ve al Dashboard de Cloudinary
2. En la sección "Account Details" encontrarás:
   - **Cloud Name** (nombre de tu cloud)
   - **API Key** (clave de API)
   - **API Secret** (secreto de API)

### 3. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env` o `.env.local`:

```env
# Cloudinary - Gestión de imágenes
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

**⚠️ IMPORTANTE:** 
- El `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` es público y se puede exponer en el cliente
- El `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` son privados y NUNCA deben exponerse en el cliente
- Asegúrate de agregar `.env` y `.env.local` a tu `.gitignore`

### 4. Configuración en Vercel (Producción)

Si despliegas en Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings > Environment Variables**
3. Agrega las tres variables de entorno:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Redeploy tu aplicación

### 5. Plan Gratuito de Cloudinary

El plan gratuito de Cloudinary incluye:
- 25 créditos mensuales
- 25 GB de almacenamiento
- 25 GB de ancho de banda
- Transformaciones ilimitadas

Esto es más que suficiente para comenzar. Para más información sobre planes, visita:
[https://cloudinary.com/pricing](https://cloudinary.com/pricing)

## Estructura de Archivos Implementada

### Componentes

- **`components/upload-fotografia.tsx`**: Componente de React para subir fotografías de perfil
  - Maneja la selección de archivos
  - Muestra preview de la imagen
  - Valida tamaño y tipo de archivo
  - Sube a Cloudinary vía API

### API Endpoints

- **`app/api/upload-fotografia/route.ts`**: Endpoint para subir imágenes
  - Recibe archivos del cliente
  - Valida tipo y tamaño
  - Sube a Cloudinary con transformaciones
  - Retorna URL pública de la imagen

### Configuración

- **`lib/cloudinary-config.ts`**: Configuración del cliente de Cloudinary
  - Inicializa Cloudinary con credenciales
  - Exporta instancia configurada

## Cómo Funciona

1. El usuario selecciona una imagen en el formulario de registro
2. El componente `UploadFotografia` valida el archivo localmente
3. Se envía el archivo al endpoint `/api/upload-fotografia`
4. El servidor valida y procesa el archivo
5. Cloudinary almacena la imagen y retorna una URL pública
6. La URL se guarda en la base de datos junto con el perfil del investigador
7. La imagen se muestra en el perfil usando la URL de Cloudinary

## Transformaciones Aplicadas

Las imágenes se transforman automáticamente:
- Dimensiones: 500x500 píxeles
- Recorte: Enfocado en la cara (`gravity: "face"`)
- Calidad: Automática
- Formato: Automático (WebP en navegadores compatibles)

## Solución de Problemas

### Error: "Environment variable not found"

**Problema:** Las variables de Cloudinary no están configuradas.

**Solución:**
1. Verifica que `.env` o `.env.local` existan
2. Verifica que las variables tengan los nombres correctos
3. Reinicia el servidor de desarrollo

### Error: "Invalid credentials"

**Problema:** Las credenciales de Cloudinary son incorrectas.

**Solución:**
1. Verifica que copiaste correctamente las credenciales del Dashboard
2. Asegúrate de no tener espacios extra
3. Verifica que el API Secret sea el correcto (no el API Environment variable)

### Las imágenes no se cargan

**Problema:** La URL de Cloudinary no funciona.

**Solución:**
1. Verifica que la imagen se haya subido correctamente en el Dashboard de Cloudinary
2. Verifica que la URL en la base de datos sea correcta
3. Verifica que el Cloud Name sea el correcto

### Error: "File too large"

**Problema:** El archivo excede el límite de 5MB.

**Solución:**
1. Reduce el tamaño de la imagen antes de subirla
2. Usa herramientas de compresión de imágenes
3. Si necesitas subir imágenes más grandes, ajusta el límite en el código

## Seguridad

### Buenas Prácticas

1. **Nunca expongas el API Secret en el cliente**
   - Solo usa `NEXT_PUBLIC_` para el Cloud Name
   - El API Key y Secret deben estar solo en el servidor

2. **Valida archivos en el servidor**
   - Verifica tipo de archivo
   - Verifica tamaño
   - Usa las validaciones del endpoint

3. **Configura upload presets en Cloudinary**
   - Limita tipos de archivo
   - Establece límites de tamaño
   - Configura carpetas específicas

4. **Usa signed uploads para mayor seguridad** (opcional)
   - Genera firmas en el servidor
   - Evita uploads no autorizados

## Recursos Adicionales

- [Documentación oficial de Cloudinary](https://cloudinary.com/documentation)
- [Next.js con Cloudinary](https://cloudinary.com/documentation/next_integration)
- [Transformaciones de imágenes](https://cloudinary.com/documentation/image_transformations)
- [Upload API](https://cloudinary.com/documentation/upload_images)

## Soporte

Si tienes problemas con la configuración:
1. Revisa la [documentación oficial](https://cloudinary.com/documentation)
2. Verifica los logs del servidor para mensajes de error
3. Contacta al soporte de Cloudinary si el problema persiste

