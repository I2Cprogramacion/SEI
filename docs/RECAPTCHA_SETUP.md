# Configuración de Google reCAPTCHA v2

## � Protección contra bots con verificación de doble capa

Este sistema implementa **verificación de CAPTCHA en frontend Y backend** para máxima seguridad:

1. ✅ **Frontend**: Valida que el usuario haya marcado el checkbox
2. ✅ **Backend**: Verifica el token con Google antes de procesar el registro

---

## �📋 Pasos para obtener tus claves de reCAPTCHA

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
# Google reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE=tu_site_key_aqui
RECAPTCHA_SECRET=tu_secret_key_aqui
```

### 6️⃣ **Configurar en Vercel (Producción)**

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega:
   - `NEXT_PUBLIC_RECAPTCHA_SITE` = `tu_site_key`
   - `RECAPTCHA_SECRET` = `tu_secret_key`
4. Selecciona **Production, Preview, Development**
5. Save

### 7️⃣ **Redeploy**

Después de agregar las variables:
```bash
git add .
git commit -m "➕ Agregar configuración de reCAPTCHA"
git push origin main
```

Vercel automáticamente redeployará con las nuevas variables.

---

## 🧪 Modo de prueba (Desarrollo)

Para desarrollo local, puedes usar las claves de prueba de Google:

```bash
# Estas claves SIEMPRE pasan el CAPTCHA (solo para testing)
NEXT_PUBLIC_RECAPTCHA_SITE=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

⚠️ **IMPORTANTE:** NO uses estas claves en producción.

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
