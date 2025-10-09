# 🔄 Manejo de Reinicio de Base de Datos con Clerk

## 🎯 El Problema

Cuando reinicias la base de datos PostgreSQL, **Clerk mantiene los usuarios registrados**. Esto causa que al intentar registrarte de nuevo con el mismo email, Clerk dice "email already taken" aunque la BD esté vacía.

---

## ✅ Soluciones Recomendadas

### Opción 1: Limpiar Usuarios en Clerk (Desarrollo) 🧹

**Ventajas:** Sincroniza Clerk con PostgreSQL
**Desventajas:** Requiere acceso al dashboard de Clerk

#### A. Manualmente (Recomendado)
1. Ve a: https://dashboard.clerk.com
2. Selecciona tu aplicación
3. Ve a "Users" en el menú lateral
4. Elimina los usuarios de prueba uno por uno

#### B. Con Script (Automático)
```bash
# 1. Listar usuarios
node scripts/clean-clerk-test-users.js

# 2. Descomentar sección de eliminación en el script
# 3. Ejecutar de nuevo
node scripts/clean-clerk-test-users.js
```

---

### Opción 2: Usar Emails Diferentes (Rápido) 📧

**Ventajas:** No requiere limpiar nada
**Desventajas:** Acumula usuarios de prueba

Usa emails temporales o con sufijos:
- `prueba1@test.com`
- `prueba2@test.com`
- `derek+test1@gmail.com`
- `derek+test2@gmail.com`

**Truco con Gmail:** `usuario+sufijo@gmail.com` llega a `usuario@gmail.com` pero Clerk lo ve como email diferente.

---

### Opción 3: Verificar Email Antes de Registrar ✅

Modificar el flujo de registro para:
1. Verificar si el email existe en PostgreSQL
2. Si existe en PostgreSQL pero no en Clerk → mostrar error
3. Si existe en Clerk pero no en PostgreSQL → sincronizar
4. Si no existe en ninguno → registrar en ambos

```typescript
// Pseudocódigo del flujo mejorado
async function registrar(email) {
  const existeEnPostgres = await db.buscarPorEmail(email)
  
  if (existeEnPostgres) {
    throw new Error("Email ya registrado en la base de datos")
  }
  
  try {
    // Intentar crear en Clerk
    await clerk.signUp.create({ email, password })
  } catch (clerkError) {
    if (clerkError.code === 'email_taken') {
      // Email existe en Clerk pero no en PostgreSQL
      // Opción A: Sugerir inicio de sesión
      // Opción B: Sincronizar datos
      throw new Error("Este email ya tiene cuenta. Por favor inicia sesión.")
    }
    throw clerkError
  }
  
  // Guardar en PostgreSQL
  await db.guardarInvestigador(datos)
}
```

---

### Opción 4: Modo Desarrollo sin Clerk (Solo PostgreSQL) 🔧

Para desarrollo, puedes deshabilitar temporalmente Clerk:

```typescript
// En registro/page.tsx
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development'

async function handleSubmit() {
  if (!DEVELOPMENT_MODE) {
    // Crear usuario en Clerk
    await signUp.create(...)
  }
  
  // Siempre guardar en PostgreSQL
  await fetch('/api/registro', { 
    method: 'POST',
    body: JSON.stringify(formData)
  })
}
```

---

## 🎯 Recomendación para Tu Caso

### Para Desarrollo Local:
**Opción 1 (Manual)** - Limpia usuarios en Clerk dashboard después de reiniciar BD
- Rápido y sencillo
- No requiere código adicional
- [Dashboard de Clerk](https://dashboard.clerk.com)

### Para Producción:
**Opción 3** - Implementar verificación y sincronización
- Maneja inconsistencias automáticamente
- Mejor experiencia de usuario
- Previene errores de duplicados

---

## 📝 Script Rápido

Si quieres automatizar la limpieza:

```bash
# 1. Ver usuarios en Clerk
node scripts/clean-clerk-test-users.js

# 2. Editar el script y descomentar la sección de eliminación
# 3. Ejecutar de nuevo para eliminar
node scripts/clean-clerk-test-users.js
```

---

## 🚀 Flujo Recomendado para Desarrollo

1. **Trabaja normalmente** con Clerk + PostgreSQL
2. **Cuando reinicies la BD:**
   - Ve al [Dashboard de Clerk](https://dashboard.clerk.com)
   - Elimina los usuarios de prueba manualmente (toma 30 segundos)
3. **O usa emails temporales:** `prueba+1@test.com`, `prueba+2@test.com`, etc.

---

## 🔐 Seguridad

**⚠️ IMPORTANTE:** Nunca compartas tu `CLERK_SECRET_KEY`

El script de limpieza solo debe usarse en:
- ✅ Desarrollo local
- ❌ NO en producción

---

## 📚 Referencias

- [Clerk Dashboard](https://dashboard.clerk.com)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)
- [Clerk Users Management](https://clerk.com/docs/users/overview)
