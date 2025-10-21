# 🚨 SOLUCIÓN PROBABLE - CLERK HOSTED PAGES

## ⚠️ EL PROBLEMA MÁS COMÚN

Clerk tiene DOS modos de funcionamiento:

1. **Hosted Pages** (Clerk aloja las páginas) ❌ - Esto es lo que tienes ahora
2. **Component-based** (Tú alojas con componentes) ✅ - Esto es lo que quieres

---

## 🔧 SOLUCIÓN INMEDIATA

### PASO 1: Ve a Clerk Dashboard
1. Abre: https://dashboard.clerk.com
2. Asegúrate de estar en tu instancia **de producción** (NO development)

### PASO 2: Cambia a Component-based
1. En el menú lateral, click en **Configure**
2. Click en **Paths** (o "Account Portal" dependiendo de tu versión)
3. Busca una sección que diga algo como:

```
○ Hosted pages (Clerk manages authentication pages)
● Component-based (You manage authentication pages)
```

4. **Selecciona**: `Component-based` ✅
5. Click en **Save** o **Apply changes**

### PASO 3: Configurar las rutas
En la misma página, asegúrate que esté configurado:

```
Sign-in path: /iniciar-sesion
Sign-up path: /registro
Home URL: https://sei-chih.com.mx
```

### PASO 4: Verificar dominios autorizados
1. Ve a **Configure** → **Domains**
2. Asegúrate que `sei-chih.com.mx` esté en la lista y **verificado** ✅

---

## 📸 CÓMO SE VE EN CLERK DASHBOARD

### Si ves esto = Hosted Pages (PROBLEMA):
```
┌─────────────────────────────────────────────┐
│ ● Hosted pages                              │
│   Clerk will host your authentication pages │
│                                             │
│ ○ Component-based                           │
│   Use Clerk components in your app          │
└─────────────────────────────────────────────┘
```

### Debes cambiar a esto = Component-based (SOLUCIÓN):
```
┌─────────────────────────────────────────────┐
│ ○ Hosted pages                              │
│   Clerk will host your authentication pages │
│                                             │
│ ● Component-based                           │
│   Use Clerk components in your app          │
└─────────────────────────────────────────────┘
```

---

## ⚡ DESPUÉS DE CAMBIAR

1. **Espera 30 segundos** para que Clerk propague los cambios
2. Abre una **ventana privada/incógnito** en tu navegador
3. Ve a: `https://sei-chih.com.mx/iniciar-sesion`
4. Presiona **Ctrl + Shift + R** para refrescar sin caché

**Resultado esperado**:
- ✅ Verás tu diseño personalizado con las tarjetas a la izquierda
- ✅ El formulario de Clerk embebido a la derecha
- ✅ Logo SEI y "Bienvenido de vuelta" arriba

---

## 🆘 SI NO ENCUENTRAS LA OPCIÓN

En algunas versiones de Clerk Dashboard, la opción está en lugares diferentes:

### Opción A: Configure → Paths
Busca "Component-based" vs "Hosted pages"

### Opción B: Configure → Account Portal
Busca "Enable Account Portal" o similar

### Opción C: Configure → Session & URLs
Busca configuración de paths

### Opción D: Configure → Advanced
Busca "Hosted pages" o "Component mode"

---

## 📝 NOTA IMPORTANTE

**LAS VARIABLES DE ENTORNO NO SIRVEN** si Clerk está en modo "Hosted Pages".

El modo "Hosted Pages" ignora:
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- Tus componentes `<SignIn />` personalizados

Por eso aunque tengas las variables correctas, no funcionan.

---

## ✅ VERIFICACIÓN FINAL

Después de cambiar a Component-based:

```bash
# En tu navegador, abre consola (F12)
# Ve a: https://sei-chih.com.mx/iniciar-sesion
# En la consola, ejecuta:
window.location.href
```

Debe mostrar:
```
"https://sei-chih.com.mx/iniciar-sesion"
```

**NO debe mostrar**:
```
"https://accounts.clerk.dev/..."
"https://[tu-app].clerk.accounts.dev/..."
```

Si te redirige a clerk.dev = Hosted Pages todavía activo

---

## 🎯 RESULTADO ESPERADO

Cuando esté funcionando, en `sei-chih.com.mx/iniciar-sesion` verás:

```
┌──────────────────────────────────────────────────────────┐
│ [🏛️ Logo SEI]                                            │
│                                                          │
│ Bienvenido de vuelta                                    │
│ Sistema Estatal de Investigadores                       │
│                                                          │
│ ┌────────────────────┐  ┌────────────────────────────┐ │
│ │                    │  │ Email                      │ │
│ │  🛡️ Acceso Seguro  │  │ [___________________]      │ │
│ │  Protección total  │  │                            │ │
│ │                    │  │ Contraseña                 │ │
│ │  📧 Colaboración   │  │ [___________________]      │ │
│ │  Trabajo en equipo │  │                            │ │
│ │                    │  │ [  Iniciar Sesión  ]       │ │
│ │  🔒 Control Total  │  │                            │ │
│ │  Tus datos seguros │  │ ¿No tienes cuenta?         │ │
│ │                    │  │ Regístrate aquí            │ │
│ └────────────────────┘  └────────────────────────────┘ │
│                                                          │
│ ¿Problemas para iniciar sesión? Contáctanos             │
└──────────────────────────────────────────────────────────┘
```

---

Mándame una captura de la sección de Paths en Clerk Dashboard para confirmar qué opción está seleccionada.
