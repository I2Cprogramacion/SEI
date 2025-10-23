# 🚨 SOLUCIÓN COMPLETA: Por qué el registro falló

## 📋 Diagnóstico del Problema

### Estado Actual:
1. ✅ Usuario `drksh2015@gmail.com` existe en **Clerk**
2. ❌ Usuario `drksh2015@gmail.com` NO existe en **PostgreSQL**
3. ✅ Todas las columnas fueron agregadas exitosamente

### ¿Por qué falló el registro?

El frontend envía campos con nombres como:
- `nombres` (nombre de pila)
- `apellidos` (apellidos)

Pero la API espera:
- `nombre_completo` (nombre completo)

**Resultado:** El INSERT falló porque `nombre_completo` es obligatorio pero no se envió.

---

## ✅ SOLUCIÓN INMEDIATA (Manual)

### Paso 1: Obtener el Clerk User ID

1. Ve a **https://dashboard.clerk.com**
2. Selecciona tu aplicación **SEI**
3. Click en **Users** (menú lateral)
4. Busca: `drksh2015@gmail.com`
5. Click en el usuario
6. Copia el **User ID** (empieza con `user_`)

### Paso 2: Crear el Usuario en PostgreSQL

Ejecuta esto en Neon Console SQL Editor:

```sql
-- Reemplaza 'user_XXXXX' con el ID real de Clerk
INSERT INTO investigadores (
    nombres,
    apellidos,
    nombre_completo,
    correo,
    clerk_user_id,
    nacionalidad,
    fecha_registro,
    ultima_actividad,
    es_admin
) VALUES (
    'TU_NOMBRE',                      -- Tu nombre
    'TUS_APELLIDOS',                  -- Tus apellidos
    'TU_NOMBRE TUS_APELLIDOS',        -- Nombre completo
    'drksh2015@gmail.com',            -- Tu email
    'user_XXXXXXXXXXXXX',             -- ID de Clerk (obtenerlo del paso 1)
    'México',                         -- Nacionalidad
    NOW(),                            -- Fecha de registro
    NOW(),                            -- Última actividad
    TRUE                              -- ¿Eres admin? TRUE/FALSE
);

-- Verificar que se creó
SELECT id, nombre_completo, correo, clerk_user_id, es_admin 
FROM investigadores 
WHERE correo = 'drksh2015@gmail.com';
```

### Paso 3: Refrescar el Dashboard

1. Ve a **https://sei-chih.com.mx/dashboard**
2. Presiona **Ctrl + F5** (refresh forzado)
3. Ahora deberías ver tu perfil completo

---

## 🔧 SOLUCIÓN PERMANENTE (Fix del Código)

El problema está en el mapeo de campos. Necesitamos actualizar el código para que funcione correctamente.

### Opción A: Actualizar el Frontend para enviar `nombre_completo`

En `app/registro/page.tsx`, línea ~738:

```typescript
const dataToSend = {
    ...formData,
    nombre_completo: `${formData.nombres} ${formData.apellidos}`, // ← AGREGAR ESTO
    clerk_user_id: signUpAttempt.createdUserId,
    fecha_registro: new Date().toISOString(),
    origen: "ocr",
    archivo_procesado: selectedFile?.name || "",
}
```

### Opción B: Actualizar la API para construir `nombre_completo`

En `app/api/registro/route.ts`, después de línea 105:

```typescript
// Validar datos obligatorios
if (!data.nombre_completo && (!data.nombres || !data.apellidos)) {
    console.error("Falta información del nombre")
    return NextResponse.json({ 
        error: "Se requiere nombre_completo o nombres y apellidos" 
    }, { status: 400 })
}

// Si no hay nombre_completo pero sí nombres y apellidos, construirlo
if (!data.nombre_completo && data.nombres && data.apellidos) {
    data.nombre_completo = `${data.nombres} ${data.apellidos}`
    console.log("✅ nombre_completo construido:", data.nombre_completo)
}
```

---

## 📊 Verificación de Datos

### Comprobar qué campos se están enviando:

Abre las DevTools del navegador (F12) → Console, y busca:

```
Datos recibidos para registro: { ... }
```

Debería mostrar algo como:

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "nombre_completo": "Juan Pérez",  ← DEBE ESTAR PRESENTE
  "correo": "ejemplo@email.com",
  "clerk_user_id": "user_xxxxx",
  ...
}
```

---

## 🧪 Testing del Fix

### 1. Después de crear el usuario manualmente:

```bash
# En la consola del navegador (F12)
# Ve a: https://sei-chih.com.mx/dashboard
# Deberías ver:
✅ Perfil del investigador cargado
✅ Dashboard completo con tu información
```

### 2. Para probar registro de nuevos usuarios:

- Registra un nuevo usuario de prueba
- Verifica que aparezca tanto en Clerk como en PostgreSQL
- El perfil debe mostrarse completo sin "Perfil incompleto"

---

## 📝 Checklist de Resolución

- [ ] Obtuve el Clerk User ID de drksh2015@gmail.com
- [ ] Ejecuté el INSERT en Neon Console
- [ ] Verifiqué que el usuario aparece en la tabla investigadores
- [ ] Refresqué el dashboard (Ctrl + F5)
- [ ] El perfil ahora muestra datos completos
- [ ] Apliqué el fix permanente (Opción A o B)
- [ ] Testeé con un nuevo registro
- [ ] Confirmo que nuevos usuarios se guardan correctamente

---

## 🔍 Debugging Adicional

### Si el perfil sigue mostrando "incompleto":

```sql
-- Ver qué tiene el usuario en la BD
SELECT * FROM investigadores WHERE correo = 'drksh2015@gmail.com';

-- Ver si el clerk_user_id coincide
-- Compara el clerk_user_id de la BD con el de Clerk Dashboard
```

### Si otros usuarios también tienen problemas:

```sql
-- Ver usuarios con Clerk ID pero sin nombre completo
SELECT id, correo, clerk_user_id, nombre_completo, nombres, apellidos
FROM investigadores
WHERE clerk_user_id IS NOT NULL
AND (nombre_completo IS NULL OR nombre_completo = '');

-- Arreglar usuarios con nombres/apellidos pero sin nombre_completo
UPDATE investigadores
SET nombre_completo = CONCAT(nombres, ' ', apellidos)
WHERE nombre_completo IS NULL
AND nombres IS NOT NULL
AND apellidos IS NOT NULL;
```

---

## 🎯 Resumen

**Problema:** Usuario registrado en Clerk pero no en PostgreSQL por campo faltante

**Causa:** Frontend envía `nombres` + `apellidos`, API espera `nombre_completo`

**Solución Inmediata:** Crear usuario manualmente en Neon con el Clerk User ID

**Solución Permanente:** Actualizar código para construir `nombre_completo` automáticamente

---

✅ Después de seguir estos pasos, el registro debería funcionar correctamente.
