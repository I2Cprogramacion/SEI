# 🚨 TROUBLESHOOTING: Usuario registrado en Clerk pero NO en PostgreSQL

## 📋 Síntomas

- ✅ Usuario aparece en Clerk Dashboard
- ❌ Perfil muestra "Perfil incompleto"
- ❌ Solo aparece el correo, sin nombre ni datos
- ❌ No aparece en la tabla `investigadores` de PostgreSQL

---

## 🔍 Causa

La columna `clerk_user_id` **NO existe** en la tabla `investigadores` de tu base de datos Neon.

Cuando el frontend intenta guardar:
```json
{
  "nombre_completo": "Juan Pérez",
  "correo": "juan@example.com",
  "clerk_user_id": "user_2abc123xyz",  // ← Esta columna NO EXISTE
  ...
}
```

PostgreSQL responde con error:
```
column "clerk_user_id" of relation "investigadores" does not exist
```

Pero como el código dice "continuar aunque falle", el usuario queda registrado solo en Clerk.

---

## ✅ SOLUCIÓN URGENTE

### Paso 1: Ejecutar migración SQL en Neon

1. **Abre Neon Console**: https://console.neon.tech
2. **Selecciona tu proyecto** SEI
3. **Ve a SQL Editor** (panel izquierdo)
4. **Copia y pega** el siguiente SQL:

```sql
-- Agregar columna clerk_user_id
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_investigadores_clerk_id 
ON investigadores(clerk_user_id);

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
AND column_name = 'clerk_user_id';
```

5. **Click en RUN** ▶️
6. **Verifica** que aparezca: `clerk_user_id | character varying`

---

### Paso 2: Verificar que funcionó

Después de ejecutar la migración, registra un nuevo usuario de prueba:

1. Ve a https://sei-chih.com.mx/registro
2. Llena el formulario completo
3. Click en "Completar Registro"
4. Abre la consola del navegador (F12)
5. Busca el log: `✅ Datos guardados en PostgreSQL`

Si NO ves ese log, busca:
```
❌ ERROR AL GUARDAR EN POSTGRESQL
🚨 ERROR: Falta ejecutar migración SQL en Neon
```

---

### Paso 3: Vincular usuarios existentes (opcional)

Si ya tienes usuarios registrados solo en Clerk que quieres vincular:

```sql
-- Ver usuarios en Clerk que no están en PostgreSQL
-- (Necesitas hacer esto manualmente comparando los correos)

-- Ejemplo: Agregar usuario existente
INSERT INTO investigadores (
  nombre_completo,
  correo,
  clerk_user_id,
  fecha_registro
) VALUES (
  'Usuario Existente',
  'drksh2015@gmail.com',
  'user_ID_DE_CLERK_AQUI',  -- Obtén esto del Clerk Dashboard
  NOW()
);
```

---

## 🧪 Testing Rápido

### Verificar columna existe:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
AND column_name = 'clerk_user_id';
```

**Esperado:** Debe retornar 1 fila con `clerk_user_id`

### Ver usuarios registrados:
```sql
SELECT 
  id, 
  nombre_completo, 
  correo, 
  clerk_user_id, 
  fecha_registro 
FROM investigadores 
ORDER BY fecha_registro DESC 
LIMIT 10;
```

**Esperado:** Usuarios recientes deben tener `clerk_user_id` poblado

---

## 📊 Checklist de Verificación

- [ ] Ejecuté la migración SQL en Neon Console
- [ ] Verifiqué que la columna `clerk_user_id` existe
- [ ] Verifiqué que el índice fue creado
- [ ] Esperé 2 minutos después del último deploy
- [ ] Probé registrar un nuevo usuario
- [ ] Vi el log "✅ Datos guardados en PostgreSQL"
- [ ] El perfil del nuevo usuario muestra datos completos
- [ ] El usuario aparece en la tabla `investigadores`

---

## ❌ Si sigue fallando después de la migración

### 1. Verificar que se está enviando clerk_user_id

Abre DevTools (F12) → Network → Busca POST `/api/registro` → Request Payload:

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "clerk_user_id": "user_2abc...",  // ← Debe estar presente
  ...
}
```

### 2. Ver logs del servidor en Vercel

1. Ve a Vercel Dashboard → SEI → Runtime Logs
2. Busca errores después de registrar:
   ```
   Error al guardar investigador en PostgreSQL: column "clerk_user_id" does not exist
   ```

Si ves este error → La migración no se ejecutó correctamente

### 3. Conexión a base de datos

Verifica que Vercel tenga las variables de entorno correctas:

```
POSTGRES_URL=postgresql://...
DATABASE_TYPE=postgresql
```

---

## 🔧 Solución Alternativa (Si la migración no funciona)

Si por alguna razón no puedes ejecutar la migración en Neon Console, el código tiene una migración automática que se ejecuta al inicializar:

```typescript
// En lib/databases/postgresql-database.ts
await this.client.query(`
  ALTER TABLE investigadores 
  ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255)
`)
```

Pero necesitas **forzar una reconexión**. Reinicia la app:

1. Ve a Vercel Dashboard
2. Settings → Functions
3. Click en "Redeploy"

---

## 📝 Resumen

**El problema:** Columna `clerk_user_id` falta en la base de datos

**La solución:** Ejecutar migración SQL en Neon Console

**El resultado esperado:** Usuarios se guardan tanto en Clerk como en PostgreSQL

---

✅ **Después de ejecutar la migración, todo debería funcionar correctamente.**

Si sigues teniendo problemas, comparte:
1. Screenshot del resultado de la migración en Neon
2. Logs de la consola del navegador al registrar
3. Runtime Logs de Vercel durante el registro
