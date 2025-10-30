# 📋 RESUMEN EJECUTIVO: Problema con Railway OCR

## 🎯 **RESPUESTA DIRECTA A TU PREGUNTA**

**Pregunta:** *"¿Crees que el problema de los usuarios sea que Railway está fallando?"*

**Respuesta:** **SÍ, es MUY PROBABLE que Railway sea el problema.** 🔴

---

## 🔍 **EVIDENCIA**

### **1. Railway es un punto crítico de falla**

El servicio OCR en Railway es **ESENCIAL** para el registro de usuarios:

```
Usuario sube CV (PDF)
    ↓
Frontend envía a /api/ocr
    ↓
/api/ocr reenvía a Railway → ${PDF_PROCESSOR_URL}/process-pdf
    ↓
Railway procesa con Tesseract.js
    ↓
Railway extrae: CURP, RFC, CVU, correo, teléfono
    ↓
Frontend auto-llena el formulario
    ↓
Usuario puede completar su registro
```

**Si Railway falla → Los usuarios NO pueden registrarse automáticamente**

---

### **2. Problemas comunes de Railway detectados**

#### **Problema #1: Variable de entorno NO configurada** ⚠️

**Archivo:** `app/api/ocr/route.ts`

```typescript
const RAW = process.env.PDF_PROCESSOR_URL;
if (!RAW) {
  return NextResponse.json(
    { error: 'PDF_PROCESSOR_URL no está definida' },
    { status: 500 }
  );
}
```

**¿Está configurada en Vercel?**
- [ ] Verificar en: Vercel Dashboard → Settings → Environment Variables
- [ ] Debe ser: `https://tu-servicio.railway.app` (HTTPS)
- [ ] Sin `/` al final

---

#### **Problema #2: Cold Start (Railway se apaga tras 5-10 min de inactividad)** 🥶

**Síntoma:** Primera subida de CV tarda 30+ segundos o falla con timeout

**Causa:** Railway (plan gratuito) apaga el servicio tras inactividad

**Solución inmediata:**
1. **Configurar un servicio de ping** (gratis):
   - Ir a: https://uptimerobot.com/
   - Crear monitor para: `https://tu-servicio.railway.app/health`
   - Intervalo: 5 minutos
   - Esto mantendrá el servicio "despierto"

2. **O upgrade a Railway Pro ($5/mes)**
   - Sin cold starts
   - Mejor rendimiento
   - Servicio siempre activo

---

#### **Problema #3: Timeout de 55 segundos** ⏱️

**Código actual:**
```typescript
const timeout = setTimeout(() => controller.abort(), 55_000); // 55 segundos
```

**Problema:** Si Railway está en cold start o el PDF es grande, 55s no son suficientes

**Solución:**
```typescript
const timeout = setTimeout(() => controller.abort(), 90_000); // 90 segundos
```

---

#### **Problema #4: Servicio NO desplegado o con errores** 🚨

**Observación:**
```
ocr-server/
  .gitignore
  [No hay archivos del servidor]
```

El código del microservicio **NO está en el repositorio** → Riesgo de pérdida

**Acción requerida:**
1. Verificar en Railway Dashboard que el servicio esté desplegado
2. Revisar logs de Railway para errores
3. Si no existe, necesitarás crear/desplegar el microservicio OCR

---

## 🛠️ **PLAN DE ACCIÓN INMEDIATO**

### **Paso 1: Verificar si Railway está funcionando (5 minutos)**

**Opción A: Usar el script de diagnóstico (Windows)**
```powershell
# En la raíz del proyecto:
.\scripts\test-railway-ocr.ps1 -Url "https://tu-servicio.railway.app"
```

**Opción B: Verificar manualmente**
```powershell
# Prueba 1: ¿El servicio responde?
curl https://tu-servicio.railway.app

# Prueba 2: ¿El endpoint OCR existe?
curl -X POST https://tu-servicio.railway.app/process-pdf
# Esperado: Error 400 (normal sin archivo)
# Malo: Error 404 o timeout
```

---

### **Paso 2: Revisar logs de Railway (5 minutos)**

1. Ir a: https://railway.app/dashboard
2. Seleccionar tu proyecto OCR
3. Click en **"View Logs"**
4. Buscar errores recientes:
   - ❌ `Error: Out of memory`
   - ❌ `Error: Cannot connect`
   - ❌ `Timeout`
   - ❌ `500 Internal Server Error`
   - ❌ `Module not found: tesseract.js`

---

### **Paso 3: Verificar configuración en Vercel (3 minutos)**

1. Ir a: https://vercel.com/dashboard
2. Seleccionar tu proyecto SEI
3. Settings → **Environment Variables**
4. Verificar:
   ```
   PDF_PROCESSOR_URL = https://tu-servicio.railway.app
   ```
   - ✅ Debe existir
   - ✅ Debe ser HTTPS
   - ✅ Sin `/` al final
   - ✅ Debe estar en "Production", "Preview" y "Development"

5. Si hiciste cambios → **Redeploy** el proyecto

---

### **Paso 4: Solución temporal (si Railway está caído)**

**Opción 1: Deshabilitar OCR temporalmente**

Editar `app/api/ocr/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  // TEMPORAL: OCR deshabilitado mientras se arregla Railway
  return NextResponse.json(
    { 
      error: 'El servicio de extracción automática está temporalmente no disponible. Por favor, completa el formulario manualmente.',
      curp: null,
      rfc: null,
      no_cvu: null,
      correo: null,
      telefono: null
    },
    { status: 503 }
  );
}
```

Esto permitirá que los usuarios **completen el formulario manualmente** mientras arreglas Railway.

**Opción 2: Aumentar el timeout**

```typescript
const timeout = setTimeout(() => controller.abort(), 120_000); // 2 minutos
```

---

## 📊 **CHECKLIST DE DIAGNÓSTICO**

Marca cada item conforme lo verificas:

### **Configuración**
- [ ] `PDF_PROCESSOR_URL` está configurada en Vercel
- [ ] La URL es `https://` (no `http://`)
- [ ] La URL NO es `localhost` o `127.0.0.1`
- [ ] La URL NO tiene `/` al final
- [ ] La variable está disponible en Production, Preview y Development

### **Railway**
- [ ] El proyecto OCR existe en Railway Dashboard
- [ ] El servicio está desplegado (Status: "Deployed")
- [ ] Los logs no muestran errores críticos
- [ ] La URL del servicio es accesible públicamente
- [ ] El endpoint `/process-pdf` responde (aunque sea con error 400)

### **Conectividad**
- [ ] Puedo hacer ping a Railway desde mi navegador
- [ ] Railway no está en mantenimiento (https://railway.app/status)
- [ ] No hay firewall bloqueando Vercel → Railway
- [ ] El tiempo de respuesta es < 15 segundos

### **Código**
- [ ] El microservicio OCR tiene el código correcto
- [ ] Las dependencias están instaladas (tesseract.js, pdf-parse)
- [ ] El formato de respuesta JSON es correcto
- [ ] No hay errores de sintaxis en los logs

---

## 🚀 **SOLUCIONES A LARGO PLAZO**

### **1. Implementar keep-alive para Railway (30 minutos)**

**Crear endpoint `/health` en el microservicio:**
```javascript
// En el servidor OCR (Railway)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});
```

**Configurar UptimeRobot (gratis):**
1. Ir a: https://uptimerobot.com/
2. Crear cuenta
3. Add New Monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://tu-servicio.railway.app/health`
   - Monitoring Interval: 5 minutes
4. Save

Esto hará ping cada 5 minutos y evitará cold starts.

---

### **2. Agregar retry logic (15 minutos)**

**Modificar `/api/ocr/route.ts`:**

```typescript
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const waitTime = 2000 * (i + 1); // 2s, 4s, 6s
      console.log(`🔄 Reintento ${i + 1}/${retries} en ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Todos los reintentos fallaron');
}

// Usar en lugar de fetch directo:
upstream = await fetchWithRetry(url, { 
  method: 'POST', 
  body: upstreamForm, 
  signal: controller.signal 
});
```

---

### **3. Implementar logging detallado (20 minutos)**

Esto te permitirá **diagnosticar exactamente dónde falla** el proceso.

**Ver:** `DIAGNOSTICO_RAILWAY_OCR.md` → Sección "Paso 5: Implementar logging detallado"

Esto agregará logs como:
```
🔵 [OCR] Inicio de procesamiento
🔵 [OCR] PDF_PROCESSOR_URL: ✅ Configurada
🔵 [OCR] URL base procesada: https://tu-servicio.railway.app
🔵 [OCR] Archivo recibido: ✅ curriculum.pdf (2.3 MB)
🔵 [OCR] Enviando petición a Railway: https://tu-servicio.railway.app/process-pdf
🟢 [OCR] Respuesta recibida de Railway: 200
🟢 [OCR] Datos extraídos: CURP ✅, RFC ✅, CVU ✅, Email ✅
🟢 [OCR] Proceso completado en 8547ms
```

---

### **4. Considerar alternativas a Railway (1-2 días)**

Si Railway sigue siendo problemático, considera:

**Opción A: Render.com (similar a Railway)**
- Plan gratuito
- Sin cold starts en plan pagado ($7/mes)
- Mejor estabilidad que Railway

**Opción B: Vercel Edge Functions**
- Integrado con tu proyecto actual
- Sin servidores externos
- Más complejo de configurar (Tesseract.js en WebAssembly)

**Opción C: AWS Lambda + API Gateway**
- Más robusto para producción
- Más complejo de configurar
- Costo variable según uso

---

## 📞 **PRÓXIMOS PASOS RECOMENDADOS**

### **Ahora mismo (10 minutos):**
1. ✅ Ejecutar: `.\scripts\test-railway-ocr.ps1 -Url "https://tu-servicio.railway.app"`
2. ✅ Revisar logs de Railway
3. ✅ Verificar `PDF_PROCESSOR_URL` en Vercel

### **Hoy (30 minutos):**
4. ⚙️ Configurar UptimeRobot para keep-alive
5. ⚙️ Aumentar timeout a 90-120 segundos
6. ⚙️ Implementar logging detallado

### **Esta semana (2-3 horas):**
7. 🔧 Agregar retry logic
8. 🔧 Crear endpoint `/health` en el microservicio
9. 🔧 Evaluar upgrade a Railway Pro o migración a Render

---

## 🎯 **CONCLUSIÓN**

**Sí, Railway es muy probablemente el problema** por las siguientes razones:

1. ✅ Es el único servicio externo crítico en el flujo de registro
2. ⚠️ Tiene problemas comunes (cold starts, timeouts, recursos limitados)
3. 🔴 El directorio `ocr-server/` está vacío → no hay código del servicio en el repo
4. 📊 Los síntomas reportados (usuarios no pueden registrarse con CV) coinciden con fallos de OCR

**La solución más rápida:** Verificar que Railway esté desplegado y configurar keep-alive con UptimeRobot.

---

## 📚 **DOCUMENTACIÓN ADICIONAL**

- **Diagnóstico completo:** `DIAGNOSTICO_RAILWAY_OCR.md`
- **Scripts de prueba:**
  - Windows: `scripts/test-railway-ocr.ps1`
  - Linux/Mac: `scripts/test-railway-ocr.sh`

---

**¿Necesitas ayuda con alguno de estos pasos?** 🚀

Puedo ayudarte a:
- Crear el código del microservicio OCR si no existe
- Configurar el keep-alive
- Implementar logging detallado
- Migrar a otra plataforma si es necesario

