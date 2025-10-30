# 📚 ÍNDICE: Documentación sobre Railway OCR

Esta es una guía completa para entender, diagnosticar y solucionar problemas con el servicio OCR en Railway.

---

## 📋 **RESPUESTA RÁPIDA A TU PREGUNTA**

**Pregunta:** *"¿Crees que el problema de los usuarios sea que Railway está fallando?"*

**Respuesta:** **SÍ, es muy probable.** 🔴

**Documentación relevante:**
- 👉 **EMPIEZA AQUÍ:** `RESUMEN_PROBLEMA_RAILWAY.md`

---

## 📂 **DOCUMENTOS CREADOS**

### **1. RESUMEN_PROBLEMA_RAILWAY.md** 🎯
**Descripción:** Respuesta ejecutiva a tu pregunta, con análisis rápido y plan de acción

**Contenido:**
- ✅ Respuesta directa: ¿Es Railway el problema?
- ✅ Evidencia de por qué Railway es un punto crítico
- ✅ 7 problemas comunes de Railway identificados
- ✅ Plan de acción inmediato (10-30 minutos)
- ✅ Soluciones temporales si Railway está caído
- ✅ Checklist de diagnóstico
- ✅ Soluciones a largo plazo

**Cuándo leerlo:** **AHORA** - Es el punto de partida

---

### **2. DIAGNOSTICO_RAILWAY_OCR.md** 🔍
**Descripción:** Análisis técnico profundo del servicio OCR y sus puntos de falla

**Contenido:**
- 🏗️ Arquitectura completa del flujo OCR
- 🚨 7 puntos de falla identificados (con código)
- 🛠️ Plan de acción para diagnosticar (5 pasos)
- 📋 Checklist de verificación
- 🎯 Recomendaciones finales
- 📞 Próximos pasos

**Cuándo leerlo:** Después del resumen, si necesitas detalles técnicos

---

### **3. scripts/test-railway-ocr.ps1** 🧪
**Descripción:** Script de diagnóstico automático para Windows PowerShell

**Funcionalidad:**
- ✅ Verifica conectividad con Railway
- ✅ Prueba endpoint `/health`
- ✅ Mide tiempo de respuesta (detecta cold starts)
- ✅ Verifica endpoint `/process-pdf`
- ✅ Revisa configuración y headers
- ✅ Genera reporte de diagnóstico

**Cómo usarlo:**
```powershell
.\scripts\test-railway-ocr.ps1 -Url "https://tu-servicio.railway.app"
```

**Cuándo usarlo:** Antes de revisar logs o hacer cambios, para tener un diagnóstico rápido

---

### **4. scripts/test-railway-ocr.sh** 🧪
**Descripción:** Script de diagnóstico automático para Linux/Mac

**Funcionalidad:** Igual que la versión PowerShell, pero para sistemas Unix

**Cómo usarlo:**
```bash
chmod +x scripts/test-railway-ocr.sh
./scripts/test-railway-ocr.sh https://tu-servicio.railway.app
```

---

### **5. ocr-server/server.js** 🖥️
**Descripción:** Código completo del microservicio OCR para Railway

**Características:**
- ✅ Servidor Express con endpoints REST
- ✅ Procesamiento de PDFs con `pdf-parse`
- ✅ Extracción automática de: CURP, RFC, CVU, email, teléfono, nombre, institución
- ✅ Logging detallado con emojis
- ✅ Validaciones y manejo de errores
- ✅ Límite de 10 MB por archivo
- ✅ Health check endpoint

**Cuándo usarlo:** Si el servicio no está desplegado o necesitas redeployar

---

### **6. ocr-server/package.json** 📦
**Descripción:** Dependencias del microservicio OCR

**Dependencias principales:**
- `express` - Servidor HTTP
- `multer` - Manejo de archivos
- `pdf-parse` - Extracción de texto de PDFs
- `tesseract.js` - OCR (opcional, para PDFs escaneados)
- `cors` - Control de acceso entre dominios

---

### **7. ocr-server/README.md** 📖
**Descripción:** Documentación completa del microservicio OCR

**Contenido:**
- 📋 Características
- 🚀 3 formas de desplegar en Railway
- ⚙️ Configuración de variables de entorno
- 🔗 Configuración en Vercel
- 🧪 Pruebas locales
- 📡 Documentación de endpoints
- 🔍 Diagnóstico de problemas comunes
- 📊 Monitoreo y métricas
- 🛠️ Guía de desarrollo

**Cuándo leerlo:** Si vas a desplegar o modificar el servicio

---

### **8. ocr-server/DEPLOY_RAILWAY.md** 🚀
**Descripción:** Guía paso a paso para desplegar el microservicio en Railway

**Contenido:**
- 📋 Prerrequisitos
- 🎯 Paso 1: Preparar el código
- 🚂 Paso 2: Crear proyecto en Railway
- ⚙️ Paso 3: Configurar variables de entorno
- 🔗 Paso 4: Configurar Vercel
- ✅ Paso 5: Verificar que funciona
- 🛡️ Paso 6: Configurar keep-alive (UptimeRobot)
- 📊 Paso 7: Monitoreo continuo
- 🐛 Solución de problemas
- 💰 Costos (plan gratuito vs pro)
- ✅ Checklist final

**Cuándo leerlo:** Cuando estés listo para desplegar o redeplegar

---

### **9. ocr-server/.gitignore** 🚫
**Descripción:** Archivos a ignorar en el repositorio del microservicio

**Excluye:**
- `node_modules/`
- `.env` y variables de entorno
- Logs
- Archivos de prueba (PDFs)
- Configuraciones de IDEs

---

## 🚀 **FLUJO DE TRABAJO RECOMENDADO**

### **Si tienes problemas AHORA (URGENTE):**

```
1. Lee: RESUMEN_PROBLEMA_RAILWAY.md
   ├─ Sección: "Plan de Acción Inmediato"
   └─ Sigue los pasos 1-4 (15 minutos)

2. Ejecuta: scripts/test-railway-ocr.ps1
   └─ Esto te dirá si Railway está funcionando

3. Si Railway NO está funcionando:
   ├─ Opción A: Desplegar con DEPLOY_RAILWAY.md
   └─ Opción B: Solución temporal (deshabilitar OCR)

4. Si Railway está funcionando pero hay errores:
   ├─ Lee: DIAGNOSTICO_RAILWAY_OCR.md
   └─ Revisa los 7 puntos de falla
```

---

### **Si vas a desplegar Railway desde cero:**

```
1. Lee: ocr-server/README.md
   └─ Sección: "Características" y "Pruebas Locales"

2. Prueba localmente (opcional):
   ├─ cd ocr-server
   ├─ npm install
   └─ npm start

3. Sigue: ocr-server/DEPLOY_RAILWAY.md
   └─ Pasos 1-7 (30-45 minutos)

4. Verifica con: scripts/test-railway-ocr.ps1

5. Configura keep-alive:
   └─ UptimeRobot (5 minutos)
```

---

### **Si necesitas entender el problema a fondo:**

```
1. Lee: RESUMEN_PROBLEMA_RAILWAY.md
   └─ Para contexto general

2. Lee: DIAGNOSTICO_RAILWAY_OCR.md
   └─ Para análisis técnico detallado

3. Revisa: app/api/ocr/route.ts
   └─ Para ver cómo el frontend llama a Railway

4. Revisa: ocr-server/server.js
   └─ Para ver cómo Railway procesa los PDFs
```

---

## 🎯 **ACCIÓN INMEDIATA RECOMENDADA**

**¿Qué hacer AHORA? (Siguiente 30 minutos)**

### **Paso 1: Verificar si Railway existe (5 minutos)**

1. Ir a: https://railway.app/dashboard
2. ¿Ves un proyecto llamado "OCR" o similar?
   - ✅ **SÍ** → Ve al Paso 2
   - ❌ **NO** → El servicio NO está desplegado, ve al Paso 3

### **Paso 2: Probar el servicio (5 minutos)**

```powershell
# Ejecutar desde la raíz del proyecto:
.\scripts\test-railway-ocr.ps1 -Url "https://tu-servicio.railway.app"
```

**Resultado:**
- ✅ **Funciona** → Ve al Paso 4
- ❌ **No funciona** → Ve al Paso 3

### **Paso 3: Desplegar Railway (30 minutos)**

Sigue: `ocr-server/DEPLOY_RAILWAY.md`

### **Paso 4: Configurar Vercel (5 minutos)**

1. Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. Verificar que existe: `PDF_PROCESSOR_URL`
3. Si no existe o es incorrecta, agregar/actualizar
4. Redeploy

### **Paso 5: Configurar Keep-Alive (10 minutos)**

1. Ir a: https://uptimerobot.com/
2. Crear monitor para: `https://tu-servicio.railway.app/health`
3. Intervalo: 5 minutos

---

## 📊 **TABLA DE DECISIÓN RÁPIDA**

| Situación | Acción Inmediata | Documento |
|-----------|------------------|-----------|
| 🔴 **"Los usuarios no pueden registrarse con CV"** | 1. Ejecutar script diagnóstico<br>2. Revisar logs de Railway | `RESUMEN_PROBLEMA_RAILWAY.md` |
| 🟡 **"Railway existe pero responde lento"** | Configurar UptimeRobot (keep-alive) | `DEPLOY_RAILWAY.md` → Paso 6 |
| 🟠 **"Error: PDF_PROCESSOR_URL no está definida"** | Configurar variable en Vercel | `DEPLOY_RAILWAY.md` → Paso 4 |
| 🔴 **"Railway no existe o está caído"** | Desplegar desde cero | `DEPLOY_RAILWAY.md` |
| 🟢 **"Quiero entender cómo funciona"** | Leer arquitectura completa | `DIAGNOSTICO_RAILWAY_OCR.md` |
| 🔵 **"Necesito modificar el OCR"** | Revisar código y documentación | `ocr-server/server.js`<br>`ocr-server/README.md` |

---

## 💡 **PREGUNTAS FRECUENTES**

### **¿Por qué Railway y no otra cosa?**

Railway fue elegido porque:
- ✅ Fácil de desplegar (Git push automático)
- ✅ Plan gratuito generoso (500 hrs/mes)
- ✅ Soporta Node.js out-of-the-box
- ✅ Buena integración con Vercel

**Alternativas:** Render, Fly.io, AWS Lambda, Vercel Edge Functions

---

### **¿Cuánto cuesta Railway?**

- **Plan Gratuito:** $0/mes
  - 500 horas de ejecución/mes
  - 512 MB de RAM
  - ⚠️ Cold starts tras inactividad

- **Plan Pro:** $5/mes
  - Horas ilimitadas
  - 8 GB de RAM
  - Sin cold starts

**Recomendación:** Empezar con gratuito + UptimeRobot. Upgrade si hay muchos usuarios.

---

### **¿Qué pasa si Railway se cae?**

**Solución temporal (5 minutos):**

Editar `app/api/ocr/route.ts`:
```typescript
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Extracción automática temporalmente no disponible. Completa el formulario manualmente.',
      curp: null, rfc: null, no_cvu: null, correo: null, telefono: null
    },
    { status: 503 }
  );
}
```

Esto permitirá que los usuarios **completen el formulario manualmente** mientras arreglas Railway.

---

### **¿Cómo sé si Railway es el problema?**

Ejecuta el script de diagnóstico:
```powershell
.\scripts\test-railway-ocr.ps1 -Url "https://tu-servicio.railway.app"
```

Si todos los tests pasan → Railway funciona, busca el problema en otro lado.

Si algún test falla → Railway es el problema, sigue `RESUMEN_PROBLEMA_RAILWAY.md`.

---

## 🎓 **GLOSARIO**

- **Railway:** Plataforma de hosting para aplicaciones (similar a Heroku)
- **OCR:** Optical Character Recognition (reconocimiento óptico de caracteres)
- **Cold Start:** Tiempo que tarda un servicio en arrancar después de estar inactivo
- **Keep-Alive:** Técnica para mantener un servicio activo haciendo pings periódicos
- **UptimeRobot:** Servicio gratuito que monitorea uptime y hace pings
- **Microservicio:** Aplicación pequeña e independiente con una función específica
- **CURP:** Clave Única de Registro de Población (identificador mexicano)
- **RFC:** Registro Federal de Contribuyentes (identificador fiscal mexicano)
- **CVU:** Código de Verificación Único (CONACYT)

---

## 📞 **SOPORTE**

Si después de revisar toda esta documentación aún tienes dudas:

1. ✅ Ejecuta el script de diagnóstico
2. ✅ Revisa logs de Railway y Vercel
3. ✅ Consulta el documento correspondiente según tu situación
4. ✅ Verifica el checklist de diagnóstico

**Documentos clave:**
- `RESUMEN_PROBLEMA_RAILWAY.md` - Para diagnóstico rápido
- `DIAGNOSTICO_RAILWAY_OCR.md` - Para análisis técnico
- `DEPLOY_RAILWAY.md` - Para despliegue paso a paso

---

## ✅ **CHECKLIST FINAL**

Antes de dar por resuelto el problema de Railway, verifica:

- [ ] Railway está desplegado y activo
- [ ] Script de diagnóstico pasa todos los tests
- [ ] Variable `PDF_PROCESSOR_URL` configurada en Vercel
- [ ] UptimeRobot configurado (keep-alive)
- [ ] Health check responde OK
- [ ] Logs de Railway no muestran errores
- [ ] Test funcional: Subir CV desde `/registro` funciona
- [ ] Campos se auto-llenan correctamente

---

**¡Éxito!** 🎉

