# 🔍 CHECKLIST COMPLETO - ARREGLAR LOGIN

## ⚠️ PROBLEMA
Las variables están en Vercel pero el login sigue sin mostrarse. Vamos a verificar TODO.

---

## 📋 PARTE 1: VERIFICAR VERCEL (YA HECHO ✓)

Variables que YA deberían estar:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc2VpLWNoaWguY29tLm14JA
                 
```

✅ Si están todas, continúa a PARTE 2

---

## 📋 PARTE 2: VERIFICAR CLERK DASHBOARD

### A. Ve a Clerk Dashboard: https://dashboard.clerk.com

### B. Asegúrate de estar en la instancia CORRECTA
- **Debe decir**: "SEI" o el nombre de tu instancia de producción
- **NO debe decir**: "Development" o "Test"

### C. Ve a: **Configure → Paths**

Debe estar configurado así:

#### ✅ Component-based
```
☑️ Component-based (recomendado)
```

**NO** debe estar seleccionado:
```
☐ Hosted pages
```

#### ✅ Paths Configuration
```
Sign-in path: /iniciar-sesion
Sign-up path: /registro
```

### D. Ve a: **Configure → Email, Phone, Username**

Verifica que al menos uno esté habilitado:
```
☑️ Email address
```

### E. Ve a: **Configure → Domains**

Debe aparecer:
```
✓ sei-chih.com.mx (verified)
```

O si tienes www:
```
✓ www.sei-chih.com.mx (verified)
```

---

## 📋 PARTE 3: VERIFICAR DEPLOYMENT EN VERCEL

### A. Ve a Vercel Deployments
1. Abre tu proyecto en Vercel
2. Ve a **Deployments**
3. Busca el deployment MÁS RECIENTE

### B. Verifica que tenga las variables
1. Click en el deployment
2. Ve a **Environment Variables** (en el menú lateral)
3. Verifica que todas las 6 variables estén ahí

### C. ¿El deployment es DESPUÉS de agregar las variables?
- **SI**: El deployment ya tiene las variables ✓
- **NO**: Necesitas redesplegar

#### Para redesplegar:
1. Ve a **Deployments**
2. Click en los **tres puntos (...)** del último deployment
3. Click en **Redeploy**
4. Espera 2-3 minutos

---

## 📋 PARTE 4: LIMPIAR CACHÉ

Después de verificar TODO lo anterior:

### A. Limpiar caché del navegador
1. Abre https://sei-chih.com.mx/iniciar-sesion
2. Presiona **Ctrl + Shift + R** (Windows) para forzar refresh
3. O presiona **F12** → pestaña **Network** → checkbox **Disable cache**

### B. Probar en navegador privado/incógnito
1. Abre ventana privada/incógnito
2. Ve a https://sei-chih.com.mx/iniciar-sesion
3. ¿Se ve el formulario?

---

## 📋 PARTE 5: VERIFICAR ERRORES DE CONSOLA

Con la página abierta en sei-chih.com.mx/iniciar-sesion:

1. Presiona **F12** para abrir DevTools
2. Ve a la pestaña **Console**
3. Busca errores en rojo

### Errores comunes:

#### ❌ "Clerk: Invalid publishable key"
**Solución**: La key en Vercel está mal. Verifica que sea `pk_live_...`

#### ❌ "Clerk: Domain not authorized"
**Solución**: En Clerk Dashboard → Configure → Domains, agrega sei-chih.com.mx

#### ❌ "Clerk: Redirect URL not allowed"
**Solución**: En Clerk Dashboard → Configure → Paths, verifica que las rutas coincidan

#### ❌ Otros errores
**Copia el error exacto** y mándamelo

---

## 📋 PARTE 6: PROBAR REDIRECT DIRECTO

Intenta esto en el navegador:

```
https://sei-chih.com.mx/dashboard
```

**Resultado esperado**: 
- Te debe redirigir a `/iniciar-sesion`
- Ahí debe aparecer el formulario de login

**Si no te redirige**:
- Problema en middleware
- Problema en variables de Clerk

---

## 🆘 SI NADA FUNCIONA

Mándame capturas de:
1. ✅ Vercel → Settings → Environment Variables (todas las variables NEXT_PUBLIC_CLERK_*)
2. ✅ Clerk Dashboard → Configure → Paths (toda la página)
3. ✅ Clerk Dashboard → Configure → Domains (toda la página)
4. ✅ Consola del navegador en /iniciar-sesion (errores en rojo)
5. ✅ La página completa de /iniciar-sesion (qué se ve)

Con eso puedo identificar exactamente qué falta.

---

## ✅ ¿QUÉ DEBERÍA VERSE?

En https://sei-chih.com.mx/iniciar-sesion deberías ver:

```
┌─────────────────────────────────────────────────┐
│  [Logo SEI]                                     │
│  Bienvenido de vuelta                          │
│  Sistema Estatal de Investigadores             │
│                                                 │
│  ┌─────────────┐  ┌──────────────────────────┐│
│  │ Acceso      │  │ Email: [_____________]   ││
│  │ Seguro      │  │ Contraseña: [________]   ││
│  │             │  │ [Iniciar Sesión]         ││
│  │ Colaboración│  │                          ││
│  │             │  │ ¿No tienes cuenta?       ││
│  │ Control     │  │ Regístrate aquí          ││
│  │ Total       │  │                          ││
│  └─────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Tarjetas a la izquierda** + **Formulario a la derecha**
