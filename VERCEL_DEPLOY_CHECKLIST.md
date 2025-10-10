# ✅ Checklist Pre-Deploy a Vercel

## Antes de hacer Push

### 📦 Archivos y Dependencias
- [x] `pnpm-lock.yaml` está en el repositorio
- [x] `.npmrc` configurado correctamente
- [x] `.node-version` especifica Node 20
- [x] `vercel.json` tiene comandos de build e install
- [x] `package.json` tiene `packageManager` y `engines`
- [ ] Todas las dependencias están en `package.json` (no solo devDependencies)

### 🔧 Build Local
- [ ] `pnpm install` ejecuta sin errores
- [ ] `pnpm run build` completa exitosamente
- [ ] `pnpm run start` funciona correctamente
- [ ] No hay errores de TypeScript
- [ ] No hay warnings críticos

### 🔐 Variables de Entorno
Asegúrate de configurar en Vercel Dashboard > Settings > Environment Variables:

#### Clerk (Autenticación)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`

#### PostgreSQL (Neon)
- [ ] `DATABASE_URL`
- [ ] `POSTGRES_URL`
- [ ] `POSTGRES_PRISMA_URL`
- [ ] `POSTGRES_URL_NON_POOLING`

#### Cloudinary (Opcional - Upload de imágenes)
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

#### Email (Opcional - 2FA)
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`

### 📝 Git
- [ ] Todos los cambios están commiteados
- [ ] No hay archivos sensibles (.env, etc.) en el repo
- [ ] `.gitignore` está configurado correctamente

```bash
# Verifica que no haya archivos .env
git ls-files | grep -E '\.env$'
# Si muestra algo, remuévelo:
git rm --cached .env.local
```

### 🚀 Deploy
- [ ] Push al repositorio: `git push origin main`
- [ ] Conectar repositorio a Vercel (si es primera vez)
- [ ] Vercel detecta automáticamente Next.js
- [ ] Configurar variables de entorno en Vercel
- [ ] Iniciar deployment

## Verificación Post-Deploy

### ✅ Después del Deploy
- [ ] Build completó sin errores
- [ ] Sitio carga correctamente
- [ ] Autenticación funciona (login/registro)
- [ ] Dashboard carga perfil de usuario
- [ ] Conexión a PostgreSQL funciona
- [ ] No hay errores en la consola del navegador
- [ ] Funciones serverless responden (timeout < 10s)

### 🔍 Pruebas Básicas
- [ ] Página principal carga (`/`)
- [ ] Login funciona (`/iniciar-sesion`)
- [ ] Registro funciona (`/registro`)
- [ ] Dashboard accesible (`/dashboard`)
- [ ] Editar perfil funciona (`/dashboard/editar-perfil`)
- [ ] Navegación funciona en todas las páginas

### 📊 Monitoreo
- [ ] Revisa Analytics en Vercel Dashboard
- [ ] Verifica logs por errores: `vercel logs --follow`
- [ ] Speed Insights muestra buen rendimiento

## Comandos Rápidos

```bash
# Verifica que todo esté listo
pnpm install && pnpm run build

# Push a Git
git push origin main

# Ver logs en tiempo real (después del deploy)
vercel logs --follow

# Rollback si algo sale mal
vercel rollback <deployment-url>
```

## Errores Comunes y Soluciones

### ❌ "pnpm install failed"
```bash
# Regenera lockfile
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Fix: Regenera pnpm lockfile"
git push
```

### ❌ "Environment variables not found"
- Ve a Vercel Dashboard > Settings > Environment Variables
- Agrega TODAS las variables necesarias
- Redeploy: Vercel Dashboard > Deployments > ⋯ > Redeploy

### ❌ "Module not found: '@/...'
```bash
# Verifica tsconfig.json paths
# Asegúrate de que los aliases estén configurados
```

### ❌ "Function timeout"
```json
// En vercel.json agrega:
{
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

### ❌ "Build failed: Type errors"
```bash
# Revisa y corrige errores de TypeScript
pnpm run build
# Si es necesario, temporalmente:
# En next.config.js: typescript: { ignoreBuildErrors: true }
```

## Contacto y Soporte

- **Documentación Vercel:** https://vercel.com/docs
- **Logs de Build:** Vercel Dashboard > Deployments > Ver logs
- **Soporte Vercel:** https://vercel.com/support

---

**¡Listo para Deploy!** 🚀

Una vez que todos los checkboxes estén marcados, haz push y observa el deploy en Vercel Dashboard.
