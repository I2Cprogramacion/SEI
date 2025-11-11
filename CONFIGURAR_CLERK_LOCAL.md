# 🔑 CONFIGURAR CLERK EN LOCAL (URGENTE)

## 🚨 ERROR ACTUAL:
```
⨯ [Error: Publishable key not valid.]
⨯ key=pk_test_REEMPLAZA_CON_TU_CLAVE_AQUI
```

Esto significa que tu `.env.local` tiene claves placeholder, NO claves reales.

---

## ✅ SOLUCIÓN (3 minutos):

### PASO 1: Obtén tus claves de Clerk

1. Ve a: **https://dashboard.clerk.com/**
2. Selecciona tu aplicación **SEI**
3. Ve a: **"API Keys"** (en el menú lateral)
4. Verás dos claves:

#### Para DESARROLLO (LOCAL):
```
Publishable key (Developmentdesarrollo):  pk_test_xxxxxxxxxxxxx
Secret key (Development):                 sk_test_xxxxxxxxxxxxx
```

#### Para PRODUCCIÓN (VERCEL):
```
Publishable key (Production):  pk_live_xxxxxxxxxxxxx
Secret key (Production):       sk_live_xxxxxxxxxxxxx
```

---

### PASO 2: Edita `.env.local`

Abre el archivo **`.env.local`** en la raíz del proyecto y **REEMPLAZA** estas líneas:

**❌ ANTES (no funciona):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REEMPLAZA_CON_TU_CLAVE_AQUI
CLERK_SECRET_KEY=sk_test_REEMPLAZA_CON_TU_CLAVE_AQUI
```

**✅ DESPUÉS (con tus claves REALES):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_CLAVE_REAL_DE_DEVELOPMENT
CLERK_SECRET_KEY=sk_test_TU_CLAVE_REAL_DE_DEVELOPMENT
```

**⚠️ IMPORTANTE:** 
- Para LOCAL usa las claves de **Development** (`pk_test_...` y `sk_test_...`)
- Para VERCEL usa las claves de **Production** (`pk_live_...` y `sk_live_...`)

---

### PASO 3: Reinicia el servidor

1. En la terminal, presiona **Ctrl + C** (detiene el servidor)
2. Ejecuta de nuevo:
```bash
npm run dev
```

3. **Verifica que NO aparezca:**
```
[Clerk]: You are running in keyless mode.
⨯ [Error: Publishable key not valid.]
```

4. **Deberías ver:**
```
✓ Ready in 2.5s
✓ Compiled /middleware in 250ms
```
Sin errores de Clerk.

---

## 🔍 VERIFICACIÓN RÁPIDA

Después de reiniciar, ve a: **http://localhost:3000/iniciar-sesion**

**✅ Si funciona:**
- NO hay errores en la consola
- El formulario de login se muestra correctamente
- Puedes hacer login

**❌ Si sigue fallando:**
- Verifica que copiaste las claves COMPLETAS (sin espacios)
- Asegúrate de que sean las de **Development**, no Production
- El archivo se llame exactamente `.env.local` (no `.env.local.txt`)

---

## 📋 CHECKLIST:

- [ ] Fui a dashboard.clerk.com
- [ ] Copié las claves de **Development** (pk_test y sk_test)
- [ ] Edité `.env.local` con las claves REALES
- [ ] Reinicié el servidor (Ctrl+C y npm run dev)
- [ ] NO aparece "keyless mode" en la terminal
- [ ] Puedo abrir /iniciar-sesion sin errores

---

## 🎯 UNA VEZ QUE FUNCIONE EN LOCAL:

Podremos:
1. ✅ Obtener tu `clerk_user_id` desde la consola del navegador
2. ✅ Crear tu registro en PostgreSQL
3. ✅ Ver tus datos en el dashboard

**¡Edita `.env.local` AHORA y reinicia el servidor!**

