# 🚀 Guía de Deploy en Railway

Esta guía te ayudará a desplegar el microservicio OCR en Railway paso a paso.

---

## 📋 **Prerrequisitos**

- [ ] Cuenta en Railway (https://railway.app - gratis)
- [ ] Repositorio de GitHub con el código
- [ ] Cuenta en Vercel con tu proyecto SEI desplegado

---

## 🎯 **Paso 1: Preparar el Código**

### **1.1. Verificar archivos**

Asegúrate de que estos archivos existan en `ocr-server/`:

```
ocr-server/
  ├── server.js          ✅
  ├── package.json       ✅
  ├── README.md          ✅
  └── .gitignore         ✅
```

### **1.2. Commit y push**

```bash
git add ocr-server/
git commit -m "feat: Agregar microservicio OCR para Railway"
git push origin main
```

---

## 🚂 **Paso 2: Crear Proyecto en Railway**

### **2.1. Crear cuenta/Login**

1. Ve a: https://railway.app/
2. Click en **"Login"**
3. Inicia sesión con GitHub

### **2.2. Crear nuevo proyecto**

1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Si es la primera vez, autoriza a Railway a acceder a tu GitHub
4. Busca y selecciona tu repositorio: `I2Cprogramacion/SEI`

### **2.3. Configurar el proyecto**

1. Railway detectará automáticamente que es un proyecto Node.js
2. En **"Settings"** del servicio:
   - **Root Directory:** `ocr-server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Click en **"Deploy"**

---

## ⚙️ **Paso 3: Configurar Variables de Entorno**

### **3.1. En Railway**

1. Click en tu servicio → Tab **"Variables"**
2. Agrega las siguientes variables:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://tu-app.vercel.app` |

**Nota:** Railway asigna automáticamente el `PORT`, no lo configures manualmente.

3. Click en **"Deploy"** para aplicar cambios

### **3.2. Obtener la URL pública**

1. Ve a tu servicio → Tab **"Settings"**
2. Sección **"Networking"**
3. Click en **"Generate Domain"**
4. Copia la URL generada (ej: `https://tu-proyecto-production.up.railway.app`)

---

## 🔗 **Paso 4: Configurar Vercel**

### **4.1. Agregar variable de entorno**

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **SEI**
3. Settings → **Environment Variables**
4. Click en **"Add New"**
5. Configura:
   - **Name:** `PDF_PROCESSOR_URL`
   - **Value:** `https://tu-proyecto-production.up.railway.app` (la URL de Railway)
   - **Environments:** Marca ✅ Production, ✅ Preview, ✅ Development
6. Click en **"Save"**

### **4.2. Redeploy en Vercel**

1. Ve a tu proyecto → Tab **"Deployments"**
2. Click en el deployment más reciente → **"..."** → **"Redeploy"**
3. Espera a que termine el deploy

---

## ✅ **Paso 5: Verificar que Funciona**

### **5.1. Test del servicio Railway**

**Opción A: Usar el script de diagnóstico (Windows)**
```powershell
.\scripts\test-railway-ocr.ps1 -Url "https://tu-proyecto-production.up.railway.app"
```

**Opción B: Prueba manual**
```bash
# Health check
curl https://tu-proyecto-production.up.railway.app/health

# Debe responder:
# {"status":"ok","timestamp":1730289600000,"uptime":123.45}
```

### **5.2. Test desde Vercel**

1. Ve a tu aplicación: `https://tu-app.vercel.app`
2. Navega a: `/registro`
3. Completa el formulario
4. En la sección "Subir CV":
   - Selecciona un archivo PDF
   - Click en **"Subir CV"**
   - Espera a que se procese (puede tardar 10-30 segundos)
   - Verifica que los campos se auto-llenen (CURP, RFC, CVU, email, teléfono)

### **5.3. Revisar logs**

**En Railway:**
1. Ve a tu servicio → Tab **"Logs"**
2. Busca líneas con:
   - `🔵 [OCR] Nueva petición recibida`
   - `✅ [OCR] Procesamiento completado exitosamente`
3. Verifica que no haya errores `🔴`

**En Vercel:**
1. Ve a tu proyecto → Tab **"Logs"**
2. Busca por `[OCR]`
3. Verifica el flujo completo

---

## 🛡️ **Paso 6: Configurar Keep-Alive (Evitar Cold Starts)**

Railway (plan gratuito) apaga tu servicio tras 5-10 minutos de inactividad. Para evitarlo:

### **6.1. Crear cuenta en UptimeRobot**

1. Ve a: https://uptimerobot.com/
2. Crea cuenta gratuita
3. Confirma tu email

### **6.2. Agregar monitor**

1. Click en **"Add New Monitor"**
2. Configura:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** SEI OCR Service
   - **URL:** `https://tu-proyecto-production.up.railway.app/health`
   - **Monitoring Interval:** 5 minutes
3. Click en **"Create Monitor"**

### **6.3. Verificar**

1. Espera 5 minutos
2. Ve a tu monitor en UptimeRobot
3. Verifica que esté en estado **"Up"** (verde)
4. Ahora tu servicio se mantendrá activo 24/7

---

## 📊 **Paso 7: Monitoreo Continuo**

### **7.1. Dashboard de Railway**

- **Métricas:** Ve a tu servicio → Tab "Metrics"
  - CPU Usage
  - Memory Usage
  - Network Traffic

- **Logs:** Tab "Logs"
  - Filtra por `[OCR]` para ver actividad
  - Busca errores con `🔴`

### **7.2. Alertas en UptimeRobot**

1. En tu monitor → **"Edit"**
2. Sección **"Alert Contacts"**
3. Agrega tu email o Slack
4. Recibirás notificaciones si el servicio se cae

---

## 🐛 **Solución de Problemas**

### **Error: "PDF_PROCESSOR_URL no está definida"**

**Causa:** Variable de entorno no configurada en Vercel

**Solución:**
1. Vercel Dashboard → Settings → Environment Variables
2. Agregar `PDF_PROCESSOR_URL`
3. Redeploy

---

### **Error: "Backend OCR 502: sin cuerpo"**

**Causa:** Railway no responde o está caído

**Solución:**
1. Verificar logs de Railway
2. Verificar que el servicio esté desplegado
3. Probar manualmente: `curl https://tu-proyecto.up.railway.app/health`

---

### **Error: "Timeout" o tarda más de 55 segundos**

**Causa:** Cold start o PDF muy grande

**Solución:**
1. Configurar keep-alive con UptimeRobot (Paso 6)
2. Aumentar timeout en `/api/ocr/route.ts`:
   ```typescript
   const timeout = setTimeout(() => controller.abort(), 90_000);
   ```

---

### **Error: "Out of Memory"**

**Causa:** Railway (plan gratuito) tiene 512 MB de RAM

**Solución:**
1. Upgrade a Railway Pro ($5/mes) → 8 GB de RAM
2. O optimizar el código para usar menos memoria

---

## 💰 **Costos**

### **Plan Gratuito (Railway)**

- ✅ 500 horas de ejecución/mes (suficiente para keep-alive)
- ✅ 512 MB de RAM
- ✅ CPU compartida
- ⚠️ Cold starts tras inactividad
- ⚠️ Servicio puede suspenderse tras 3 meses sin actividad

### **Railway Pro ($5/mes)**

- ✅ Horas ilimitadas
- ✅ 8 GB de RAM
- ✅ CPU dedicada
- ✅ Sin cold starts
- ✅ Mejor rendimiento

---

## 📚 **Recursos Adicionales**

- **Documentación de Railway:** https://docs.railway.app/
- **Diagnóstico completo:** `DIAGNOSTICO_RAILWAY_OCR.md`
- **Resumen del problema:** `RESUMEN_PROBLEMA_RAILWAY.md`
- **Script de prueba:** `scripts/test-railway-ocr.ps1`

---

## ✅ **Checklist Final**

Antes de dar por terminado el deploy, verifica:

- [ ] Railway: Servicio desplegado y en estado "Active"
- [ ] Railway: Logs muestran "🚀 Microservicio OCR iniciado"
- [ ] Railway: URL pública accesible
- [ ] Vercel: Variable `PDF_PROCESSOR_URL` configurada
- [ ] Vercel: Proyecto redeployado después de agregar la variable
- [ ] UptimeRobot: Monitor configurado y funcionando
- [ ] Test manual: Health check responde OK
- [ ] Test funcional: Subir CV desde `/registro` funciona
- [ ] Logs: No hay errores en Railway ni Vercel

---

## 🎉 **¡Listo!**

Tu microservicio OCR está desplegado y funcionando en Railway. Los usuarios ahora pueden:

1. Subir su CV en PDF
2. El OCR extraerá automáticamente: CURP, RFC, CVU, email, teléfono, etc.
3. El formulario se auto-llenará
4. El usuario completa los datos faltantes
5. Se guarda en la base de datos

---

**¿Problemas?** Consulta `DIAGNOSTICO_RAILWAY_OCR.md` o ejecuta el script de diagnóstico.

