# 🔧 Correcciones de Variables de Entorno en Vercel

## El Problema
El error de Clerk dice:
```
The "signInFallbackRedirectUrl" ("/dashboard") has priority over the legacy "afterSignInUrl" ("/admin")
```

Esto significa que **Vercel tiene variables de entorno ANTIGUAS** que necesitan ser eliminadas.

## Variables Deprecadas a ELIMINAR en Vercel

Ve a: **Vercel → Settings → Environment Variables**

### Busca y ELIMINA estas variables:
- ❌ `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (si existe, elimina)
- ❌ `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (si existe, elimina)  
- ❌ `CLERK_AFTER_SIGN_IN_URL` (si existe, elimina)
- ❌ `CLERK_AFTER_SIGN_UP_URL` (si existe, elimina)

### Asegúrate de que EXISTAN estas (variables correctas):
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Tu clave pública de Clerk
- ✅ `CLERK_SECRET_KEY` - Tu clave secreta de Clerk
- ✅ `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro`
- ✅ `DATABASE_URL` - Tu connection string de Neon (SIN el prefijo `psql '`)

## Variables de Entorno Correctas

```env
# CLERK
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro

# DATABASE
DATABASE_URL=postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require&channel_binding=require

# NO INCLUIR ESTAS (son deprecadas):
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=
```

## Pasos en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `SEI`
3. **Settings** → **Environment Variables**
4. **BUSCA** y **ELIMINA**:
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
5. Si tienes variables con `/admin`, cámbialas a `/dashboard`
6. **Guarda** los cambios
7. **Redeploy**: Actions → Run all Checks o redeploy manualmente

## Redireccionamientos en Código

✅ Ya están configurados correctamente en:
- `clerk.config.ts`: `signInFallbackRedirectUrl: "/dashboard"`
- `app/layout.tsx`: `signInFallbackRedirectUrl="/dashboard"`
- `app/iniciar-sesion/page.tsx`: `fallbackRedirectUrl="/dashboard"`

## El Error de Registro

El usuario también reporta "datos inválidos" en el registro. Esto es porque:

1. **OCR no extrae CURP/RFC/CVU** ✅ (esperado - no están en el PDF)
2. **Ahora CURP/RFC/CVU son obligatorios** ✅ (cambio que hicimos)
3. **El usuario DEBE llenarlos manualmente** 

**Solución para el usuario:**
- Después de que OCR carga los datos
- Los campos CURP/RFC/CVU mostrarán borde rojo ❌
- El usuario DEBE escribirlos manualmente:
  - CURP: 18 caracteres (ej: TARC800101HDGRRL00)
  - RFC: 10-13 caracteres (ej: TARC800101XYZ)
  - CVU: Número de identidad académica

Una vez completos, el botón de Registrarse se habilitará.

## Verificación Post-Fix

Después de hacer estos cambios en Vercel:
1. El console.log debería dejar de mostrar el error de `afterSignInUrl`
2. No verás más warnings sobre props deprecados
3. La redirección seguirá siendo a `/dashboard`

---

**¿Necesitas ayuda con los pasos en Vercel?** 
Puedo hacer un documento paso a paso con screenshots si es necesario.
