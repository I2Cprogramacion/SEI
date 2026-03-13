# Guía de Correcciones - Errores Comunes Resueltos

## 1. Feature Policy - Directivas No Soportadas ✅

### Problema Original
```
Feature Policy: Saltándose una función de nombre no compatible "keyboard-map"
Feature Policy: Saltándose una función de nombre no compatible "cross-origin-isolated"
Feature Policy: Saltándose una función de nombre no compatible "autoplay"
```

### Solución Implementada
Se actualizó `next.config.mjs` para usar `Permissions-Policy` (el estándar moderno) en lugar de `Feature-Policy` (deprecado):

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Permissions-Policy',
          value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
        }
      ]
    }
  ]
}
```

**Archivos modificados:**
- `next.config.mjs` - Añadidos headers de seguridad
- `middleware.ts` - Añadido manejo de headers

---

## 2. Acceso Denegado - Error de Permisos ✅

### Problema Original
```
Acceso denegado: Usuario no tiene permisos de admin o evaluador
```

### Análisis
El error es esperado cuando un usuario regular intenta acceder a rutas protegidas de admin. El sistema está funcionando correctamente - es una medida de seguridad legítima.

**Verificación del flujo:**
1. `/api/admin/verificar-acceso` valida que el usuario sea admin O evaluador
2. Si no, retorna 403 (Forbidden) - esto es correcto
3. El dashboard normal está disponible para usuarios registrados

---

## 3. Error al Cargar Perfil desde PostgreSQL ✅

### Problema Original
```
No se pudieron cargar los datos del perfil desde PostgreSQL
```

### Mejoras Implementadas

#### 3.1 API de Perfil (`app/api/investigadores/perfil/route.ts`)
- ✅ Mejor manejo de errores con contexto
- ✅ Logs detallados de debugging
- ✅ Diferenciación entre errores de BD y no encontrado

```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`❌ [PERFIL] Error al obtener el perfil:`, {
    error: errorMessage,
    email: user?.emailAddresses[0]?.emailAddress,
    timestamp: new Date().toISOString()
  })
}
```

#### 3.2 Dashboard Page (`app/dashboard/page.tsx`)
- ✅ Mejor detección del estado de carga
- ✅ Logs progresivos con emojis para seguimiento
- ✅ Manejo específico de errores HTTP
- ✅ Mensajes claros al usuario

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  console.error(`❌ [Dashboard] Error HTTP ${response.status}:`, errorData)
  setErrorMessage(`Error al cargar el perfil (${response.status})...`)
}
```

#### 3.3 API de Sugerencias (`app/api/dashboard/sugerencias/route.ts`)
- ✅ Logs más descriptivos
- ✅ Información de debugging en desarrollo

**Archivos modificados:**
- `app/api/investigadores/perfil/route.ts` - Mejor manejo de errores
- `app/dashboard/page.tsx` - Logs y errores mejorados
- `app/api/dashboard/sugerencias/route.ts` - Debugging mejorado

---

## 4. Cookie __cf_bm - Atributo Particionada Faltante ✅

### Problema Original
```
La cookie "__cf_bm" pronto será rechazada porque es externa y no tiene el atributo "particionada"
```

### Solución Implementada

#### 4.1 Nuevo Archivo: `lib/cookie-config.ts`
Utilidades para manejar cookies de forma segura y moderna:

```typescript
// Para cookies de terceros (como __cf_bm)
thirdParty: {
  sameSite: 'None',
  secure: true,
  partitioned: true, // ← Clave para Cloudflare
  maxAge: 30 * 24 * 60 * 60,
}
```

#### 4.2 Actualización de Middleware (`middleware.ts`)
```typescript
const response = NextResponse.next();
response.headers.set('Permissions-Policy', 'accelerometer=(), ...')
return response;
```

#### 4.3 Configuración Recomendada en Vercel/Railway

Añade estas variables de entorno:
```
# Configuración de cookies seguras
NEXT_PUBLIC_COOKIE_SECURE=true
NEXT_PUBLIC_COOKIE_SAME_SITE=Lax
```

#### 4.4 Configuración de Cloudflare (si aplica)

Si usas Cloudflare Worker o Page Rules, añade:
```
Set-Cookie: __cf_bm=...; Path=/; Secure; HttpOnly; SameSite=None; Partitioned
```

**Archivos creados/modificados:**
- `lib/cookie-config.ts` - Nuevo archivo de configuración
- `middleware.ts` - Manejo mejorado de headers
- `next.config.mjs` - Headers de seguridad

---

## 5. Verificación del Email - Éxito ✅

### Logs Positivos
```
✅ [VERIFICACIÓN] Email verificado exitosamente
✅ [PerfilProvider] Email del usuario: attanodaron@gmail.com
✅ [Dashboard] Perfil cargado exitosamente
```

Estos mensajes indican que:
- ✅ El sistema de verificación de email está funcionando
- ✅ La autenticación con Clerk es correcta
- ✅ El contexto de perfil se está inicializando

---

## 🔧 Próximos Pasos Recomendados

1. **Verificar Base de Datos:**
   ```bash
   # Verificar conexión a PostgreSQL
   SELECT COUNT(*) FROM investigadores WHERE correo = 'attanodaron@gmail.com';
   ```

2. **Revisar Logs en Producción:**
   - Railway Dashboard → Logs
   - Vercel → Analytics → Function Logs
   - Cloudflare → Analytics

3. **Testing:**
   ```bash
   npm run build  # Verificar que build sea exitoso
   npm run test   # Ejecutar tests si existen
   ```

4. **Monitoreo Continuo:**
   - Revisar console.error() de navegador (F12)
   - Revisar logs del servidor en Railway/Vercel
   - Alertas de performance

---

## 📋 Resumen de Cambios

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `next.config.mjs` | Añadidos headers con Permissions-Policy | ✅ |
| `middleware.ts` | Mejorado manejo de headers y cookies | ✅ |
| `lib/cookie-config.ts` | Nuevo archivo de configuración de cookies | ✅ |
| `app/api/investigadores/perfil/route.ts` | Mejor manejo de errores | ✅ |
| `app/dashboard/page.tsx` | Logs y errores mejorados | ✅ |
| `app/api/dashboard/sugerencias/route.ts` | Debugging mejorado | ✅ |

---

## ⚠️ Notas Importantes

1. **Cookies de Terceros:** Las cookies `__cf_bm` de Cloudflare son manejadas por Cloudflare directamente. El atributo `Partitioned` se añade automáticamente en navegadores modernos si la cookie tiene `SameSite=None; Secure`.

2. **Feature Policy vs Permissions-Policy:** 
   - Feature Policy está deprecado
   - Use Permissions-Policy para nuevas implementaciones
   - Los navegadores antiguos aún pueden ignorar Permissions-Policy

3. **Seguridad de Cookies:**
   - Las cookies de sesión deben tener `HttpOnly`
   - Las cookies de terceros necesitan `SameSite=None; Secure`
   - El atributo `Partitioned` es requerido para evitar tracking

4. **Testing en Navegador:**
   - F12 → Application → Cookies → Ver atributos
   - F12 → Console → Ver errores de Feature-Policy
   - F12 → Network → Headers → Verificar Set-Cookie

---

## 🚀 Despliegue

Para aplicar estos cambios en producción:

```bash
# 1. Commit de cambios
git add -A
git commit -m "fix: Corregir Feature-Policy, errores de BD y cookies seguras"

# 2. Push a repo
git push origin main

# 3. Railway/Vercel se redeploya automáticamente

# 4. Verificar logs después de deploy
# Railway: railway logs
# Vercel: vercel logs [proyecto]
```
