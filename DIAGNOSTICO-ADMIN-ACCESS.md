# 🔍 DIAGNÓSTICO: Admin Redirecciona a Dashboard

**Problema**: Usuario con permisos admin no puede entrar a /admin, es redirigido a dashboard

**Status**: Debugging mejorado ✅ - Ahora con mensajes de error claros

---

## 🔧 Cambios Implementados

### 1. Mejor Logging en API
**Archivo**: `app/api/admin/verificar-acceso/route.ts`

Ahora retorna información de debug:
```json
{
  "tieneAcceso": false,
  "error": "Acceso denegado",
  "debug": {
    "redirect": "/dashboard",
    "usuarioEncontrado": true/false,
    "razon": "Usuario no tiene permisos" | "Usuario no encontrado en BD"
  }
}
```

### 2. Mejor Manejo de Errores en Layout
**Archivo**: `app/admin/layout.tsx`

- Muestra el error en pantalla de loading
- Diferencia entre 401 (no autenticado), 403 (sin permisos), 500 (error BD)
- Reintentos automáticos para errores de BD
- Logging detallado en consola del navegador

### 3. Información Visible al Usuario
Ahora cuando falla, el usuario ve:
```
⏳ Verificando acceso...

Error: [razón específica]
Revisar consola del navegador para más detalles
```

---

## 📋 Cómo Diagnosticar el Problema

### Paso 1: Abre la Consola del Navegador
```
F12 o Ctrl+Shift+I → Tab "Console"
```

### Paso 2: Intenta Acceder a /admin
Ve a: `https://www.sei-chih.com.mx/admin`

### Paso 3: Lee los Logs
Busca mensajes que comiencen con:
- `🔍 [AdminLayout]` - Información de la solicitud
- `📋 [API verificar-acceso]` - Resultado del servidor
- `⚠️ Usuario no tiene permisos` - Error específico
- `❌ Error checking admin auth` - Errores técnicos

### Ejemplo de Logs Exitosos:
```
🔍 [AdminLayout] Respuesta de verificar-acceso: {
  status: 200,
  tieneAcceso: true,
  esAdmin: true,
  esEvaluador: false
}
✅ Acceso de admin verificado
```

### Ejemplo de Logs Fallidos:
```
📋 [API verificar-acceso] Resultado: {
  tieneAcceso: false,
  esAdmin: false,
  esEvaluador: false,
  usuario: "email@example.com",
  redirect: "/dashboard"
}
⚠️ Usuario no tiene permisos: Usuario no tiene permisos
```

---

## 🔴 Posibles Razones por las que Falla

### 1. **Usuario no está en tabla `investigadores`**
```
debug.razon: "Usuario no encontrado en BD"
```

**Solución**: El usuario debe tener un registro en la tabla `investigadores`.

**Verificar en BD**:
```sql
SELECT * FROM investigadores WHERE correo = 'email@example.com' LIMIT 1;
```

Si no existe, crear registro:
```sql
INSERT INTO investigadores (nombre_completo, correo, clerk_user_id, es_admin, created_at)
VALUES ('Nombre', 'email@example.com', 'clerk_id', true, NOW());
```

### 2. **Usuario existe pero no tiene `es_admin = true`**
```
debug.razon: "Usuario no tiene permisos"
```

**Solución**: Actualizar la columna `es_admin`:
```sql
UPDATE investigadores 
SET es_admin = true 
WHERE correo = 'email@example.com';
```

### 3. **Error de conexión a BD (500)**
```
status: 500,
details: "Error al verificar permisos"
```

**Solución**: Verificar que DATABASE_URL está configurada correctamente en Vercel.

### 4. **Usuario no autenticado (401)**
```
error: "No autenticado"
status: 401
```

**Solución**: Hacer login primero en /iniciar-sesion

---

## 🎯 Pasos para Resolver

### Si el Usuario Existe pero No Tiene Permisos:
```sql
-- 1. Verificar estado actual
SELECT id, correo, es_admin, es_evaluador FROM investigadores WHERE correo = 'email@example.com';

-- 2. Otorgar permisos de admin
UPDATE investigadores SET es_admin = true WHERE correo = 'email@example.com';

-- 3. Verificar el cambio
SELECT id, correo, es_admin, es_evaluador FROM investigadores WHERE correo = 'email@example.com';
```

### Si el Usuario NO Existe:
```sql
-- 1. Obtener clerk_user_id del usuario (desde Clerk dashboard)
-- 2. Crear registro
INSERT INTO investigadores (
  nombre_completo, 
  correo, 
  clerk_user_id, 
  es_admin, 
  created_at
) VALUES (
  'Nombre del Admin',
  'email@example.com',
  'user_xxxxxxxxxxxx',  -- ← De Clerk
  true,
  NOW()
);
```

---

## 📞 Información Necesaria para Debug

Cuando reportes este problema, proporciona:

1. **Tu email de Clerk**: `user@example.com`
2. **Logs de consola** (F12 → Console):
   - Copia todo lo que empiece con `🔍`, `📋`, `⚠️`, `✅`, `❌`
3. **Estado de la BD**:
   - ¿Conexión a Neon funciona?
   - ¿DATABASE_URL está en Vercel?

---

## 🚀 Commits Relacionados

```
28366dc - 🔧 FIX: Mejorar debugging de acceso admin
```

---

## ✅ Próximos Pasos

1. **Abre F12** y ve a /admin
2. **Lee los logs** - Busca `debug.razon`
3. **Identifica el problema**:
   - ¿"Usuario no encontrado"?
   - ¿"Usuario no tiene permisos"?
   - ¿Error técnico?
4. **Reporta con los logs** para que podamos resolver

**Nota**: Los cambios ya están en producción. Vercel está redeployando automáticamente.
