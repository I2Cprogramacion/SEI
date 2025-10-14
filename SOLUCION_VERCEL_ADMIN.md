# 🚨 SOLUCIÓN: /admin redirige a /dashboard en Vercel

## ✅ Diagnóstico Completado

Tu usuario **drksh2015@gmail.com** ES administrador en la base de datos:
- ✅ Usuario existe (ID: 1)
- ✅ es_admin = TRUE
- ✅ Base de datos: neondb
- ✅ Funciona en local

**El problema está en la configuración de Vercel.**

## 🔧 Solución: Configurar Variables de Entorno en Vercel

### Paso 1: Acceder a Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **SEI**
3. Click en **Settings** (arriba)
4. Click en **Environment Variables** (menú izquierdo)

### Paso 2: Agregar Variables de PostgreSQL

Agrega **CADA UNA** de estas variables:

#### Variable 1: POSTGRES_URL
```
POSTGRES_URL
```
**Valor:**
```
postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

#### Variable 2: POSTGRES_PRISMA_URL
```
POSTGRES_PRISMA_URL
```
**Valor:**
```
postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

#### Variable 3: POSTGRES_URL_NO_SSL
```
POSTGRES_URL_NO_SSL
```
**Valor:**
```
postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

#### Variable 4: POSTGRES_URL_NON_POOLING
```
POSTGRES_URL_NON_POOLING
```
**Valor:**
```
postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c.eastus2.azure.neon.tech/neondb?sslmode=require
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

#### Variable 5: POSTGRES_USER
```
POSTGRES_USER
```
**Valor:**
```
neondb_owner
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

#### Variable 6: POSTGRES_HOST
```
POSTGRES_HOST
```
**Valor:**
```
ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

#### Variable 7: POSTGRES_PASSWORD
```
POSTGRES_PASSWORD
```
**Valor:**
```
npg_Inb9YWHGiq0K
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

#### Variable 8: POSTGRES_DATABASE
```
POSTGRES_DATABASE
```
**Valor:**
```
neondb
```
**Entornos:** ✅ Production ✅ Preview ✅ Development

---

### Paso 3: Redeploy la Aplicación

**⚠️ IMPORTANTE:** Las variables de entorno solo se aplican en nuevos deployments.

1. Ve a la pestaña **Deployments**
2. Encuentra el deployment más reciente
3. Click en los **3 puntos** (⋯)
4. Click en **Redeploy**
5. **DESACTIVA** "Use existing Build Cache"
6. Click en **Redeploy**

### Paso 4: Verificar que Funciona

1. Espera a que termine el deployment (~2-3 minutos)
2. Accede a tu app: `https://tu-app.vercel.app/admin`
3. Deberías ver el panel de admin en lugar de ser redirigido

## 🧪 Prueba Rápida

Puedes probar la API directamente desde tu navegador:

```
https://tu-app.vercel.app/api/admin/verificar
```

**Respuesta esperada (cuando funcione):**
```json
{
  "esAdmin": true,
  "usuario": {
    "id": 1,
    "nombre": "Derek Siqueiros Heredia",
    "email": "drksh2015@gmail.com"
  }
}
```

## ❓ Preguntas Frecuentes

### ¿Por qué funciona en local pero no en Vercel?

En local, las variables están en `.env.local`. Vercel necesita sus propias variables configuradas en el dashboard.

### ¿Puedo copiar el .env.local a Vercel?

No directamente. Debes agregar cada variable manualmente en el dashboard de Vercel.

### ¿Necesito hacer commit de los cambios?

No, solo necesitas configurar las variables en Vercel y redeploy. El código ya está correcto.

### ¿Qué pasa si ya tengo algunas variables?

Verifica que todas las 8 variables estén presentes. Si falta alguna, agrégala.

### ¿Cuánto tarda en aplicarse?

Inmediatamente después del redeploy (2-3 minutos).

## 🆘 Si Aún No Funciona

1. **Verifica los logs en Vercel:**
   - Deployments → selecciona el deployment
   - Functions → `/api/admin/verificar`
   - Revisa los logs de error

2. **Verifica que las variables se aplicaron:**
   - Settings → Environment Variables
   - Debe decir "8 variables" o más

3. **Limpia la caché de Vercel:**
   - Redeploy con "Use existing Build Cache" DESACTIVADO

4. **Verifica la conexión a la base de datos:**
   - En Neon Console, verifica que la base de datos esté activa
   - Verifica que no haya cambios de contraseña

## 📋 Checklist Final

Antes de contactar soporte:

- [ ] 8 variables de PostgreSQL agregadas en Vercel
- [ ] Todas marcadas para Production/Preview/Development
- [ ] Redeploy completado sin caché
- [ ] Deployment exitoso (sin errores)
- [ ] API `/api/admin/verificar` retorna 200 OK
- [ ] Usuario puede acceder a `/admin`

---

**Documentación adicional:**
- Ver: `docs/TROUBLESHOOTING_VERCEL_ADMIN.md` (guía completa)
- Ver: `docs/VERCEL_ENV_SETUP.md` (configuración de variables)
