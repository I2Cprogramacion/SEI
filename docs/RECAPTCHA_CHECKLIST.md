# ✅ Checklist: Arreglar reCAPTCHA v2 Clásico

## 🚨 Problema: Mezclaste reCAPTCHA v2 Clásico con Enterprise

### Síntomas:
- ❌ Panel de Google Cloud muestra "Incompleta" para Enterprise
- ❌ Contador de verificaciones siempre en 0
- ❌ El CAPTCHA se marca pero el backend dice que no está completo
- ❌ Mensaje "Migrate keys" en el panel clásico

---

## 🔧 Solución: Usar SOLO reCAPTCHA v2 Clásico

### Paso 1: Verificar Panel Correcto ✅

- [ ] Abre https://www.google.com/recaptcha/admin (NO Google Cloud)
- [ ] Busca tu sitio "SEI - Sistema Estatal de Investigadores"
- [ ] Verifica que diga "reCAPTCHA v2" y "Checkbox"
- [ ] Copia las claves (Site Key y Secret Key)

**Formato correcto de claves v2:**
```
Site Key:   6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (empieza con 6L)
Secret Key: 6LdYYYYYYYYYYYYYYYYYYYYYYYYYYYYY (empieza con 6L)
```

❌ **NO son estas:**
- API Keys de Google Cloud (esas son largas y tienen guiones)
- Project ID de GCP
- Claves de reCAPTCHA Enterprise

---

### Paso 2: Verificar Dominios Permitidos ✅

En el panel de reCAPTCHA v2, sección "Domains":

- [ ] `sei-chih.com.mx` está agregado
- [ ] `localhost` está agregado (para desarrollo)
- [ ] Opcional: `*.vercel.app` (para preview deployments)

**NO incluyas:**
- ❌ `http://` o `https://` (solo el dominio)
- ❌ Rutas como `/registro` (solo el dominio base)

---

### Paso 3: Actualizar Variables de Entorno ✅

#### Desarrollo (`.env.local`):

```bash
# Google reCAPTCHA v2 CLÁSICO
NEXT_PUBLIC_RECAPTCHA_SITE=6LdTU_SITE_KEY_AQUI
RECAPTCHA_SECRET=6LdTU_SECRET_KEY_AQUI
```

#### Producción (Vercel):

1. [ ] Ve a Vercel Dashboard → Tu proyecto SEI
2. [ ] Settings → Environment Variables
3. [ ] Elimina las variables viejas si existen
4. [ ] Agrega `NEXT_PUBLIC_RECAPTCHA_SITE` con tu Site Key
5. [ ] Agrega `RECAPTCHA_SECRET` con tu Secret Key
6. [ ] Marca: ✅ Production ✅ Preview ✅ Development
7. [ ] Save

---

### Paso 4: Verificar Código del Frontend ✅

El código actual está correcto. Verifica que use:

```tsx
import ReCAPTCHA from "react-google-recaptcha"

<ReCAPTCHA
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE}
  onChange={(value) => setCaptchaValue(value)}
  onExpired={() => setCaptchaValue(null)}
/>
```

❌ **NO debe usar:**
- `grecaptcha.enterprise.execute()`
- Scripts de Enterprise
- API calls a `recaptchaenterprise.googleapis.com`

---

### Paso 5: Verificar Código del Backend ✅

El código actual está correcto. Verifica que use:

```typescript
const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
})
```

❌ **NO debe usar:**
- `recaptchaenterprise.googleapis.com`
- API Keys de Google Cloud
- Project ID de GCP

---

### Paso 6: Ejecutar Script de Diagnóstico ✅

```bash
# Cargar variables de entorno y ejecutar diagnóstico
node -r dotenv/config scripts/verify-recaptcha.js
```

**Salida esperada:**
```
✅ NEXT_PUBLIC_RECAPTCHA_SITE: Configurada
✅ RECAPTCHA_SECRET: Configurada
✅ Site Key tiene formato válido (empieza con 6L)
✅ Secret Key tiene formato válido (empieza con 6L)
```

---

### Paso 7: Redeploy en Vercel ✅

```bash
git add .
git commit -m "🔧 Fix: Configurar reCAPTCHA v2 clásico correctamente"
git push origin main
```

O desde Vercel:
- [ ] Deployments → Latest Deployment → **Redeploy**

---

### Paso 8: Probar en Producción ✅

1. [ ] Ve a https://sei-chih.com.mx/registro
2. [ ] Abre DevTools (F12) → Console
3. [ ] Llena el formulario completamente
4. [ ] Marca el checkbox del CAPTCHA
5. [ ] Verifica en consola:
   ```
   🔵 CAPTCHA onChange triggered. Value: 03AGdBq...
   ✅ CAPTCHA completado, error limpiado
   ```
6. [ ] Click en "Completar Registro"
7. [ ] Verifica que NO aparezca error de CAPTCHA
8. [ ] El registro debe completarse exitosamente

---

### Paso 9: Verificar en Panel de Google ✅

1. [ ] Ve a https://www.google.com/recaptcha/admin
2. [ ] Selecciona tu sitio SEI
3. [ ] Ve a la sección de **Analytics**
4. [ ] Deberías ver el contador de "Requests" incrementar
5. [ ] Gráfica de verificaciones debe mostrar actividad

**SI el contador sigue en 0:**
- ❌ Estás usando claves incorrectas (posiblemente de Enterprise)
- ❌ El backend no está llamando a `siteverify`
- ❌ Las claves no coinciden con el sitio

---

## 🎯 Resultado Final Esperado

✅ **Frontend:**
- CAPTCHA se muestra correctamente
- Checkbox marca con ✓ verde
- Mensaje "✅ CAPTCHA verificado correctamente" aparece

✅ **Backend:**
- Logs muestran: `🔍 Verificando CAPTCHA con Google...`
- Respuesta: `✅ CAPTCHA verificado exitosamente`
- Registro se completa sin errores

✅ **Panel de Google:**
- Contador de verificaciones incrementa
- Gráfica muestra actividad
- No hay mensajes de error

---

## 🆘 Troubleshooting

### Si el contador de Google sigue en 0:

1. **Verifica las claves:**
   ```bash
   node scripts/verify-recaptcha.js
   ```
   Si dice "invalid-input-secret" → Claves incorrectas

2. **Revisa los logs de Vercel:**
   - Ve a Vercel → Tu proyecto → Runtime Logs
   - Busca: `🔍 Verificando CAPTCHA con Google...`
   - Si NO aparece → El backend no está ejecutando la verificación

3. **Verifica el token en Network:**
   - F12 → Network → POST /api/registro
   - Payload debe incluir: `"captchaToken": "03AGdBq..."`
   - Si falta → Frontend no está enviando el token

---

## 📞 Contacto si sigue fallando

Si después de seguir TODOS los pasos aún falla:

1. Toma screenshot del panel de reCAPTCHA (https://www.google.com/recaptcha/admin)
2. Copia el error exacto de la consola del navegador
3. Copia los logs de Vercel Runtime Logs
4. Verifica que las claves empiecen con `6L`

---

✅ **Checklist completado = CAPTCHA funcionando**
