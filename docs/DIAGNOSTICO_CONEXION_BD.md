# 🔍 DIAGNÓSTICO: Problema de Conexión a Base de Datos

## 🚨 Problema Reportado

- ✅ Antes funcionaba perfectamente
- ❌ Ahora el registro en Clerk funciona
- ❌ Pero los datos NO se guardan en PostgreSQL
- ❌ Dashboard muestra "Perfil incompleto"

## 🔎 Análisis de Configuración Actual

### 1. Variables de Entorno Local (.env.local)

```
DATABASE_URL=postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb
```

**Host:** `ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech`
**Database:** `neondb`
**User:** `neondb_owner`

### 2. Código de Conexión (lib/database-config.ts)

```typescript
const dbUrl = process.env.DATABASE_URL || '';
export const currentDatabaseConfig: DatabaseConfig = parseDatabaseUrl(dbUrl);
```

✅ **Correcto:** Usa `DATABASE_URL` de las variables de entorno

### 3. Implementación PostgreSQL (lib/databases/postgresql-database.ts)

```typescript
this.client = new Client({
    host: this.config.host,
    port: this.config.port,
    database: this.config.database,
    user: this.config.username,
    password: this.config.password,
    ssl: this.config.ssl ? { rejectUnauthorized: false } : false
})
```

✅ **Correcto:** Usa la configuración parseada

---

## ⚠️ POSIBLES CAUSAS DEL PROBLEMA

### Hipótesis 1: Base de Datos Diferente en Vercel

**Síntoma:** El código apunta a la BD correcta localmente, pero Vercel puede estar usando otra

**Verificar:**
1. Ve a **Vercel Dashboard → SEI → Settings → Environment Variables**
2. Busca `DATABASE_URL`
3. **Compara** con tu `.env.local`

**Debe ser EXACTAMENTE:**
```
postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```

### Hipótesis 2: Base de Datos Vacía/Dropeada

**Síntoma:** La tabla `investigadores` no existe o no tiene las columnas necesarias

**Verificar en Neon Console:**
1. Ve a: https://console.neon.tech
2. Selecciona proyecto: `ep-super-recipe-a8kx6g4c`
3. SQL Editor → Ejecuta: `scripts/diagnostico-bd.sql`

**Resultado esperado:**
```
✅ tabla investigadores existe
✅ columna clerk_user_id existe
✅ columna ultima_actividad existe
✅ columna es_admin existe
```

### Hipótesis 3: Migraciones No Ejecutadas

**Síntoma:** Columnas faltantes causan errores en INSERT

**Solución:**
- Ejecutar `scripts/fix-all-missing-columns.sql` en Neon Console
- Verificar con `scripts/diagnostico-bd.sql`

### Hipótesis 4: Código Apunta a BD Antigua

**Síntoma:** El código usa una conexión cacheada o antigua

**Revisar:**
```typescript
// ¿Hay alguna variable hardcodeada?
// ¿Algún import que use otra configuración?
```

---

## 🔧 PASOS DE DIAGNÓSTICO

### Paso 1: Verificar Variables en Vercel

```bash
# En Vercel Dashboard → Settings → Environment Variables
# Buscar: DATABASE_URL
# Debe coincidir con .env.local
```

### Paso 2: Ver Logs en Tiempo Real

```bash
# En Vercel Dashboard → Deployments → [último deploy] → Runtime Logs
# Buscar:
- "Conectado a PostgreSQL"
- "Guardando investigador en PostgreSQL"
- Errores de conexión
```

### Paso 3: Ejecutar Diagnóstico en Neon

En **Neon Console → SQL Editor**, ejecuta:

```sql
-- Ver si la tabla existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'investigadores';

-- Ver cuántos registros hay
SELECT COUNT(*) FROM investigadores;

-- Buscar tu usuario
SELECT * FROM investigadores WHERE correo = 'drksh2015@gmail.com';
```

### Paso 4: Verificar Schema Actual vs Esperado

Ejecuta `scripts/diagnostico-bd.sql` completo en Neon Console.

---

## ✅ SOLUCIONES SEGÚN DIAGNÓSTICO

### Si DATABASE_URL es diferente en Vercel:

1. Actualiza la variable en Vercel con la correcta
2. Redeploy desde Vercel Dashboard

### Si la tabla no existe o está vacía:

```sql
-- Ejecutar en Neon Console
-- Opción A: Recrear desde cero
\i scripts/reset-database.sql

-- Opción B: Solo agregar columnas faltantes
\i scripts/fix-all-missing-columns.sql
```

### Si faltan columnas:

```sql
-- Ejecutar en Neon Console
\i scripts/fix-all-missing-columns.sql
```

### Si el usuario NO existe en PostgreSQL:

Sigue la guía en `docs/FIX_REGISTRO_COMPLETO.md`:

1. Obtén el `clerk_user_id` de Clerk Dashboard
2. Ejecuta INSERT manual en Neon Console
3. Refresca el dashboard

---

## 📊 Checklist de Verificación

- [ ] Variables de entorno en Vercel coinciden con .env.local
- [ ] Base de datos Neon existe y está accesible
- [ ] Tabla `investigadores` existe
- [ ] Todas las columnas críticas existen (clerk_user_id, nombres, etc.)
- [ ] Puedo conectarme manualmente a la BD desde Neon Console
- [ ] Los logs de Vercel muestran "Conectado a PostgreSQL"
- [ ] No hay errores de "column does not exist" en logs

---

## 🔄 Si Todo Falla: Reset Completo

**ADVERTENCIA:** Esto eliminará todos los datos existentes

```sql
-- 1. Ejecutar en Neon Console
\i scripts/reset-database.sql

-- 2. Ejecutar migraciones
\i scripts/fix-all-missing-columns.sql

-- 3. Redeploy en Vercel
```

**Luego:**
1. Registra un nuevo usuario de prueba
2. Verifica que se guarde en PostgreSQL
3. Verifica que el dashboard muestre datos completos

---

## 📝 Logs Importantes para Compartir

Si el problema persiste, comparte:

### De Vercel:
```
Runtime Logs durante el registro
(Buscar POST /api/registro)
```

### De Neon Console:
```sql
-- Resultado de este query
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
ORDER BY ordinal_position;
```

### De tu navegador (F12 → Console):
```
Logs durante el registro
(Buscar "Guardando investigador" o errores)
```

---

## 🎯 Conclusión

El problema más probable es:

1. **Variables de entorno diferentes** entre local y Vercel
2. **Base de datos dropeada** sin recrear las tablas
3. **Columnas faltantes** que causan errores silenciosos

**Acción inmediata:** Ejecuta `scripts/diagnostico-bd.sql` en Neon Console y comparte los resultados.
