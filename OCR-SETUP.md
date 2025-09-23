# Configuración de OCR con Google Vision API

## Para habilitar OCR real (extracción de datos reales de documentos)

### Paso 1: Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Vision:
   - Ve a "APIs & Services" > "Library"
   - Busca "Cloud Vision API"
   - Haz clic en "Enable"

### Paso 2: Crear credenciales
1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "Service Account"
3. Completa los detalles del servicio
4. Descarga el archivo JSON de credenciales

### Paso 3: Configurar el proyecto
1. Coloca el archivo JSON de credenciales en la raíz del proyecto
2. Renómbralo a `google-credentials.json`
3. O configura las variables de entorno:

```bash
# En tu archivo .env.local
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
```

### Paso 4: Instalar dependencias
```bash
npm install @google-cloud/vision
```

## Estado actual del sistema

- ✅ **Sistema funcionando**: El sistema actual funciona en modo demostración
- ✅ **Datos realistas**: Genera datos de ejemplo que puedes editar
- ✅ **Base de datos**: Guarda correctamente en PostgreSQL
- 🔄 **OCR real**: Disponible cuando configures Google Vision API

## Modo de demostración vs OCR real

### Modo de demostración (actual)
- Genera datos de ejemplo basados en el nombre del archivo
- Funciona inmediatamente sin configuración
- Los datos son editables antes de guardar
- Ideal para pruebas y desarrollo

### OCR real (con Google Vision API)
- Extrae texto real de documentos PDF e imágenes
- Analiza el contenido y extrae datos específicos
- Requiere configuración de Google Cloud
- Ideal para producción

## Costos de Google Vision API

- **Primeros 1,000 requests por mes**: Gratis
- **Después**: $1.50 por 1,000 requests
- **Para desarrollo**: Generalmente gratis

## Alternativas a Google Vision API

Si prefieres no usar Google Vision API, puedes considerar:
- Azure Computer Vision
- AWS Textract
- Tesseract.js (con configuración especial)
- APIs de OCR gratuitas

## Soporte

Si necesitas ayuda configurando el OCR real, contacta al equipo de desarrollo.
