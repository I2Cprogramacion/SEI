# Configuración de Google reCAPTCHA v2 (CLÁSICO)

⚠️ **IMPORTANTE: NO usar reCAPTCHA Enterprise** ⚠️

Este proyecto usa **reCAPTCHA v2 Clásico** (checkbox "No soy un robot").
NO confundir con reCAPTCHA Enterprise (Google Cloud).

---

## 🔒 Protección contra bots con verificación de doble capa

Este sistema implementa **verificación de CAPTCHA en frontend Y backend** para máxima seguridad:

1. ✅ **Frontend**: Valida que el usuario haya marcado el checkbox
2. ✅ **Backend**: Verifica el token con Google antes de procesar el registro

---

## � Pasos para obtener tus claves de reCAPTCHA v2 CLÁSICO

### 1️⃣ **Acceder a Google reCAPTCHA Admin (NO Google Cloud)**
Ve a: https://www.google.com/recaptcha/admin/create

⚠️ **NO uses**: https://console.cloud.google.com (eso es Enterprise)

### 2️⃣ **Crear un nuevo sitio**

**Información del sitio:**
- **Label:** SEI - Sistema Estatal de Investigadores
- **reCAPTCHA type:** ✅ **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
  - ❌ NO selecciones "reCAPTCHA Enterprise"
  - ❌ NO selecciones "reCAPTCHA v3"
- **Domains:** 
  - `sei-chih.com.mx`
  - `localhost` (para desarrollo)
  - Si usas preview deployments: `*.vercel.app`

### 3️⃣ **Aceptar términos**
✅ Accept the reCAPTCHA Terms of Service
✅ Send alerts to owners (opcional)

### 4️⃣ **Obtener las claves (reCAPTCHA v2 CLÁSICO)**

Después de crear el sitio, Google te dará dos claves:

1. **Site Key (Clave pública)** - Se usa en el frontend
   ```
   Ejemplo: 6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   - Esta clave es segura exponer al público
   - Va en `NEXT_PUBLIC_RECAPTCHA_SITE`

2. **Secret Key (Clave secreta)** - Se usa en el backend
   ```
   Ejemplo: 6LdYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   ```
   - ⚠️ **NUNCA exponer esta clave al público**
   - Va en `RECAPTCHA_SECRET`

⚠️ **VERIFICA**: Las claves deben empezar con `6L` (no con números de proyecto de GCP)

### 5️⃣ **Configurar las variables de entorno**

Edita tu archivo `.env.local`:

### 1️⃣ **Acceder a Google reCAPTCHA Admin**
Ve a: https://www.google.com/recaptcha/admin/create

### 2️⃣ **Crear un nuevo sitio**

**Información del sitio:**
- **Label:** SEI - Sistema Estatal de Investigadores
- **reCAPTCHA type:** ✅ reCAPTCHA v2 → "I'm not a robot" Checkbox
- **Domains:** 
  - `sei-chih.com.mx`
  - `localhost` (para desarrollo)
  - `vercel.app` (si usas preview deployments)

### 3️⃣ **Aceptar términos**
✅ Accept the reCAPTCHA Terms of Service
✅ Send alerts to owners

### 4️⃣ **Obtener las claves**

Después de crear el sitio, Google te dará dos claves:

1. **Site Key (Clave pública)** - Se usa en el frontend
   ```
   Ejemplo: 6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

2. **Secret Key (Clave secreta)** - Se usa en el backend
   ```
   Ejemplo: 6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### 5️⃣ **Configurar las variables de entorno**

Edita tu archivo `.env.local`:

```bash
# Google reCAPTCHA v2 CLÁSICO (NO Enterprise)
# Obtén las claves de: https://www.google.com/recaptcha/admin
NEXT_PUBLIC_RECAPTCHA_SITE=tu_site_key_aqui
RECAPTCHA_SECRET=tu_secret_key_aqui
```

**Ejemplo con claves reales:**
```bash
NEXT_PUBLIC_RECAPTCHA_SITE=6LdXf8AqBBBBBccccDDDDeeeeFFFFggggHHHH
RECAPTCHA_SECRET=6LdXf8AqIIIIJJJJKKKKLLLLmmmmNNNNooooP
```

### 6️⃣ **Configurar en Vercel (Producción)**

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega:
   - Variable: `NEXT_PUBLIC_RECAPTCHA_SITE`
   - Value: Tu Site Key de reCAPTCHA v2 clásico
   - Environments: ✅ Production, Preview, Development
4. Agrega:
   - Variable: `RECAPTCHA_SECRET`
   - Value: Tu Secret Key de reCAPTCHA v2 clásico
   - Environments: ✅ Production, Preview, Development
5. **Save**

⚠️ **MUY IMPORTANTE**: 
- Las claves DEBEN ser del panel **https://www.google.com/recaptcha/admin**
- NO del panel de Google Cloud (Enterprise)
- Verifica que el tipo sea "reCAPTCHA v2 Checkbox"

### 7️⃣ **Redeploy**

Después de agregar las variables en Vercel:
```bash
git add .
git commit -m "🔧 Update: Configurar reCAPTCHA v2 clásico"
git push origin main
```

O desde Vercel Dashboard: **Deployments** → **Redeploy**

---

## 🔍 Verificar que estás usando reCAPTCHA v2 CLÁSICO (no Enterprise)

### ✅ Señales de que estás usando v2 CLÁSICO correctamente:

1. **Panel correcto:**
   - URL: https://www.google.com/recaptcha/admin
   - Muestra: "Sites" con lista de dominios
   - NO dice "Google Cloud Console"

2. **Claves correctas:**
   - Site Key empieza con `6L`
   - Secret Key empieza con `6L`
   - NO son API Keys de Google Cloud (esas son diferentes)

3. **Script correcto en frontend:**
   ```html
   <!-- ✅ CORRECTO para v2 clásico -->
   <script src="https://www.google.com/recaptcha/api.js" async defer></script>
   
   <!-- ❌ INCORRECTO - Esto es Enterprise -->
   <script src="https://www.google.com/recaptcha/enterprise.js"></script>
   ```

4. **Endpoint correcto en backend:**
   ```typescript
   // ✅ CORRECTO para v2 clásico
   await fetch("https://www.google.com/recaptcha/api/siteverify", ...)
   
   // ❌ INCORRECTO - Esto es Enterprise
   await fetch("https://recaptchaenterprise.googleapis.com/v1/...", ...)
   ```

### ❌ Señales de que mezclaste v2 con Enterprise (ERROR):

1. Panel de Google Cloud muestra "reCAPTCHA Enterprise" con estado "Incompleta"
2. Contador de verificaciones siempre en 0
3. Las claves no empiezan con `6L`
4. Necesitas "Project ID" o "API Key" de GCP
5. El mensaje dice "Migrate keys"

---

## 🧪 Modo de prueba (Desarrollo)

Para desarrollo local, Google proporciona claves de prueba de reCAPTCHA v2:

```bash
# ⚠️ Estas claves de prueba SIEMPRE pasan el CAPTCHA (solo para testing)
NEXT_PUBLIC_RECAPTCHA_SITE=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Características de las claves de prueba:**
- ✅ Funcionan en cualquier dominio
- ✅ Siempre retornan `success: true`
- ✅ NO cuentan en el panel de Google
- ❌ NO usar en producción (cualquiera puede bypassear)

⚠️ **IMPORTANTE:** En producción USA claves reales de tu sitio.

---

## ✅ Verificar que funciona

### Frontend (Visual)
1. Ve a tu página de registro
2. Llena el formulario
3. Verás el checkbox "I'm not a robot" antes del botón de registro
4. Marca el checkbox
5. Deberías ver el mensaje "✅ CAPTCHA verificado correctamente"
6. El botón de registro se activará

### Backend (Logs del servidor)
1. Abre las herramientas de desarrollo (F12) → pestaña **Network**
2. Envía el formulario
3. En la petición POST a `/api/registro`, revisa los logs:
   - `🔍 Verificando CAPTCHA con Google...`
   - `✅ CAPTCHA verificado exitosamente`
4. Ve a tu panel de Google reCAPTCHA: https://www.google.com/recaptcha/admin
5. Deberías ver el contador de "verificaciones totales" incrementar

### ⚠️ Si el contador sigue en 0
Significa que el backend NO está haciendo la llamada a Google. Verifica:
- ✅ Variable `RECAPTCHA_SECRET` configurada en Vercel
- ✅ El token se está enviando desde el frontend como `captchaToken`
- ✅ La función `verificarCaptcha()` se está ejecutando en `/api/registro/route.ts`

---

## 🎨 Personalización (Opcional)

El CAPTCHA tiene varias opciones de personalización:

```tsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE}
  onChange={(value) => setCaptchaValue(value)}
  onExpired={() => setCaptchaValue(null)}
  theme="light"        // "light" o "dark"
  size="normal"        // "normal", "compact", o "invisible"
  hl="es"             // Idioma español
/>
```

---

## 🔒 Seguridad

El CAPTCHA protege contra:
- ✅ Bots automatizados
- ✅ Registro masivo de cuentas falsas
- ✅ Ataques de fuerza bruta
- ✅ Spam

### Arquitectura de seguridad de doble capa:

```
Usuario completa CAPTCHA
         ↓
Frontend valida visualmente (previene submit accidental)
         ↓
Token enviado al backend como { captchaToken: "..." }
         ↓
Backend hace POST a https://www.google.com/recaptcha/api/siteverify
         ↓
Google valida el token y responde { success: true/false }
         ↓
Si success=true → Procesar registro
Si success=false → Rechazar con error 400
```

**Ventajas de esta arquitectura:**
- 🚫 Imposible saltarse la validación modificando el código del navegador
- 📊 Google registra todas las verificaciones (visible en el panel)
- 🔐 La clave secreta nunca se expone al cliente
- ⚡ Validación en tiempo real sin afectar UX

---

## 📊 Monitoreo

Puedes ver las estadísticas de uso en:
https://www.google.com/recaptcha/admin

- Solicitudes totales
- Solicitudes bloqueadas
- Tasa de éxito
- Países de origen
- Dispositivos

---

## 🐛 Troubleshooting

### El CAPTCHA no aparece
- Verifica que `NEXT_PUBLIC_RECAPTCHA_SITE` esté configurada
- Asegúrate de que el dominio esté en la lista de dominios permitidos
- Revisa la consola del navegador para errores

### "Invalid site key"
- La clave pública (SITE_KEY) es incorrecta
- Verifica que estás usando la clave correcta del proyecto

### El CAPTCHA se expira
- El usuario tiene 2 minutos para completar el formulario
- Se resetea automáticamente con `onExpired={() => setCaptchaValue(null)}`

---

## 📝 Notas

- reCAPTCHA v2 es el estándar para la mayoría de formularios
- reCAPTCHA v3 es "invisible" pero requiere configuración diferente
- Las claves de reCAPTCHA son gratuitas e ilimitadas
- Google usa Machine Learning para detectar comportamiento sospechoso

---

✅ **Listo!** Tu formulario ahora está protegido contra bots.
