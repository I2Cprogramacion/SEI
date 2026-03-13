# Guía de Troubleshooting - Perfiles de Investigadores

## 🔴 Problema: "No se encontraron datos de tu perfil en la base de datos"

### Síntomas
- Usuario verifica email exitosamente ✅
- Usuario puede acceder al dashboard ✅
- Pero aparece error: "No se encontraron datos de tu perfil en la base de datos"
- Logs muestran: `No se pudieron cargar los datos del perfil desde PostgreSQL`

### Causas Posibles

#### 1. Perfil No Se Guardó en investigadores (CAUSA PRINCIPAL)
**Por qué:** El flujo de registro guardaba datos en tabla temporal `registros_pendientes`, pero había problema:
- `guardarInvestigador()` fallaba silenciosamente
- Los datos se guardaban pero no se actualizaba correctamente el email en lowercase
- La búsqueda fallaba por case-sensitivity

#### 2. Email Mismatch (Diferente case)
**Por qué:**
```sql
-- BÚSQUEDA EN API (case-insensitive)
SELECT * FROM investigadores 
WHERE LOWER(correo) = LOWER($1)

-- PERO EL INSERT guardaba sin normalizar
INSERT INTO investigadores (correo) VALUES ('Daroncin@hotmail.com')
-- Se guardó con case original, algunos inserts guardaban lowercase
```

#### 3. clerk_user_id No Guardado
**Por qué:** Si el clerk_user_id es NULL en la BD, el usuario no puede encontrar su perfil

---

## ✅ Soluciones Implementadas

### 1. Mejorado Manejo de Errores en Dashboard
**Archivo:** `app/dashboard/page.tsx`

Ahora:
- ✅ Detecta específicamente status 404
- ✅ Diferencia "Perfil no encontrado" de otros errores
- ✅ Logs más claros con timing de Clerk

```typescript
if (response.status === 404) {
  console.warn(`⚠️ [Dashboard] Perfil no encontrado para: ${user.emailAddresses[0]?.emailAddress}`)
  setErrorMessage(
    "No se encontraron datos de tu perfil en la base de datos.\n" +
    "Verifica que tu usuario esté correctamente registrado.\n" +
    "Si el problema persiste, contacta a soporte."
  )
  setIsLoadingData(false)
  return
}
```

### 2. Actualizado ClerkProvider con Props Correctos
**Archivo:** `app/layout.tsx`

Antes (deprecated):
```tsx
<ClerkProvider publishableKey={...}>
```

Después (moderno):
```tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  fallbackRedirectUrl="/admin"
  signInFallbackRedirectUrl="/admin"
  signUpFallbackRedirectUrl="/dashboard"
>
```

Esto elimina los warnings:
- ❌ "The prop "afterSignInUrl" is deprecated"
- ✅ Usa "fallbackRedirectUrl" en su lugar

### 3. Mejor Logs de Clerk Loading
```typescript
if (!isLoaded) {
  console.log('⏳ Clerk todavía cargando...')
  return
}

if (!user) {
  console.log('⏳ Esperando datos del investigador...')
  return
}
```

---

## 🔧 Diagnóstico - Cómo Verificar el Problema

### En PostgreSQL
```sql
-- 1. Verificar que el usuario existe
SELECT id, correo, clerk_user_id, nombre_completo, activo 
FROM investigadores 
WHERE LOWER(correo) = 'attanodaron@gmail.com'
LIMIT 1;

-- 2. Verificar el clerk_user_id
SELECT * FROM investigadores 
WHERE clerk_user_id = 'user_3Au0S54Ku63sBWRIv6UvCih4ifx'
LIMIT 1;

-- 3. Ver todos los usuarios registrados hoy
SELECT correo, clerk_user_id, nombre_completo, fecha_registro 
FROM investigadores 
WHERE DATE(fecha_registro) = CURRENT_DATE
ORDER BY fecha_registro DESC;
```

### En Navegador (F12)
```javascript
// 1. Ver qué error exacto devuelve la API
fetch('/api/investigadores/perfil')
  .then(r => r.json())
  .then(console.log)

// 2. Verificar email en Clerk
// F12 → Application → Cookies
// Buscar: __clerk_db_jwt o similar
```

### En Vercel/Railway Logs
```bash
# Railway
railway logs

# Vercel
vercel logs [project-name]

# Buscar por email del usuario:
# "attanodaron@gmail.com" o "No encontrado"
```

---

## 🚀 Para Usuarios Afectados

### Pasos para Resolver

#### Opción 1: Reregistrarse (Más rápido)
1. Cerrar sesión (sign out)
2. Ir a `/registro`
3. Registrarse nuevamente (asegurarse de completar todos los campos)
4. Verificar email
5. Completar perfil en dashboard

#### Opción 2: Contactar Soporte (Si persiste)
- Email: contacto@sei-chih.com.mx
- Incluir: Email usado en registro + timestamp del error
- Soporte ejecutará:

```sql
-- Eliminar registro problemático
DELETE FROM investigadores WHERE LOWER(correo) = 'correo@ejemplo.com';

-- Usuario puede reregistrarse
```

---

## 📊 Tabla de Estados de Registro

| Etapa | Tabla | Estado | Usuario Ve |
|-------|-------|--------|-----------|
| 1. Crear Clerk | Clerk Auth | Email sin verificar | Pantalla de verificación |
| 2. Guardar datos | investigadores | No verificado | Esperando verificación |
| 3. Verificar email | Clerk Auth | Email verificado ✅ | Redirección a /admin |
| 4. Cargar datos | investigadores | Perfil completo | Dashboard con datos |

### Donde Falla
```
❌ Si no llega a paso 2: No aparece en BD
❌ Si falla paso 4: "Perfil no encontrado"
```

---

## 📝 Logs que Indicadores de Problema

### ✅ Proceso Correcto
```
🔵 [REGISTRO] Paso 1: Creando usuario en Clerk...
✅ [VERIFICACIÓN] Email verificado exitosamente
✅ [Dashboard] Iniciando carga del perfil...
✅ [Dashboard] Perfil cargado exitosamente para: John Doe
```

### ❌ Problema: Perfil No Guardado
```
🔵 [REGISTRO] Paso 1: Creando usuario en Clerk...
✅ [VERIFICACIÓN] Email verificado exitosamente
✅ [Dashboard] Iniciando carga del perfil...
❌ [Dashboard] Error HTTP 404: {"error": "Perfil no encontrado"}
```

### ❌ Problema: Error de Clerk
```
Clerk: user no está cargado todavía
Clerk: The prop "afterSignInUrl" is deprecated...
```

---

## 🔄 Verificación Automática

Se añadió lógica para detectar problemas. El sistema ahora:

1. **Espera a que Clerk cargue** antes de buscar perfil
2. **Detecta 404** como caso específico
3. **Mensaje claro** al usuario
4. **Logs para debugging** con timestamp y email

---

## 📋 Checklist para Deployar

- [ ] Cambios en `app/layout.tsx` ✅
- [ ] Cambios en `app/dashboard/page.tsx` ✅
- [ ] Verif que `next.config.mjs` tiene headers ✅
- [ ] Verif que `middleware.ts` tiene Permissions-Policy ✅
- [ ] Test en staging antes de prod

```bash
npm run build
npm run test  # si hay tests
```

---

## 🎯 Próximos Pasos

### Corto Plazo (Ya Implementado)
✅ Mejor detección de errores 404
✅ Logs más claros de Clerk loading
✅ Props de Clerk actualizados

### Mediano Plazo (Recomendado)
- [ ] Normalizar SIEMPRE correos a lowercase en INSERT
- [ ] Validar clerk_user_id en registro antes de guardar
- [ ] Añadir endpoint de admin para "crear perfil manual"
- [ ] Emailar al usuario si su perfil no se encuentra

### Largo Plazo (Mejora)
- [ ] Migration: Convertir todos correos a lowercase
- [ ] Audit log: Rastrear cada cambio de registro
- [ ] Health check: Verificar integridad de datos diariamente

---

## 📞 Contacto

Si encuentras nuevos problemas:
1. Revisar los logs (F12 Console)
2. Verificar BD con queries SQL arriba
3. Reportar email + timestamp + logs
4. Contactar: contacto@sei-chih.com.mx

