# Guía de Deployment en Vercel

## Configuración del Proyecto para Vercel

Este proyecto está configurado para usar **pnpm** como gestor de paquetes en Vercel.

### Archivos de Configuración

#### 1. `.npmrc`
```properties
shamefully-hoist=true
strict-peer-dependencies=false
```
- `shamefully-hoist`: Mueve todas las dependencias al nivel raíz
- `strict-peer-dependencies`: Permite instalar paquetes incluso si hay conflictos de peer dependencies

#### 2. `.node-version`
```
20
```
Especifica que Vercel debe usar Node.js versión 20.x

#### 3. `vercel.json`
```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "functions": {
    "app/api/ocr/route.ts": {
      "maxDuration": 30
    }
  }
}
```
- `buildCommand`: Comando para construir el proyecto
- `installCommand`: Comando para instalar dependencias con pnpm
- `--no-frozen-lockfile`: Permite que pnpm actualice el lockfile si es necesario
- `functions`: Configuración de timeouts para funciones serverless

#### 4. `package.json`
```json
{
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=18.17.0",
    "pnpm": ">=8.0.0"
  }
}
```

## Pasos para Deploy en Vercel

### 1. Preparación Local

```bash
# Verifica que todo funcione localmente
pnpm install
pnpm run build
pnpm run start
```

### 2. Variables de Entorno en Vercel

Configura las siguientes variables de entorno en tu proyecto de Vercel:

#### Autenticación (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`

#### Base de Datos (PostgreSQL - Neon)
- `DATABASE_URL` (formato: postgresql://user:password@host/database)
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

#### Upload de Imágenes (Cloudinary)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### Email (2FA)
- `EMAIL_USER`
- `EMAIL_PASSWORD`

### 3. Deployment

#### Opción A: Desde Git
1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente Next.js
3. Asegúrate de que el **Root Directory** sea `./` (raíz del proyecto)
4. Vercel usará automáticamente los comandos de `vercel.json`

#### Opción B: CLI de Vercel
```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### 4. Configuración Post-Deploy

1. **Verifica las variables de entorno** en el dashboard de Vercel
2. **Configura el dominio** si es necesario
3. **Ejecuta las migraciones de Prisma** (si aplicable):
   ```bash
   # En Settings > General > Build & Development Settings
   # Build Command: pnpm prisma generate && pnpm run build
   ```

## Solución de Problemas Comunes

### Error: "pnpm install failed"

**Solución 1:** Verifica que `pnpm-lock.yaml` esté en el repositorio
```bash
git add pnpm-lock.yaml
git commit -m "Agrega pnpm lockfile"
git push
```

**Solución 2:** Regenera el lockfile
```bash
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Regenera pnpm lockfile"
git push
```

### Error: "Build failed"

**Verifica:**
1. Que todas las variables de entorno estén configuradas
2. Que `pnpm run build` funcione localmente
3. Los logs de build en Vercel Dashboard

### Error: "Function timeout"

Si alguna función serverless tarda demasiado:
```json
// En vercel.json
{
  "functions": {
    "app/api/tu-ruta/**": {
      "maxDuration": 30
    }
  }
}
```

### Error: "Module not found"

Asegúrate de que todas las dependencias estén en `package.json`:
```bash
pnpm add <paquete-faltante>
git add package.json pnpm-lock.yaml
git commit -m "Agrega dependencia faltante"
git push
```

## Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ver logs de una función específica
vercel logs --follow

# Listar deployments
vercel list

# Rollback a un deployment anterior
vercel rollback <deployment-url>

# Ejecutar en preview (staging)
vercel

# Ejecutar en producción
vercel --prod
```

## Optimizaciones Adicionales

### 1. Edge Runtime
Para funciones que necesitan respuesta rápida:
```typescript
export const runtime = 'edge'
```

### 2. Revalidación Incremental
Para páginas estáticas:
```typescript
export const revalidate = 3600 // segundos
```

### 3. Compresión de Imágenes
Next.js optimiza automáticamente las imágenes. Usa el componente `Image`:
```tsx
import Image from 'next/image'
```

## Monitoreo

- **Analytics**: Vercel incluye analytics automáticamente
- **Logs**: Accede desde el dashboard o CLI
- **Performance**: Revisa el Speed Insights en Vercel

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [pnpm en Vercel](https://vercel.com/docs/concepts/monorepos/pnpm)
- [Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Última actualización:** Octubre 2025  
**Versión de Next.js:** 15.5.4  
**Versión de Node.js:** 20.x  
**Package Manager:** pnpm 9.x
