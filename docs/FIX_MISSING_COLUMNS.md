# 🚨 ERRORES CRÍTICOS EN PRODUCCIÓN - Columnas Faltantes

## 📋 Resumen de Errores

La base de datos PostgreSQL en Neon tiene múltiples columnas faltantes que causan errores 500 en producción:

### Errores Detectados:

1. ❌ `column "ultimo_grado_estudios" does not exist` - API de perfil de investigador
2. ❌ `column "es_admin" does not exist` - Verificación de administradores
3. ❌ `column "ultima_actividad" does not exist` - Tracking de actividad de usuarios
4. ❌ `column "nombres" does not exist` - Registro de nuevos usuarios
5. ❌ `column "fecha_registro" does not exist` - API de proyectos recientes

---

## 🔧 SOLUCIÓN URGENTE

### Paso 1: Ejecutar Migración Completa en Neon Console

1. **Abre Neon Console**: https://console.neon.tech
2. **Selecciona tu proyecto**: SEI
3. **Ve a SQL Editor**
4. **Copia y pega** el contenido completo de: `scripts/fix-all-missing-columns.sql`
5. **Ejecuta** (Click en RUN ▶️)

### Paso 2: Verificar Resultados

Después de ejecutar la migración, deberías ver:

```
✅ MIGRACIÓN COMPLETADA
================================================
Total investigadores: X
Con clerk_user_id: X
Con nombres: X
Administradores: X
```

### Paso 3: Probar en Producción

1. Ve a https://sei-chih.com.mx/dashboard
2. Verifica que ya no aparezcan errores 500
3. Intenta registrar un nuevo usuario
4. Verifica que el perfil se guarde correctamente

---

## 📊 Columnas que se Agregarán

### Tabla `investigadores`:

| Columna | Tipo | Propósito |
|---------|------|-----------|
| `clerk_user_id` | VARCHAR(255) | Vincular con Clerk Auth |
| `ultima_actividad` | TIMESTAMP | Tracking de usuarios activos |
| `es_admin` | BOOLEAN | Identificar administradores |
| `nombres` | VARCHAR(255) | Nombre(s) del investigador |
| `apellidos` | VARCHAR(255) | Apellido(s) del investigador |
| `ultimo_grado_estudios` | VARCHAR(255) | Grado académico máximo |

### Tabla `proyectos`:

| Columna | Tipo | Propósito |
|---------|------|-----------|
| `fecha_registro` | TIMESTAMP | Fecha de creación del proyecto |

---

## 🔍 Diagnóstico del Problema

### Causa Raíz:

El código de la aplicación espera ciertas columnas que no existen en la base de datos de producción. Esto puede ocurrir porque:

1. Las migraciones no se ejecutaron en producción
2. El esquema local difiere del esquema en Neon
3. Se agregaron funcionalidades sin actualizar la BD

### Impacto:

- ❌ Usuarios no pueden registrarse correctamente
- ❌ Perfiles muestran "Perfil incompleto"
- ❌ Dashboard muestra errores 500
- ❌ Panel de admin no funciona
- ❌ APIs de búsqueda fallan

---

## 📝 Detalles de Cada Error

### 1. Error: `ultimo_grado_estudios`

**Archivo afectado:** `/api/investigadores/perfil`

**Query que falla:**
```sql
SELECT ultimo_grado_estudios FROM investigadores WHERE clerk_user_id = ?
```

**Solución:** 
- Si existe `grado_maximo_estudios`, se renombrará automáticamente
- Si no existe, se creará nueva columna

---

### 2. Error: `es_admin`

**Archivo afectado:** `/api/admin/verificar`

**Query que falla:**
```sql
SELECT es_admin FROM investigadores WHERE clerk_user_id = ?
```

**Solución:** Se crea columna `es_admin BOOLEAN DEFAULT FALSE`

---

### 3. Error: `ultima_actividad`

**Archivo afectado:** `/api/usuario/actividad`

**Query que falla:**
```sql
UPDATE investigadores SET ultima_actividad = NOW() WHERE clerk_user_id = ?
```

**Solución:** Se crea columna `ultima_actividad TIMESTAMP DEFAULT NOW()`

---

### 4. Error: `nombres` / `apellidos`

**Archivo afectado:** `/api/registro`

**Query que falla:**
```sql
INSERT INTO investigadores (nombres, apellidos, ...) VALUES (?, ?, ...)
```

**Problema:** La BD puede tener `nombre_completo` en lugar de `nombres` + `apellidos`

**Solución:** 
- Se crean columnas `nombres` y `apellidos`
- Se intenta separar `nombre_completo` existente
- Se preserva `nombre_completo` para compatibilidad

---

### 5. Error: `fecha_registro` en proyectos

**Archivo afectado:** `/api/proyectos/recent`

**Query que falla:**
```sql
SELECT * FROM proyectos ORDER BY fecha_registro DESC LIMIT 5
```

**Solución:** Se crea columna y se copia desde `fecha_inicio` si existe

---

## 🧪 Testing Después de la Migración

### Checklist de Verificación:

- [ ] Ejecuté la migración en Neon Console
- [ ] Vi el mensaje "✅ MIGRACIÓN COMPLETADA"
- [ ] Verifiqué las columnas en la tabla de resultados
- [ ] Abrí https://sei-chih.com.mx/dashboard sin errores
- [ ] Intenté registrar un nuevo usuario → éxito
- [ ] El perfil muestra datos completos
- [ ] El panel de admin funciona
- [ ] Las APIs de búsqueda responden 200

---

## 🔄 Si los Errores Persisten

### Opción 1: Verificar Variables de Entorno

```bash
# En Vercel Dashboard → Settings → Environment Variables
DATABASE_URL=postgresql://...  # ¿Apunta a la BD correcta?
DATABASE_TYPE=postgresql
```

### Opción 2: Forzar Redeploy en Vercel

1. Ve a Vercel Dashboard → Deployments
2. Click en los 3 puntos del último deploy
3. Click en "Redeploy"
4. Espera 2-3 minutos

### Opción 3: Verificar Esquema Manualmente

Ejecuta en Neon SQL Editor:

```sql
-- Ver todas las columnas de investigadores
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
ORDER BY ordinal_position;

-- Ver todas las columnas de proyectos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'proyectos' 
ORDER BY ordinal_position;
```

---

## 📞 Soporte

Si después de ejecutar la migración sigues viendo errores:

1. **Comparte el output completo** de la migración en Neon
2. **Comparte los logs** de Vercel Runtime Logs
3. **Ejecuta la query de verificación** y comparte los resultados

---

## ⚠️ IMPORTANTE

**NO ELIMINES DATOS:** Este script solo **AGREGA** columnas, nunca elimina datos existentes.

**BACKUP AUTOMÁTICO:** Neon hace backups automáticos, pero si quieres seguridad extra:

```sql
-- Crear backup manual de investigadores
CREATE TABLE investigadores_backup_20251022 AS 
SELECT * FROM investigadores;
```

---

## 📚 Archivos Relacionados

- `scripts/fix-all-missing-columns.sql` - Migración completa
- `scripts/add-clerk-user-id.sql` - Migración anterior (parcial)
- `scripts/reset-database.sql` - Schema completo de referencia
- `docs/TROUBLESHOOTING_REGISTRO.md` - Guía de registro

---

✅ **Después de ejecutar esta migración, todos los errores 500 deberían resolverse.**
