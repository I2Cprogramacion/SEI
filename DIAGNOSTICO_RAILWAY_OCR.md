# 🔍 DIAGNÓSTICO: Servicio OCR en Railway

## 📊 **RESUMEN EJECUTIVO**

**Pregunta:** ¿El problema de los usuarios es que Railway está fallando?

**Respuesta:** **SÍ, es muy probable.** Railway es un punto crítico de falla porque:

1. ✅ **El servicio OCR es ESENCIAL** para la extracción automática de datos del CV
2. ⚠️ **Railway tiene problemas comunes** que pueden afectar el servicio
3. 🔴 **Si Railway falla, los usuarios NO pueden registrarse** automáticamente con su CV

---

## 🏗️ **ARQUITECTURA ACTUAL**

```
Usuario sube CV (PDF)
       ↓
[Frontend - Next.js]
       ↓
[API Route: /api/ocr]
       ↓ [Validación: PDF, max 10MB, timeout 55s]
       ↓ [POST request con FormData]
       ↓
[Railway Microservicio]
       ↓ [URL: ${PDF_PROCESSOR_URL}/process-pdf]
       ↓ [Procesamiento con Tesseract.js]
       ↓ [Extracción: CURP, RFC, CVU, email, teléfono]
       ↓
[Respuesta JSON]
       ↓
[Frontend auto-rellena formulario]
       ↓
[Usuario completa datos faltantes]
       ↓
[Guardar en PostgreSQL]
```

---

## 🚨 **PUNTOS DE FALLA IDENTIFICADOS EN RAILWAY**

### **1. ❌ Variable de entorno NO configurada o inválida**

**Archivo:** `app/api/ocr/route.ts` (líneas 10-23)

```typescript
const RAW = process.env.PDF_PROCESSOR_URL;
if (!RAW) {
  return NextResponse.json(
    { error: 'PDF_PROCESSOR_URL no está definida' },
    { status: 500 }
  );
}
const BASE = RAW.replace(/\/$/, '');
if (!/^https:\/\//i.test(BASE) || /localhost|127\.0\.0\.1/i.test(BASE)) {
  return NextResponse.json(
    { error: 'PDF_PROCESSOR_URL inválida para producción' },
    { status: 500 }
  );
}
```

**Síntomas:**
- Usuario sube CV → Error 500
- Mensaje: "PDF_PROCESSOR_URL no está definida"
- O: "PDF_PROCESSOR_URL inválida para producción"

**Causas:**
- La variable `PDF_PROCESSOR_URL` no está configurada en Vercel/producción
- La URL apunta a `localhost` o `127.0.0.1`
- La URL no es HTTPS

**Solución:**
1. Ir a **Vercel Dashboard** → Proyecto → Settings → Environment Variables
2. Verificar que existe: `PDF_PROCESSOR_URL=https://tu-servicio.railway.app`
3. Asegurarse de que sea una URL HTTPS válida de Railway
4. Redeploy del proyecto

---

### **2. ⏱️ TIMEOUT (55 segundos no son suficientes)**

**Archivo:** `app/api/ocr/route.ts` (líneas 46-54)

```typescript
const url = `${BASE}/process-pdf`;
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 55_000); // 55 segundos

let upstream: Response;
try {
  upstream = await fetch(url, { method: 'POST', body: upstreamForm, signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
```

**Síntomas:**
- Usuario sube CV → "Cargando..." por mucho tiempo
- Error: "Proxy failed: The operation was aborted"
- Mensaje: "El servidor tardó demasiado en responder"

**Causas:**
- El PDF es muy grande (cerca de 10MB)
- Railway está en "cold start" (tarda 10-30 segundos en arrancar)
- El procesamiento OCR es lento con PDFs escaneados
- Railway tiene problemas de rendimiento (CPU/RAM limitada)

**Soluciones:**
1. **Aumentar timeout a 90 segundos:**
   ```typescript
   const timeout = setTimeout(() => controller.abort(), 90_000); // 90 segundos
   ```

2. **Implementar ping periódico** para evitar cold starts:
   - Configurar un cron job que haga ping cada 5 minutos
   - Usar servicios como **UptimeRobot** o **Cron-job.org**

3. **Mostrar mejor feedback al usuario:**
   - Agregar mensaje: "Procesando CV... esto puede tomar hasta 2 minutos"
   - Agregar barra de progreso

---

### **3. 🥶 COLD START de Railway**

**¿Qué es un Cold Start?**
- Railway apaga tu servicio después de **5-10 minutos de inactividad** (en plan gratuito)
- La primera petición después de inactividad tarda **15-30 segundos** en arrancar

**Síntomas:**
- Primera vez que un usuario sube CV → Tarda 30+ segundos
- Timeout error
- Funciona después del primer intento

**Causas:**
- Plan gratuito de Railway
- No hay tráfico constante al servicio OCR

**Soluciones:**

**Opción 1: Ping Service (Gratis)**
```javascript
// Crear endpoint /health en el microservicio OCR
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Configurar UptimeRobot para hacer ping cada 5 minutos:
// https://uptimerobot.com/
// URL: https://tu-servicio.railway.app/health
// Interval: 5 minutos
```

**Opción 2: Upgrade a Railway Pro ($5/mes)**
- Garantiza que el servicio siempre esté activo
- Sin cold starts
- Mejor rendimiento (más CPU/RAM)

**Opción 3: Keep-Alive interno**
```typescript
// En el microservicio OCR, agregar:
setInterval(async () => {
  console.log('Keep-alive ping');
}, 4 * 60 * 1000); // Cada 4 minutos
```

---

### **4. 💾 LÍMITES DE RECURSOS (RAM/CPU)**

**Railway Plan Gratuito:**
- **RAM:** 512 MB
- **CPU:** Compartida
- **Timeout:** 300 segundos por request

**Síntomas:**
- Error 502: "Backend OCR 502: sin cuerpo"
- Servicio se cae durante el procesamiento
- Error: "Out of memory"

**Causas:**
- Tesseract.js consume mucha RAM (100-300 MB por PDF)
- Múltiples usuarios subiendo CVs al mismo tiempo
- PDFs muy grandes o escaneados de alta resolución

**Soluciones:**

**Opción 1: Optimizar el código OCR**
```javascript
// Reducir resolución de imágenes antes de OCR
// Limitar páginas procesadas
// Liberar memoria después de cada procesamiento
```

**Opción 2: Upgrade a Railway Pro**
- RAM: 8 GB
- CPU: Dedicada
- Mejor para múltiples usuarios concurrentes

**Opción 3: Procesar PDFs en chunks**
```typescript
// Dividir PDFs grandes en páginas más pequeñas
// Procesar de 1-3 páginas a la vez
```

---

### **5. 🌐 PROBLEMAS DE RED/CONECTIVIDAD**

**Síntomas:**
- Error: "fetch failed"
- Error: "ECONNREFUSED"
- Error: "Network timeout"

**Causas:**
- Railway está caído (mantenimiento, problemas de infraestructura)
- Problemas de DNS
- Firewall bloqueando la conexión Vercel → Railway

**Soluciones:**

**Opción 1: Verificar estado de Railway**
- Ir a: https://railway.app/status
- Revisar si hay incidentes activos

**Opción 2: Logs de Railway**
```bash
# En Railway Dashboard:
1. Ir a tu proyecto OCR
2. Click en "View Logs"
3. Buscar errores recientes
```

**Opción 3: Implementar retry logic**
```typescript
// En /api/ocr/route.ts, agregar reintentos:
async function fetchWithRetry(url: string, options: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
```

---

### **6. 📁 DIRECTORIO ocr-server/ VACÍO**

**Observación:**
```
ocr-server/
  .gitignore
  [No hay archivos del servidor]
```

**¿Problema?**
- El código del microservicio OCR **NO está en el repositorio**
- Probablemente está desplegado directamente en Railway desde otro repositorio
- O fue desplegado manualmente

**Riesgos:**
- Si Railway se cae, no hay forma de redeplegar
- No hay versionamiento del código OCR
- No hay backup del servicio

**Soluciones:**

**Opción 1: Recuperar el código y agregarlo al repo**
```bash
# Crear estructura básica del servidor OCR:
ocr-server/
  package.json
  server.js (o index.js)
  Dockerfile (opcional)
  README.md
```

**Opción 2: Documentar la configuración actual**
- URL del servicio Railway
- Variables de entorno necesarias
- Dependencias (tesseract.js, pdf-parse, etc.)
- Instrucciones de deployment

---

### **7. 🔑 CONFIGURACIÓN INCORRECTA DEL ENDPOINT**

**Código actual:** `app/api/ocr/route.ts` (línea 46)
```typescript
const url = `${BASE}/process-pdf`;
```

**¿Es correcto?**
- ✅ Si el microservicio tiene la ruta `/process-pdf`
- ❌ Si el microservicio usa otra ruta (ej: `/api/ocr`, `/upload`, `/extract`)

**Cómo verificar:**
```bash
# Hacer una petición de prueba a Railway:
curl -X POST https://tu-servicio.railway.app/process-pdf \
  -F "file=@test.pdf" \
  -v
```

**Solución:**
- Verificar la ruta correcta en el código del microservicio
- Actualizar el endpoint en `/api/ocr/route.ts` si es necesario

---

## 🛠️ **PLAN DE ACCIÓN PARA DIAGNOSTICAR**

### **Paso 1: Verificar si Railway está funcionando**

```bash
# Test 1: Verificar que el servicio responde
curl https://tu-servicio.railway.app/health
# Esperado: 200 OK

# Test 2: Verificar el endpoint de OCR
curl -X POST https://tu-servicio.railway.app/process-pdf \
  -F "file=@test.pdf"
# Esperado: JSON con datos extraídos
```

### **Paso 2: Revisar logs de Railway**

1. Ir a **Railway Dashboard**
2. Seleccionar el proyecto del microservicio OCR
3. Click en **"View Logs"**
4. Buscar errores recientes:
   - `Error: Out of memory`
   - `Error: Cannot connect to...`
   - `Timeout`
   - `500 Internal Server Error`

### **Paso 3: Verificar variables de entorno en Vercel**

1. Ir a **Vercel Dashboard** → Tu proyecto
2. Settings → Environment Variables
3. Verificar:
   - ✅ `PDF_PROCESSOR_URL` existe
   - ✅ Valor es `https://tu-servicio.railway.app` (HTTPS)
   - ✅ No tiene `/` al final
   - ✅ Está disponible en "Production", "Preview" y "Development"

### **Paso 4: Probar el flujo completo localmente**

```bash
# 1. Clonar el repo
git clone <repo-url>
cd SEI

# 2. Configurar .env.local
cp env.local.example .env.local
# Editar .env.local y agregar:
# PDF_PROCESSOR_URL=https://tu-servicio.railway.app

# 3. Instalar dependencias
pnpm install

# 4. Ejecutar en desarrollo
pnpm dev

# 5. Probar subida de CV
# Ir a: http://localhost:3000/registro
# Subir un PDF de prueba
# Verificar en la consola si hay errores
```

### **Paso 5: Implementar logging detallado**

**Modificar:** `app/api/ocr/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔵 [OCR] Inicio de procesamiento');
  
  try {
    const RAW = process.env.PDF_PROCESSOR_URL;
    console.log('🔵 [OCR] PDF_PROCESSOR_URL:', RAW ? '✅ Configurada' : '❌ NO configurada');
    
    if (!RAW) {
      console.error('🔴 [OCR] ERROR: PDF_PROCESSOR_URL no está definida');
      return NextResponse.json(
        { error: 'PDF_PROCESSOR_URL no está definida' },
        { status: 500 }
      );
    }

    const BASE = RAW.replace(/\/$/, '');
    console.log('🔵 [OCR] URL base procesada:', BASE);
    
    if (!/^https:\/\//i.test(BASE) || /localhost|127\.0\.0\.1/i.test(BASE)) {
      console.error('🔴 [OCR] ERROR: PDF_PROCESSOR_URL inválida para producción');
      return NextResponse.json(
        { error: 'PDF_PROCESSOR_URL inválida para producción' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    console.log('🔵 [OCR] Archivo recibido:', file ? `✅ ${file.name} (${file.size} bytes)` : '❌ No hay archivo');

    if (!file) {
      console.error('🔴 [OCR] ERROR: No se proporcionó archivo');
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }
    
    if (!file.type?.includes('pdf')) {
      console.error('🔴 [OCR] ERROR: Archivo no es PDF:', file.type);
      return NextResponse.json({ error: 'El archivo debe ser PDF' }, { status: 400 });
    }
    
    if (file.size > 10 * 1024 * 1024) {
      console.error('🔴 [OCR] ERROR: Archivo muy grande:', file.size);
      return NextResponse.json({ error: 'PDF demasiado grande (máx 10MB)' }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const blob = new Blob([ab], { type: file.type });
    const upstreamForm = new FormData();
    upstreamForm.append('file', blob, file.name);

    const url = `${BASE}/process-pdf`;
    console.log('🔵 [OCR] Enviando petición a Railway:', url);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.error('🔴 [OCR] TIMEOUT: Abortando petición después de 55s');
      controller.abort();
    }, 55_000);

    let upstream: Response;
    try {
      upstream = await fetch(url, { 
        method: 'POST', 
        body: upstreamForm, 
        signal: controller.signal 
      });
      console.log('🟢 [OCR] Respuesta recibida de Railway:', upstream.status);
    } catch (fetchError: any) {
      clearTimeout(timeout);
      console.error('🔴 [OCR] ERROR al hacer fetch a Railway:', fetchError.message);
      return NextResponse.json({ 
        error: `Error de conexión con Railway: ${fetchError.message}` 
      }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }

    const rawText = await upstream.clone().text().catch(() => '[no se pudo leer cuerpo]');

    if (!upstream.ok) {
      console.error('🔴 [OCR] Railway respondió con error:', upstream.status, rawText);
      return NextResponse.json({ 
        error: `Backend OCR ${upstream.status}: ${rawText || 'sin cuerpo'}` 
      }, { status: 502 });
    }

    const ct = upstream.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await upstream.json() : { data: rawText };
    let fields = (payload as any).data || payload;
    
    console.log('🟢 [OCR] Datos extraídos:', {
      curp: fields?.curp ? '✅' : '❌',
      rfc: fields?.rfc ? '✅' : '❌',
      no_cvu: fields?.no_cvu ? '✅' : '❌',
      correo: fields?.correo ? '✅' : '❌',
    });

    const endTime = Date.now();
    console.log(`🟢 [OCR] Proceso completado en ${endTime - startTime}ms`);

    // ... resto del código
    
  } catch (err: any) {
    console.error('🔴 [OCR] ERROR CRÍTICO:', err);
    console.error('🔴 [OCR] Stack trace:', err.stack);
    return NextResponse.json({ error: `Proxy failed: ${err?.message}` }, { status: 500 });
  }
}
```

---

## 📋 **CHECKLIST DE VERIFICACIÓN**

### **Configuración**
- [ ] `PDF_PROCESSOR_URL` está configurada en Vercel
- [ ] La URL es HTTPS y válida
- [ ] El servicio de Railway está desplegado y activo
- [ ] Las variables de entorno del microservicio OCR están configuradas

### **Conectividad**
- [ ] El endpoint `/process-pdf` responde (probar con curl)
- [ ] No hay problemas de firewall entre Vercel y Railway
- [ ] Railway no está en mantenimiento (verificar en railway.app/status)

### **Rendimiento**
- [ ] El timeout de 55s es suficiente para PDFs típicos
- [ ] Railway tiene suficiente RAM (verificar logs)
- [ ] No hay múltiples usuarios causando saturación
- [ ] El servicio no está en cold start constante

### **Código**
- [ ] El microservicio OCR tiene el código correcto
- [ ] Las dependencias están instaladas (tesseract.js, pdf-parse)
- [ ] Los logs del microservicio muestran procesamiento exitoso
- [ ] El formato de respuesta JSON es el esperado

---

## 🎯 **RECOMENDACIONES FINALES**

### **Solución Inmediata (mientras arreglas Railway):**

**Opción 1: Formulario manual como fallback**
```typescript
// En el formulario de registro, agregar:
if (ocrError) {
  return (
    <Alert>
      <AlertTitle>Extracción automática no disponible</AlertTitle>
      <AlertDescription>
        Por favor, completa el formulario manualmente. 
        El servicio de procesamiento de CV está temporalmente no disponible.
      </AlertDescription>
    </Alert>
  );
}
```

**Opción 2: Cola de procesamiento**
```typescript
// Guardar el CV en Cloudinary primero
// Procesar OCR en background job
// Notificar al usuario cuando termine
```

### **Solución a Largo Plazo:**

1. **Migrar OCR a Vercel Serverless Functions**
   - Usar Edge Functions con WebAssembly
   - Más confiable que Railway
   - Sin cold starts significativos

2. **Implementar cache de resultados**
   - Si el mismo PDF se sube 2 veces, no re-procesar
   - Usar hash del archivo como key

3. **Backup service**
   - Desplegar el mismo microservicio en Railway + Render + Fly.io
   - Si uno falla, intentar con el siguiente

4. **Telemetría y monitoreo**
   - Implementar Sentry para capturar errores
   - Configurar alertas si Railway está caído

---

## 📞 **PRÓXIMOS PASOS**

1. **Verificar si Railway está configurado correctamente** (5 min)
2. **Revisar logs de Railway** (10 min)
3. **Probar el endpoint manualmente con curl** (5 min)
4. **Implementar logging detallado** (15 min)
5. **Configurar un servicio de ping** para evitar cold starts (10 min)
6. **Evaluar migración a Vercel Edge Functions** (opcional, 2-3 horas)

---

**¿Necesitas ayuda con alguno de estos pasos?** 🚀

