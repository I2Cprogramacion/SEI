# ⚠️ Error de Build en Vercel - Variables de Entorno Faltantes

## Error Actual

```
Error: @clerk/clerk-react: Missing publishableKey. 
You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
```

## ✅ Solución: Agregar Variables de Entorno en Vercel

### Paso 1: Ve a tu proyecto en Vercel
1. Abre [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **SEI**

### Paso 2: Configurar Variables de Entorno
1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

#### Variables Requeridas de Clerk:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

#### Variables Opcionales (URLs de Redirección):

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
```

#### Variable de Base de Datos:

```env
DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
```

### Paso 3: Obtener las Claves de Clerk

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)
2. Selecciona tu aplicación
3. Ve a **Configure** → **API Keys**
4. Copia:
   - **Publishable Key** (empieza con `pk_test_` o `pk_live_`)
   - **Secret Key** (empieza con `sk_test_` o `sk_live_`)

### Paso 4: Configurar las Variables en Vercel

Para cada variable:
1. Haz clic en **Add New**
2. **Name**: nombre de la variable (ej: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
3. **Value**: el valor de la clave
4. **Environment**: Selecciona:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Haz clic en **Save**

### Paso 5: Redeploy

Después de agregar todas las variables:
1. Ve a la pestaña **Deployments**
2. Haz clic en los **3 puntos** (⋮) del último deployment
3. Selecciona **Redeploy**
4. Confirma

---

## 📋 Lista de Variables a Configurar

### Esenciales (REQUERIDAS):
- [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [x] `CLERK_SECRET_KEY`
- [x] `DATABASE_URL`

### Opcionales (Recomendadas):
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

### Opcionales (OCR):
- [ ] `PDF_PROCESSOR_URL` (si usas el servicio OCR)

---

## 🔍 Verificar Variables Locales

Para encontrar tus claves locales, revisa tu archivo `.env.local`:

```powershell
# En tu terminal local, ejecuta:
Get-Content .env.local | Select-String "CLERK"
```

Copia esos valores a Vercel.

---

## ✅ Después de Configurar

Una vez que agregues las variables y hagas redeploy:
1. El build debería completarse exitosamente
2. La aplicación se desplegará en producción
3. Clerk funcionará correctamente con autenticación

---

## 🚨 Importante

- **NO** compartas tus claves secretas públicamente
- Usa claves de **test** (`pk_test_`, `sk_test_`) para desarrollo
- Usa claves de **producción** (`pk_live_`, `sk_live_`) solo para producción
- Las claves que empiezan con `NEXT_PUBLIC_` son visibles en el cliente (browser)
- Las claves sin `NEXT_PUBLIC_` solo están disponibles en el servidor

---

## 📞 Si Necesitas Ayuda

Si no encuentras tus claves de Clerk:
1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)
2. Crea una nueva aplicación si no tienes una
3. Sigue el wizard de configuración
4. Copia las claves generadas

---

**Estado Actual:**
- ✅ pnpm-lock.yaml actualizado correctamente
- ✅ Dependencias instaladas (Next.js 15.5.4, React 19.2.0)
- ❌ Falta configurar variables de entorno en Vercel
- ⏳ Esperando configuración para completar deployment
