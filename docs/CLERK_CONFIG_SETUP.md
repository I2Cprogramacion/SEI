# Configuración de Clerk - Tokens y Permisos

## Configuración de Duración de Sesión (12 horas)

La duración de los tokens de sesión se configura en el Dashboard de Clerk. Sigue estos pasos:

### 1. Acceder a la Configuración de Sesiones

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)
2. Selecciona tu aplicación
3. En el menú lateral, ve a **Configure** → **Sessions**

### 2. Configurar la Duración de los Tokens

En la sección de **Session lifetime**, configura:

```
Session token lifetime: 12 hours (43200 seconds)
```

Opciones recomendadas:
- **Session token lifetime**: `43200` segundos (12 horas)
- **Inactivity timeout**: `1800` segundos (30 minutos) - opcional
- **Multi-session handling**: `Allow multiple sessions`
- **Session token template**: `Default template`

### 3. Configurar Renovación Automática

En la misma página, busca **Session token renewal**:

```
☑ Automatically renew session tokens
Renew before expiry: 3600 seconds (1 hour)
```

Esto renovará automáticamente la sesión 1 hora antes de que expire.

### 4. Guardar Cambios

Haz clic en **Save** para aplicar los cambios.

---

## Configuración de Permisos (RBAC)

### Roles Disponibles

Por ahora, configuraremos roles básicos. En el futuro se pueden expandir:

1. **admin** - Administrador del sistema
   - Acceso completo a todas las funcionalidades
   - Puede crear, editar y eliminar usuarios
   - Puede gestionar contenido

2. **investigador** (usuario por defecto)
   - Acceso a su perfil y datos
   - Puede crear y editar sus propios proyectos
   - Puede ver contenido público

3. **visitante** (no autenticado)
   - Solo puede ver contenido público
   - No puede editar ni crear contenido

### Configurar Roles en Clerk

1. Ve a **Configure** → **Organizations** (si usas organizaciones) o **Metadata** para usuarios individuales
2. Por ahora, usaremos **Public Metadata** en los usuarios para definir roles

### Agregar Rol en el Registro

El código actual en `app/api/registro/route.ts` ya guarda el rol en la base de datos PostgreSQL.

Para sincronizar con Clerk, puedes usar Clerk Webhooks o actualizar el metadata al crear el usuario.

---

## Flujo de Autenticación Actual

### 1. Registro
```
Usuario → Formulario de Registro → PostgreSQL (datos) + Clerk (autenticación)
```

### 2. Verificación de Email
```
Clerk envía código → Usuario ingresa código → Verificación exitosa → Sesión activa (12h)
```

### 3. Sesión Iniciada
```
Usuario autenticado → Acceso a /admin → Token válido por 12 horas
```

---

## Variables de Entorno Requeridas

Asegúrate de tener estas variables en tu `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URLs de Clerk (Opcional - Clerk las detecta automáticamente)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin

# Database (Neon/PostgreSQL)
DATABASE_URL=postgresql://...
```

---

## Verificar que la Sesión se Mantiene

Para verificar que la sesión se mantiene después del registro y verificación:

1. **Registra un nuevo usuario**
2. **Verifica el email con el código**
3. **Deberías ser redirigido automáticamente a `/admin`**
4. **La sesión debería mantenerse por 12 horas**
5. **Puedes cerrar y abrir el navegador y seguir autenticado**

### Probar la Duración de la Sesión

Para verificar que el token dura 12 horas:

1. Inicia sesión
2. Inspecciona las cookies del navegador (DevTools → Application → Cookies)
3. Busca la cookie `__session` de Clerk
4. Verifica que el `Expires` sea aproximadamente 12 horas desde ahora

---

## Próximos Pasos para Permisos Avanzados

Cuando quieras implementar permisos más granulares:

1. **Clerk Organizations**: Para manejar equipos e instituciones
2. **Role-Based Access Control (RBAC)**: Usar `publicMetadata` o `organizationMemberships`
3. **Webhooks**: Sincronizar roles entre Clerk y PostgreSQL
4. **Middleware personalizado**: Verificar roles antes de acceder a rutas

---

## Código Relevante

### `middleware.ts`
Define las rutas públicas y protegidas.

### `app/registro/page.tsx`
Maneja el registro y crea el usuario en Clerk + PostgreSQL.

### `app/verificar-email/page.tsx`
Verifica el email y establece la sesión activa con `setActive()`.

### `clerk.config.ts`
Configuración centralizada de Clerk (rutas, duración de sesión).

---

## Soporte

Si necesitas ayuda con la configuración:
- [Clerk Documentation - Sessions](https://clerk.com/docs/authentication/sessions)
- [Clerk Documentation - RBAC](https://clerk.com/docs/organizations/roles-permissions)
- [Next.js Middleware with Clerk](https://clerk.com/docs/references/nextjs/clerk-middleware)
