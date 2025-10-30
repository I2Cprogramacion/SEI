# 📋 ANÁLISIS DEL FLUJO DE REGISTRO (Actualizado)

## 🎯 **RESUMEN EJECUTIVO**

Análisis del flujo de registro después del último pull. Se identificaron mejoras importantes y algunos puntos de atención.

**Estado:** ✅ Funcional con mejoras recientes

---

## 🔄 **FLUJO COMPLETO DE REGISTRO**

### **Diagrama del Flujo**

```
👤 Usuario accede a /registro
    ↓
📄 Opción 1: Subir CV en PDF (Perfil Único)
    ↓
📤 Usuario selecciona archivo PDF
    ↓
🔘 Click en "Procesar Perfil Único"
    ↓
🚀 handlePDFUpload() ejecutado
    ↓
📡 POST /api/ocr con FormData
    ↓ [Timeout: 30 segundos]
    ↓
🔗 /api/ocr → Railway Microservicio
    ↓ [Timeout: 55 segundos en backend]
    ↓
🤖 OCR extrae: CURP, RFC, CVU, correo, teléfono, nombre
    ↓
✅ Respuesta JSON con datos extraídos
    ↓
🧹 sanitizeOcrData() limpia y normaliza datos
    ↓
📝 Auto-llenado del formulario
    ↓
💾 handleSavePDFAsCV() guarda PDF en Cloudinary (como CV)
    ↓
✅ ocrCompleted = true
    ↓
👁️ Usuario revisa y completa datos faltantes
    ↓
🔘 Click en "Registrar"
    ↓
🔐 handleSubmit() ejecutado
    ↓
🔍 Validaciones:
    ├─ Rate limiting (3 intentos máx, lockout 1 min)
    ├─ CAPTCHA (⚠️ DESHABILITADO)
    ├─ Campos vacíos
    ├─ Contraseña (score >= 4)
    └─ Contraseñas coinciden
    ↓
👥 Crear usuario en Clerk
    ├─ signUp.create(email, password)
    ├─ prepareEmailAddressVerification()
    └─ Obtener clerk_user_id
    ↓
📡 POST /api/registro
    ↓
🔍 Validaciones backend:
    ├─ CAPTCHA (⚠️ DESHABILITADO)
    ├─ correo obligatorio
    ├─ nombre_completo obligatorio
    └─ Normalización de campos
    ↓
💾 guardarInvestigador() en PostgreSQL
    ↓
✅ Registro exitoso
    ↓
📧 Verificación de email
    ↓
🏠 Redirección a /registro/exito
```

---

## 📝 **CAMBIOS RECIENTES IDENTIFICADOS**

### **1. Mejoras en `/app/registro/page.tsx`**

#### **Cambio 1: Timeout reducido para OCR** ⏱️

```typescript
// ANTES: (probablemente 60s o sin timeout)
// AHORA:
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos
```

**Análisis:**
- ✅ **Pro:** Evita esperas largas si Railway está caído
- ⚠️ **Contra:** 30 segundos puede ser insuficiente si Railway está en cold start
- 🔴 **Problema potencial:** Timeout frontend (30s) + Timeout backend (55s) = inconsistencia

**Recomendación:** Aumentar a 60 segundos para alinearse con el backend

---

#### **Cambio 2: Auto-guardado del PDF como CV** 💾

```typescript
// Línea 847-848
// Guardar el PDF como Perfil Único automáticamente
await handleSavePDFAsCV()
```

**Análisis:**
- ✅ **Excelente mejora:** Ahora el PDF se guarda automáticamente en Cloudinary
- ✅ Elimina un paso manual para el usuario
- ✅ El CV queda disponible inmediatamente

**Flujo:**
1. OCR extrae datos del PDF
2. Auto-llena formulario
3. **Automáticamente** sube el PDF a Cloudinary como CV
4. Guarda la URL en `formData.cv_url`

---

#### **Cambio 3: Manejo mejorado de errores OCR** 🛡️

```typescript
// Línea 889-892
if (!ocrCompleted) {
  setError("El procesamiento automático de perfil (OCR) no está disponible temporalmente. Por favor, captura tus datos manualmente. Puedes continuar con el registro.")
  // Permitir continuar aunque el OCR no esté disponible
}
```

**Análisis:**
- ✅ **Excelente:** Ahora permite registro manual si OCR falla
- ✅ No bloquea el registro completo
- ✅ Mensaje claro para el usuario

---

#### **Cambio 4: Validación de campos dinámicos** 📋

```typescript
// Línea 644-645
// Campos requeridos dinámicos según tipo de perfil
// Definir exactamente 17 campos requeridos, contando solo linea_investigacion y area_investigacion como un campo cada uno
```

**Análisis:**
- ✅ Campos requeridos ajustados según tipo de perfil
- ✅ Mejor UX: no pide campos irrelevantes

---

### **2. Mejoras en `/app/api/registro/route.ts`**

#### **Cambio 1: Normalización de campos** 🧹

```typescript
// Líneas 70-87
const camposTabla = [
  "nombre_completo", "nombres", "apellidos", "correo", "clerk_user_id",
  "linea_investigacion", "area_investigacion", "institucion", "fotografia_url",
  // ... (todos los campos de la tabla)
];

// Eliminar campos no válidos
const datosRegistro: any = {};
for (const campo of camposTabla) {
  datosRegistro[campo] = data[campo] !== undefined ? data[campo] : null;
}
```

**Análisis:**
- ✅ **Excelente mejora:** Solo campos válidos de la tabla
- ✅ Evita errores de "columna no existe"
- ✅ Todos los campos se inicializan con `null` si no existen

---

#### **Cambio 2: Auto-construcción de `nombre_completo`** 👤

```typescript
// Líneas 106-109
if (!datosRegistro.nombre_completo && datosRegistro.nombres && datosRegistro.apellidos) {
  datosRegistro.nombre_completo = `${datosRegistro.nombres} ${datosRegistro.apellidos}`.trim();
  console.log("✅ nombre_completo construido desde nombres + apellidos:", datosRegistro.nombre_completo);
}
```

**Análisis:**
- ✅ **Muy útil:** Si falta `nombre_completo`, lo construye automáticamente
- ✅ Reduce errores de validación
- ✅ Lógica duplicada (también en líneas 154-157) como fallback

---

#### **Cambio 3: CAPTCHA deshabilitado** 🔒

```typescript
// Líneas 117-145
// 🔒 VERIFICACIÓN DE CAPTCHA DESHABILITADA TEMPORALMENTE
// const captchaToken = data.captchaToken || data.recaptcha
// ... código comentado ...
console.log("⚠️ CAPTCHA DESHABILITADO - Continuando sin verificación...")
```

**Análisis:**
- ⚠️ **IMPORTANTE:** CAPTCHA está deshabilitado
- 🔴 **Riesgo:** Vulnerable a spam/bots
- ✅ Facilita pruebas en desarrollo
- 🚨 **RECOMENDACIÓN:** Re-habilitar en producción

---

#### **Cambio 4: Manejo mejorado de duplicados** ♻️

```typescript
// Líneas 180-186
if (resultado.success) {
  return NextResponse.json({
    success: true,
    message: resultado.message,
    id: resultado.id,
  })
} else {
  // Error de duplicado o validación
  return NextResponse.json({
    success: false,
    message: resultado.message,
    duplicado: !resultado.success,
  }, { status: 409 }) // 409 Conflict para duplicados
}
```

**Análisis:**
- ✅ **Excelente:** Código HTTP 409 para duplicados
- ✅ Frontend puede diferenciar entre errores
- ✅ Mejor experiencia de usuario

---

### **3. Mejoras en `/app/api/investigadores/perfil/route.ts`**

#### **Cambio 1: Búsqueda simplificada solo por correo** 📧

```typescript
// Líneas 25-66
// Buscar solo por correo
const result = await db.query(`
  SELECT 
    id,
    COALESCE(nombre_completo, '') AS nombre_completo,
    // ... todos los campos con COALESCE ...
  FROM investigadores 
  WHERE correo = $1
  LIMIT 1
`, [email]);
```

**Análisis:**
- ✅ **Simplificado:** Solo busca por correo (antes buscaba por clerk_user_id también)
- ✅ **Más robusto:** COALESCE asegura que nunca haya valores NULL
- ✅ Todos los campos tienen valores por defecto ('' para strings)

---

#### **Cambio 2: Lógica de perfil completo mejorada** ✅

```typescript
// Líneas 76-85
const camposClave = [
  'nombre_completo', 'correo', 'empleo_actual', 'cv_url',
  'area_investigacion', 'linea_investigacion', 'telefono',
  'nacionalidad', 'genero', 'municipio'
];
const perfilCompleto = camposClave.every(
  (campo) => perfil[campo] && typeof perfil[campo] === 'string' && perfil[campo].trim() !== ''
);
```

**Análisis:**
- ✅ **Mejor definición:** 10 campos clave específicos
- ✅ Valida que sean strings no vacíos
- ✅ Frontend sabe si el perfil está completo

---

## 🚨 **PROBLEMAS IDENTIFICADOS**

### **Problema 1: Inconsistencia en timeouts** ⏱️

**Frontend:** 30 segundos
```typescript
const timeoutId = setTimeout(() => controller.abort(), 30000) // app/registro/page.tsx
```

**Backend (API):** 55 segundos
```typescript
const timeout = setTimeout(() => controller.abort(), 55_000); // app/api/ocr/route.ts
```

**Problema:**
- Si Railway tarda 40 segundos, el frontend ya abortó
- Usuario ve error, pero backend sigue procesando

**Solución:**
```typescript
// Cambiar en app/registro/page.tsx línea 811:
const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos
```

---

### **Problema 2: CAPTCHA deshabilitado en producción** 🔒

**Ubicación:**
- `app/registro/page.tsx` - líneas 880-887 (comentado)
- `app/api/registro/route.ts` - líneas 117-145 (comentado)

**Riesgo:**
- Registro masivo de bots
- Spam en la base de datos
- Abuso del servicio

**Solución:**
```typescript
// Re-habilitar CAPTCHA:
// 1. Descomentar código de CAPTCHA
// 2. Configurar RECAPTCHA_SECRET en variables de entorno
// 3. Configurar NEXT_PUBLIC_RECAPTCHA_SITE_KEY
```

---

### **Problema 3: Railway puede ser un cuello de botella** 🚧

**Evidencia:**
```typescript
// Si OCR falla, muestra:
"El procesamiento automático de perfil (OCR) no está disponible temporalmente"
```

**Problema:**
- Si Railway está caído → OCR no funciona
- Usuarios deben llenar todo manualmente
- Experiencia de usuario degradada

**Solución:**
- Implementar keep-alive (UptimeRobot)
- Aumentar timeout
- Considerar servicio de backup

**Ver:** `RESUMEN_PROBLEMA_RAILWAY.md` para soluciones detalladas

---

### **Problema 4: Doble lógica para construir `nombre_completo`** 🔄

**Ubicación:**
- `app/api/registro/route.ts` líneas 106-109
- `app/api/registro/route.ts` líneas 154-157

**Problema:**
- Código duplicado
- Puede causar inconsistencias

**Solución:**
```typescript
// Consolidar en una sola función
function construirNombreCompleto(data: any): string {
  if (data.nombre_completo) return data.nombre_completo.trim();
  if (data.nombres && data.apellidos) {
    return `${data.nombres} ${data.apellidos}`.trim();
  }
  return '';
}

// Usar:
datosRegistro.nombre_completo = construirNombreCompleto(data);
```

---

## ✅ **VALIDACIONES IMPLEMENTADAS**

### **Frontend (app/registro/page.tsx)**

✅ Rate limiting (3 intentos, lockout 1 min)  
✅ Campos vacíos detectados  
✅ Validación de email (contiene @)  
✅ Contraseña fuerte (score >= 4)  
✅ Contraseñas coinciden  
✅ Archivo PDF válido (max 2MB)  
⚠️ CAPTCHA (deshabilitado)  

### **Backend (app/api/registro/route.ts)**

✅ Correo obligatorio  
✅ `nombre_completo` obligatorio (auto-construido si falta)  
✅ Normalización de campos (solo campos válidos de la tabla)  
✅ Valores por defecto (`activo = true`, `es_admin = false`)  
✅ Fecha de registro automática  
✅ Detección de duplicados (HTTP 409)  
⚠️ CAPTCHA (deshabilitado)  

---

## 📊 **CAMPOS REQUERIDOS**

### **Campos Obligatorios Generales (Todos los perfiles)**

1. ✅ `nombre_completo` (o `nombres` + `apellidos`)
2. ✅ `correo`
3. ✅ `password`
4. ✅ `ultimo_grado_estudios`
5. ✅ `empleo_actual`
6. ✅ `municipio`
7. ✅ `tipo_perfil` (Investigador / Tecnólogo)

### **Campos Obligatorios para Investigadores**

8. ✅ `nivel_investigador` (10 opciones desde "Candidato a Investigador" hasta "Investigador insignia")
9. ✅ `area_investigacion` (array)
10. ✅ `linea_investigacion` (array)

### **Campos Obligatorios para Tecnólogos**

8. ✅ `nivel_tecnologo` (Nivel A / Nivel B)
9. ✅ `area_investigacion` (array)
10. ✅ `linea_investigacion` (array)

### **Campos Opcionales (pero recomendados)**

- `curp`, `rfc`, `no_cvu` (extraídos por OCR)
- `telefono`, `fecha_nacimiento`, `nacionalidad`, `genero`
- `fotografia_url`, `cv_url`
- `institucion`, `departamento`, `ubicacion`, `sitio_web`
- `orcid`, `especialidad`, `disciplina`

---

## 🔐 **SEGURIDAD**

### **✅ Implementado**

1. ✅ **JWT para autenticación** (`verifyJWT()`)
2. ✅ **Clerk para gestión de usuarios**
3. ✅ **Hash de contraseñas** (en `postgresql-database.ts`)
4. ✅ **Validación de contraseña fuerte** (score >= 4)
5. ✅ **Rate limiting** (3 intentos, 1 min lockout)
6. ✅ **Sanitización de datos OCR** (`sanitizeOcrData()`)
7. ✅ **Normalización de campos** (solo campos válidos)
8. ✅ **HTTPS en Railway/Vercel**

### **⚠️ Pendiente**

1. 🔴 **Re-habilitar CAPTCHA** (actualmente deshabilitado)
2. 🟡 **Validación de CURP/RFC** (formato correcto)
3. 🟡 **Sanitización de inputs** (XSS protection)
4. 🟡 **Logs de auditoría** (quién registró cuándo)

---

## 🎯 **RECOMENDACIONES**

### **Prioridad ALTA** 🔴

1. **Aumentar timeout de OCR a 60 segundos**
   - Archivo: `app/registro/page.tsx` línea 811
   - Cambio: `30000` → `60000`

2. **Configurar keep-alive para Railway**
   - Usar UptimeRobot (gratis)
   - Ping cada 5 minutos
   - Ver: `DEPLOY_RAILWAY.md` → Paso 6

3. **Re-habilitar CAPTCHA antes de producción**
   - Configurar variables de entorno
   - Descomentar código

### **Prioridad MEDIA** 🟡

4. **Consolidar lógica de `nombre_completo`**
   - Crear función `construirNombreCompleto()`
   - Eliminar duplicación

5. **Agregar validación de formato CURP/RFC**
   ```typescript
   const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/
   const RFC_REGEX = /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/
   ```

6. **Implementar logs de auditoría**
   - Registrar intentos de registro
   - IP, timestamp, resultado

### **Prioridad BAJA** 🟢

7. **Agregar tests unitarios**
   - `sanitizeOcrData()`
   - `validatePassword()`
   - Validaciones de campos

8. **Mejorar mensajes de error**
   - Más específicos
   - Traducibles (i18n)

---

## 📈 **MÉTRICAS A MONITOREAR**

1. **Tasa de éxito de OCR**
   - ¿Cuántos registros usan OCR exitosamente?
   - Target: > 80%

2. **Tiempo de procesamiento OCR**
   - Promedio: < 10 segundos
   - Si > 30 segundos: problema con Railway

3. **Tasa de registros completos**
   - ¿Cuántos usuarios completan todos los campos?
   - Target: > 70%

4. **Errores de Railway**
   - Timeouts, 502, 500
   - Si > 5%: problema crítico

5. **Registros exitosos vs fallidos**
   - Target: > 95% éxito

---

## 🔄 **COMPARACIÓN: ANTES vs AHORA**

| Aspecto | Antes (Pre-Pull) | Ahora (Post-Pull) |
|---------|------------------|-------------------|
| **Timeout OCR** | Probablemente 60s | ⚠️ 30s (muy corto) |
| **Auto-guardado PDF** | ❌ Manual | ✅ Automático |
| **Manejo error OCR** | ❌ Bloqueaba registro | ✅ Permite continuar |
| **Normalización campos** | ⚠️ Básica | ✅ Completa (solo campos válidos) |
| **`nombre_completo`** | ⚠️ Manual | ✅ Auto-construido |
| **CAPTCHA** | ✅ Habilitado | ⚠️ Deshabilitado |
| **Búsqueda perfil** | ⚠️ Por clerk_user_id | ✅ Por correo |
| **Perfil completo** | ⚠️ Sin validación clara | ✅ 10 campos clave |
| **Duplicados** | ⚠️ HTTP 400 | ✅ HTTP 409 |
| **COALESCE en queries** | ❌ NULLs posibles | ✅ Valores por defecto |

---

## ✅ **CONCLUSIÓN**

### **Estado General: ✅ BUENO**

El flujo de registro ha sido **significativamente mejorado** en el último pull:

✅ **Mejoras importantes:**
- Auto-guardado de PDF como CV
- Manejo robusto de errores OCR
- Normalización completa de campos
- Construcción automática de `nombre_completo`
- Búsqueda de perfil simplificada
- Validación de perfil completo

⚠️ **Puntos de atención:**
- Timeout de OCR muy corto (30s)
- CAPTCHA deshabilitado
- Railway como cuello de botella potencial
- Código duplicado en construcción de nombre

🎯 **Acción inmediata recomendada:**
1. Aumentar timeout de OCR a 60 segundos (5 minutos)
2. Configurar keep-alive de Railway con UptimeRobot (10 minutos)
3. Re-habilitar CAPTCHA antes de producción (15 minutos)

**Total tiempo: 30 minutos** para tener el sistema en estado óptimo.

---

## 📚 **DOCUMENTACIÓN RELACIONADA**

- `RESUMEN_PROBLEMA_RAILWAY.md` - Diagnóstico de problemas con Railway
- `DIAGNOSTICO_RAILWAY_OCR.md` - Análisis técnico del servicio OCR
- `DEPLOY_RAILWAY.md` - Guía de deploy paso a paso
- `ANALISIS_FLUJOS_DE_DATOS.md` - Flujos completos del sistema

---

**Fecha de análisis:** 30 de octubre de 2025  
**Versión:** Post-pull commit `076c8f3`

