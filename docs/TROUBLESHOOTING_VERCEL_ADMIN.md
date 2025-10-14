# Troubleshooting: Acceso Admin en Vercel

## Problema: /admin redirige a /dashboard en Vercel

Cuando accedes a `/admin` en producción (Vercel), la aplicación te redirige automáticamente a `/dashboard`. Esto ocurre porque el sistema de verificación de permisos no está funcionando correctamente.

## Causas Comunes

### 1. Variables de Entorno No Configuradas en Vercel

**Síntomas:**
- En local funciona perfectamente
- En Vercel redirige a `/dashboard`
- API `/api/admin/verificar` retorna error 500 o 404

**Solución:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Asegúrate de tener **todas** estas variables:

```env
POSTGRES_URL=postgresql://neondb_owner:...@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://neondb_owner:...@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15
POSTGRES_URL_NO_SSL=postgresql://neondb_owner:...@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:...@ep-super-recipe-a8kx6g4c.eastus2.azure.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech
POSTGRES_PASSWORD=npg_Inb9YWHGiq0K
POSTGRES_DATABASE=neondb
```

4. **IMPORTANTE:** Marca las variables para los 3 entornos:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Después de agregar las variables, **redeploy la aplicación**

### 2. Usuario No Registrado en Base de Datos de Producción

**Síntomas:**
- API retorna "Usuario no encontrado en la base de datos" (404)
- El usuario existe en Clerk pero no en PostgreSQL

**Solución:**
1. Regístrate en la aplicación de producción
2. Ve a: https://tu-app.vercel.app/registro
3. Completa el registro con el mismo email de Clerk
4. Después ejecuta el script para hacer admin

### 3. Usuario Existe pero No es Admin

**Síntomas:**
- API retorna "Usuario no es administrador" (403)
- El usuario existe pero `es_admin = false`

**Solución:**

#### Opción A: Desde tu computadora local (recomendado)
```bash
# Asegúrate de tener las variables de entorno configuradas en .env.local
node scripts/check-admin-vercel.js drksh2015@gmail.com

# Si el usuario NO es admin, ejecuta:
node scripts/make-admin.js drksh2015@gmail.com
```

#### Opción B: Directamente en la base de datos (Neon Dashboard)
1. Ve a https://console.neon.tech/
2. Selecciona tu proyecto
3. Ve a SQL Editor
4. Ejecuta:
```sql
-- Verificar usuario
SELECT id, nombre_completo, correo, es_admin 
FROM investigadores 
WHERE correo = 'drksh2015@gmail.com';

-- Si existe pero no es admin, actualiza:
UPDATE investigadores 
SET es_admin = true 
WHERE correo = 'drksh2015@gmail.com';

-- Verifica que se actualizó:
SELECT id, nombre_completo, correo, es_admin 
FROM investigadores 
WHERE correo = 'drksh2015@gmail.com';
```

### 4. Columna es_admin No Existe

**Síntomas:**
- Error: "column 'es_admin' does not exist"
- La migración no se ejecutó en producción

**Solución:**
```bash
# Ejecutar script para agregar columna
node scripts/add-es-admin-column.js
```

O directamente en Neon SQL Editor:
```sql
-- Agregar columna es_admin si no existe
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT false;

-- Hacer admin a tu usuario
UPDATE investigadores 
SET es_admin = true 
WHERE correo = 'drksh2015@gmail.com';
```

### 5. Caché de Vercel

**Síntomas:**
- Todo parece estar configurado correctamente
- Aún así no funciona
- Los logs muestran valores antiguos

**Solución:**
1. Ve a Vercel Dashboard → tu proyecto
2. Deployments → selecciona el deployment activo
3. Click en los 3 puntos (⋯) → "Redeploy"
4. Marca "Use existing Build Cache" como **OFF**
5. Redeploy

## Scripts de Diagnóstico

### Verificar Estado del Usuario
```bash
node scripts/check-admin-vercel.js drksh2015@gmail.com
```

Este script te mostrará:
- ✅ Si el usuario existe
- ✅ Si es admin o no
- ✅ Última actividad
- ⚠️ Problemas de configuración

### Hacer Usuario Admin
```bash
node scripts/make-admin.js drksh2015@gmail.com
```

## Flujo de Verificación Completo

### En el Cliente (app/admin/layout.tsx)
```typescript
1. Usuario accede a /admin
2. Layout hace fetch a /api/admin/verificar
3. Si la API retorna error (401, 403, 404, 500):
   → Redirige a /dashboard
4. Si la API retorna { esAdmin: true }:
   → Muestra el panel de admin
```

### En el Servidor (app/api/admin/verificar/route.ts)
```typescript
1. Obtiene usuario de Clerk
2. Extrae el email
3. Consulta PostgreSQL:
   SELECT es_admin FROM investigadores WHERE correo = email
4. Si usuario no existe: → 404
5. Si es_admin = false: → 403
6. Si es_admin = true: → 200 { esAdmin: true }
```

## Checklist de Verificación

Antes de contactar soporte, verifica:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Variables marcadas para Production/Preview/Development
- [ ] Usuario registrado en la base de datos de producción
- [ ] Usuario tiene `es_admin = true`
- [ ] Columna `es_admin` existe en la tabla
- [ ] Deployment reciente después de cambios
- [ ] Caché de Vercel limpiada

## Logs de Depuración

### Ver logs en Vercel
1. Ve a tu proyecto en Vercel
2. Deployments → selecciona el deployment activo
3. Functions → selecciona la función
4. Ver logs en tiempo real

### Buscar estos mensajes:
```
❌ Error: Usuario no encontrado en la base de datos
   → Registra el usuario en producción

❌ Error: Usuario no es administrador
   → Ejecuta make-admin.js

❌ Error: column "es_admin" does not exist
   → Ejecuta add-es-admin-column.js

❌ Error: No autenticado
   → Verifica sesión de Clerk
```

## Contacto y Recursos

- [Neon Console](https://console.neon.tech/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Clerk Dashboard](https://dashboard.clerk.com/)

## Testing en Producción

Puedes probar la API directamente desde tu navegador:

```
https://tu-app.vercel.app/api/admin/verificar
```

**Respuestas esperadas:**

✅ Usuario admin:
```json
{
  "esAdmin": true,
  "usuario": {
    "id": 1,
    "nombre": "Tu Nombre",
    "email": "drksh2015@gmail.com"
  }
}
```

❌ Usuario no admin:
```json
{
  "esAdmin": false,
  "error": "Usuario no es administrador"
}
```

❌ Usuario no encontrado:
```json
{
  "esAdmin": false,
  "error": "Usuario no encontrado en la base de datos"
}
```
