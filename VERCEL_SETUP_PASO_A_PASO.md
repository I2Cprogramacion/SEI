# 🚀 Configurar Variables de Entorno en Vercel - Paso a Paso

## ⚠️ Problema Actual
- ✅ En local: `/admin` funciona perfectamente
- ❌ En Vercel: `/admin` redirige a `/dashboard`
- ❌ Errores en logs: "column es_admin does not exist"
- ❌ Errores en logs: "column ultima_actividad does not exist"

## 🎯 Causas del Problema
1. **Las variables de entorno de PostgreSQL NO están configuradas en Vercel**
2. **Las columnas `es_admin` y `ultima_actividad` NO EXISTEN en la base de datos de producción**

Necesitas hacer 2 cosas:
1. Configurar variables de entorno en Vercel
2. Ejecutar script para agregar columnas faltantes en producción

---

## 📋 Solución Completa

### PARTE 1: Agregar Columnas en Base de Datos de Producción

**IMPORTANTE:** Ejecuta esto ANTES de configurar variables en Vercel.

#### Paso 1: Ejecutar Script de Actualización

Desde tu computadora local (con `.env.local` configurado):

```bash
node scripts/setup-production-db.js drksh2015@gmail.com
```

Este script:
- ✅ Agrega columna `es_admin` a la tabla `investigadores`
- ✅ Agrega columna `ultima_actividad` a la tabla `investigadores`
- ✅ Configura tu usuario como administrador

**Salida esperada:**
```
✅ Columna es_admin agregada correctamente
✅ Columna ultima_actividad agregada correctamente
✅ Usuario configurado como administrador
```

**Si el usuario no existe:**
1. Regístrate en la app de producción primero
2. Ve a: `https://tu-app.vercel.app/registro`
3. Usa el email: `drksh2015@gmail.com`
4. Vuelve a ejecutar el script

---

### PARTE 2: Configurar Variables de Entorno en Vercel

### 1️⃣ Acceder a Vercel Dashboard

**URL:** https://vercel.com/dashboard

1. Inicia sesión
2. Selecciona tu proyecto **SEI** (o como lo hayas nombrado)
3. Click en **"Settings"** (parte superior)
4. Click en **"Environment Variables"** (menú lateral izquierdo)

---

### 2️⃣ Agregar las 8 Variables

Para cada variable, sigue este proceso:

1. Click en **"Add New"** o **"Add Another"**
2. Escribe el **nombre** de la variable (Key)
3. Pega el **valor** completo (Value)
4. **MUY IMPORTANTE:** Marca los 3 checkboxes:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Click en **"Save"**

---

### 📝 Lista de Variables a Agregar

#### Variable 1: `POSTGRES_URL`
```
Nombre: POSTGRES_URL
Valor:  postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```
✅ Production | ✅ Preview | ✅ Development

---

#### Variable 2: `POSTGRES_PRISMA_URL`
```
Nombre: POSTGRES_PRISMA_URL
Valor:  postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15
```
✅ Production | ✅ Preview | ✅ Development

---

#### Variable 3: `POSTGRES_URL_NO_SSL`
```
Nombre: POSTGRES_URL_NO_SSL
Valor:  postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb
```
✅ Production | ✅ Preview | ✅ Development

---

#### Variable 4: `POSTGRES_URL_NON_POOLING`
```
Nombre: POSTGRES_URL_NON_POOLING
Valor:  postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c.eastus2.azure.neon.tech/neondb?sslmode=require
```
✅ Production | ✅ Preview | ✅ Development

---

#### Variable 5: `POSTGRES_USER`
```
Nombre: POSTGRES_USER
Valor:  neondb_owner
```
✅ Production | ✅ Preview | ✅ Development

---

#### Variable 6: `POSTGRES_HOST`
```
Nombre: POSTGRES_HOST
Valor:  ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech
```
✅ Production | ✅ Preview | ✅ Development

---

#### Variable 7: `POSTGRES_PASSWORD`
```
Nombre: POSTGRES_PASSWORD
Valor:  npg_Inb9YWHGiq0K
```
✅ Production | ✅ Preview | ✅ Development

---

#### Variable 8: `POSTGRES_DATABASE`
```
Nombre: POSTGRES_DATABASE
Valor:  neondb
```
✅ Production | ✅ Preview | ✅ Development

---

### 3️⃣ Verificar que Todo Esté Correcto

Después de agregar las 8 variables, deberías ver:

```
✅ POSTGRES_URL             Production, Preview, Development
✅ POSTGRES_PRISMA_URL      Production, Preview, Development
✅ POSTGRES_URL_NO_SSL      Production, Preview, Development
✅ POSTGRES_URL_NON_POOLING Production, Preview, Development
✅ POSTGRES_USER            Production, Preview, Development
✅ POSTGRES_HOST            Production, Preview, Development
✅ POSTGRES_PASSWORD        Production, Preview, Development (Sensitive)
✅ POSTGRES_DATABASE        Production, Preview, Development
```

**Total: 8 variables configuradas**

---

### 4️⃣ Redeploy (MUY IMPORTANTE)

**Las variables solo se aplican en nuevos deployments.**

#### Opción A: Redeploy desde Dashboard (Recomendado)

1. Ve a la pestaña **"Deployments"**
2. Encuentra el deployment más reciente (el primero de la lista)
3. Click en los **3 puntos** (⋯) al lado derecho
4. Click en **"Redeploy"**
5. En el modal que aparece:
   - **DESACTIVA** el checkbox: ❌ "Use existing Build Cache"
   - Esto forzará un rebuild completo
6. Click en **"Redeploy"**
7. Espera 2-3 minutos a que termine

#### Opción B: Push de Git (Automático)

Si prefieres, simplemente haz un push desde tu computadora:

```bash
git commit --allow-empty -m "trigger: Redeploy para aplicar variables de entorno"
git push
```

Esto también activará un nuevo deployment.

---

### 5️⃣ Probar que Funciona

#### Test 1: API de Verificación

Abre en tu navegador:
```
https://tu-app.vercel.app/api/admin/verificar
```

**Respuesta esperada (Éxito):**
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

**Si ves error 500 o 404:**
- Las variables no se aplicaron correctamente
- Verifica que todas las 8 estén configuradas
- Asegúrate de haber hecho redeploy sin caché

#### Test 2: Panel Admin

Accede a:
```
https://tu-app.vercel.app/admin
```

**Resultado esperado:**
- ✅ Deberías ver el panel de admin
- ✅ Widget con estadísticas de usuarios
- ✅ Sin redirección a `/dashboard`

---

## 🔍 Troubleshooting

### ❌ Problema: "Usuario no encontrado en la base de datos"

**Causa:** El usuario no existe en la base de datos de producción.

**Solución:**
1. Regístrate en la app de producción: `https://tu-app.vercel.app/registro`
2. Usa el mismo email: `drksh2015@gmail.com`
3. Después, ejecuta desde tu computadora local:
   ```bash
   node scripts/make-admin.js drksh2015@gmail.com
   ```

### ❌ Problema: "Usuario no es administrador"

**Causa:** El usuario existe pero `es_admin = false`.

**Solución:**
```bash
node scripts/make-admin.js drksh2015@gmail.com
```

### ❌ Problema: "Missing connection string"

**Causa:** Variables no configuradas o mal escritas.

**Solución:**
- Verifica que todas las 8 variables estén presentes
- Verifica que no haya espacios extra en los valores
- Redeploy sin caché

### ❌ Problema: Sigue sin funcionar después de todo

**Solución:**
1. Verifica los logs en Vercel:
   - Deployments → tu deployment → Functions → `/api/admin/verificar`
   - Lee el error exacto
2. Ejecuta el diagnóstico local:
   ```bash
   node scripts/check-admin-vercel.js drksh2015@gmail.com
   ```
3. Verifica conexión a Neon:
   - https://console.neon.tech/
   - Asegúrate de que la base de datos esté activa

---

## ✅ Checklist Final

Marca cada item cuando lo completes:

- [ ] Accedí a Vercel Dashboard → Settings → Environment Variables
- [ ] Agregué las 8 variables de PostgreSQL
- [ ] Todas las variables tienen los 3 checkboxes marcados (Production, Preview, Development)
- [ ] Hice redeploy SIN usar caché existente
- [ ] El deployment terminó sin errores
- [ ] Probé `/api/admin/verificar` y retorna 200 OK con `esAdmin: true`
- [ ] Accedí a `/admin` y veo el panel sin redirección

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir todos los pasos aún no funciona:

1. **Revisa los logs de Vercel** (Deployments → Functions → ver logs)
2. **Ejecuta diagnóstico local:** `node scripts/check-admin-vercel.js drksh2015@gmail.com`
3. **Verifica que el deployment se completó** (debe decir "Ready" con checkmark verde)

---

## 📚 Documentación Adicional

- `SOLUCION_VERCEL_ADMIN.md` - Guía rápida de solución
- `docs/TROUBLESHOOTING_VERCEL_ADMIN.md` - Guía completa de troubleshooting
- `scripts/check-admin-vercel.js` - Script de diagnóstico

---

**¡Una vez configurado, el panel de admin funcionará perfectamente en Vercel!** 🎉
