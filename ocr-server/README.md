# 🔍 Microservicio OCR para Railway

Este es un microservicio Node.js que procesa CVs en PDF y extrae información clave usando OCR.

## 📋 **Características**

- ✅ Extracción de texto de PDFs usando `pdf-parse`
- ✅ Detección automática de: CURP, RFC, CVU, email, teléfono, nombre, institución
- ✅ API REST simple con Express
- ✅ Límite de 10 MB por archivo
- ✅ CORS configurado para Vercel
- ✅ Health check endpoint
- ✅ Logging detallado

## 🚀 **Despliegue en Railway**

### **Opción 1: Deploy desde GitHub (Recomendado)**

1. Commitea este directorio `ocr-server/` al repositorio
2. Ve a [Railway.app](https://railway.app)
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Selecciona tu repositorio
6. En **"Root Directory"**, especifica: `ocr-server`
7. Railway detectará automáticamente el `package.json` y desplegará
8. Copia la URL pública que te da Railway (ej: `https://tu-proyecto.up.railway.app`)

### **Opción 2: Deploy desde CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
cd ocr-server
railway init

# Deploy
railway up
```

### **Opción 3: Deploy manual**

1. Crea un nuevo proyecto en Railway
2. Selecciona **"Empty Project"**
3. Click en **"New"** → **"GitHub Repo"**
4. Conecta tu repositorio y selecciona la carpeta `ocr-server`

---

## ⚙️ **Configuración**

### **Variables de Entorno (Railway)**

En Railway, configura las siguientes variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `PORT` | `8001` | Puerto del servidor (Railway lo asigna automáticamente) |
| `ALLOWED_ORIGINS` | `https://tu-app.vercel.app,https://tu-dominio.com` | URLs permitidas por CORS (separadas por comas) |
| `NODE_ENV` | `production` | Ambiente de ejecución |

**Nota:** Railway asigna automáticamente el `PORT`, no es necesario configurarlo manualmente.

---

## 🔗 **Configuración en Vercel**

Después de desplegar en Railway, configura la URL en Vercel:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → **Environment Variables**
3. Agrega:
   ```
   PDF_PROCESSOR_URL = https://tu-proyecto.up.railway.app
   ```
4. Asegúrate de que esté disponible en:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. **Redeploy** tu proyecto en Vercel

---

## 🧪 **Pruebas Locales**

### **1. Instalar dependencias**

```bash
cd ocr-server
npm install
```

### **2. Iniciar el servidor**

```bash
npm start
```

El servidor se ejecutará en `http://localhost:8001`

### **3. Probar el endpoint**

**Health check:**
```bash
curl http://localhost:8001/health
```

**Subir un PDF:**
```bash
curl -X POST http://localhost:8001/process-pdf \
  -F "file=@/ruta/a/tu/cv.pdf"
```

---

## 📡 **Endpoints**

### **GET /**
Información del servicio

**Respuesta:**
```json
{
  "service": "SEI OCR Service",
  "status": "running",
  "version": "1.0.0",
  "timestamp": "2025-10-30T12:00:00.000Z",
  "uptime": 123.45
}
```

### **GET /health**
Health check

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": 1730289600000,
  "uptime": 123.45,
  "memory": {
    "rss": 50331648,
    "heapTotal": 16777216,
    "heapUsed": 8388608
  }
}
```

### **POST /process-pdf**
Procesar CV en PDF

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (archivo PDF, máx 10 MB)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "curp": "AESR850312HCHMNL02",
    "rfc": "AESR850312AB1",
    "no_cvu": "123456",
    "correo": "juan.perez@uach.mx",
    "telefono": "6141234567",
    "nombre_completo": "Juan Alberto Pérez López",
    "fecha_nacimiento": "12/03/1985",
    "institucion": "Universidad Autónoma de Chihuahua",
    "grado_maximo_estudios": "Doctorado en Ciencias de la Computación",
    "experiencia_laboral": "Profesor Investigador Titular"
  },
  "metadata": {
    "filename": "curriculum.pdf",
    "pages": 5,
    "text_length": 3542,
    "processing_time_ms": 847,
    "timestamp": 1730289600000
  }
}
```

**Respuesta de error (400/500):**
```json
{
  "error": "Descripción del error",
  "details": "Detalles técnicos",
  "timestamp": 1730289600000
}
```

---

## 🔍 **Diagnóstico de Problemas**

### **Problema: Cold Start (Railway se apaga tras inactividad)**

**Síntoma:** Primera petición tarda 15-30 segundos

**Solución:** Configurar keep-alive con UptimeRobot

1. Ir a: https://uptimerobot.com/
2. Crear cuenta gratuita
3. Add New Monitor:
   - Monitor Type: **HTTP(s)**
   - URL: `https://tu-proyecto.up.railway.app/health`
   - Monitoring Interval: **5 minutes**
4. Save

Esto hará ping cada 5 minutos y mantendrá el servicio activo.

---

### **Problema: Out of Memory**

**Síntoma:** El servicio se cae al procesar PDFs grandes

**Solución 1:** Upgrade a Railway Pro ($5/mes) para más RAM

**Solución 2:** Optimizar código para liberar memoria

```javascript
// Agregar al final del endpoint /process-pdf:
if (global.gc) {
  global.gc();
}
```

Y ejecutar Node.js con:
```bash
node --expose-gc server.js
```

---

### **Problema: Timeout**

**Síntoma:** Peticiones tardan más de 55 segundos

**Solución:** Aumentar timeout en `/api/ocr/route.ts` (frontend):

```typescript
const timeout = setTimeout(() => controller.abort(), 90_000); // 90 segundos
```

---

## 📊 **Monitoreo**

### **Ver logs en Railway**

1. Ve a tu proyecto en Railway
2. Click en el servicio
3. Tab **"Logs"**
4. Busca por:
   - `🔵 [OCR]` - Eventos normales
   - `✅ [OCR]` - Éxitos
   - `⚠️  [OCR]` - Advertencias
   - `🔴 [OCR]` - Errores

### **Métricas importantes**

- **Tiempo de procesamiento:** Debe ser < 10 segundos para PDFs típicos
- **Uso de memoria:** Debe ser < 500 MB
- **Tasa de éxito:** Debe ser > 90%

---

## 🛠️ **Desarrollo**

### **Estructura del proyecto**

```
ocr-server/
  ├── server.js         # Servidor principal
  ├── package.json      # Dependencias
  ├── README.md         # Este archivo
  ├── .env.example      # Variables de entorno ejemplo
  └── .gitignore        # Archivos a ignorar
```

### **Agregar nuevos patrones de extracción**

Edita la función `extractData()` en `server.js`:

```javascript
// Ejemplo: Extraer número de empleado
const employeePatterns = [
  /(?:empleado|employee)[:\s]*(\d{4,8})/gi
];

for (const pattern of employeePatterns) {
  const match = cleanText.match(pattern);
  if (match) {
    data.numero_empleado = match[1];
    console.log('✅ Número de empleado encontrado:', data.numero_empleado);
    break;
  }
}
```

---

## 📝 **Notas Adicionales**

- El servicio **NO** almacena archivos, todo se procesa en memoria
- Los PDFs deben contener texto extraíble (no imágenes escaneadas)
- Para PDFs escaneados, considera integrar Tesseract.js (OCR real)
- Railway tiene límite de 500 MB de RAM en plan gratuito
- El timeout de Railway es de 300 segundos por request

---

## 🤝 **Soporte**

Si tienes problemas:

1. Revisa los logs de Railway
2. Ejecuta el script de diagnóstico: `.\scripts\test-railway-ocr.ps1`
3. Consulta: `DIAGNOSTICO_RAILWAY_OCR.md`
4. Revisa: `RESUMEN_PROBLEMA_RAILWAY.md`

---

## 📄 **Licencia**

MIT

