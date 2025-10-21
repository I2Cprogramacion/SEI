# 🔄 RESET COMPLETO DEL SISTEMA - COMPLETADO

**Fecha:** 21 de octubre de 2025  
**Estado:** ✅ Sistema completamente reiniciado

---

## ✅ RESULTADO DEL RESET

### Base de Datos PostgreSQL:
- ✅ **3 investigadores eliminados**
- ✅ **1 mensaje eliminado**
- ✅ **0 conexiones eliminadas**
- ✅ **0 notificaciones eliminadas**
- ✅ **Todas las tablas vacías**

### Clerk Authentication:
- ✅ **0 usuarios encontrados** (ya estaba limpio)
- ✅ **Sistema de autenticación limpio**

---

## 📋 SCRIPTS CREADOS

Se crearon 3 nuevos scripts para gestión de usuarios:

### 1. `scripts/reset-usuarios.js`
**Propósito:** Eliminar todos los usuarios y datos de PostgreSQL

**Tablas que limpia:**
- `mensajes` - Todos los mensajes entre usuarios
- `conexiones` - Todas las conexiones entre investigadores
- `notificaciones` - Todas las notificaciones
- `investigadores` - Todos los perfiles de investigadores

**Uso:**
```bash
node scripts/reset-usuarios.js
```

**Características:**
- ⏰ Countdown de 3 segundos antes de ejecutar
- 📊 Muestra cuántos registros elimina
- ✅ Verificación final de tablas vacías
- 📋 Instrucciones para Clerk Dashboard

---

### 2. `scripts/reset-clerk.js`
**Propósito:** Eliminar todos los usuarios de Clerk vía API

**Funcionalidades:**
- Lista todos los usuarios de Clerk
- Elimina cada usuario automáticamente
- Muestra progreso en tiempo real
- Verifica que Clerk esté limpio al final

**Uso:**
```bash
node scripts/reset-clerk.js
```

**Requisitos:**
- `CLERK_SECRET_KEY` en `.env.local`
- Permisos de admin en Clerk

**Características:**
- ⏰ Countdown de 3 segundos
- 📊 Contador de eliminados/errores
- 🔄 Verificación automática
- 🚀 Rate limiting (100ms entre usuarios)

---

### 3. `scripts/reset-completo.js` ⭐
**Propósito:** Script maestro que ejecuta todo en orden

**Proceso:**
1. Reset de Base de Datos (PostgreSQL)
2. Reset de Clerk (Autenticación)

**Uso:**
```bash
node scripts/reset-completo.js
```

**Características:**
- ⏰ Countdown de 5 segundos
- 🔄 Ejecuta ambos scripts en secuencia
- ✅ Verifica éxito de cada paso
- 📊 Resumen final completo
- 🛡️ Aborta si hay errores críticos

---

## 🎯 ESTADO ACTUAL DEL SISTEMA

### Base de Datos:
```
Investigadores:  0 ✅
Conexiones:      0 ✅
Mensajes:        0 ✅
Notificaciones:  0 ✅
```

### Clerk Authentication:
```
Usuarios en Clerk: 0 ✅
Estado: Limpio y listo
```

### Tablas que NO se eliminan (datos del sistema):
- ✅ `proyectos` - Catálogo de proyectos
- ✅ `publicaciones` - Catálogo de publicaciones

---

## 📖 GUÍA DE USO

### Caso 1: Reset completo (recomendado)
```bash
node scripts/reset-completo.js
```
Esto ejecutará automáticamente:
1. Reset de PostgreSQL
2. Reset de Clerk
3. Verificaciones finales

### Caso 2: Solo reset de base de datos
```bash
node scripts/reset-usuarios.js
```
Limpia PostgreSQL pero deja Clerk intacto.

### Caso 3: Solo reset de Clerk
```bash
node scripts/reset-clerk.js
```
Limpia Clerk pero deja PostgreSQL intacto.

---

## ⚠️ ADVERTENCIAS

### Antes de ejecutar:
1. ✅ Asegúrate de tener backup si es necesario
2. ✅ Verifica que estés en el ambiente correcto
3. ✅ Lee el countdown completo (5 segundos)
4. ✅ Puedes cancelar con `Ctrl+C`

### Después de ejecutar:
1. ✅ El sistema está completamente limpio
2. ✅ Puedes crear nuevos usuarios desde cero
3. ✅ Las tablas de proyectos/publicaciones se mantienen
4. ✅ Clerk está listo para nuevos registros

---

## 🚀 PRÓXIMOS PASOS

### 1. Crear usuario administrador
Después del reset, necesitas crear un nuevo admin:

```bash
# Primero registra un usuario en /registro
# Luego conviértelo en admin:
node scripts/make-admin.js
```

### 2. Registrar nuevos usuarios
- Ve a: `http://localhost:3000/registro`
- O usa: `http://localhost:3000/iniciar-sesion` para login

### 3. Verificar que todo funciona
```bash
# Verificar estructura de BD
node scripts/check-db-structure.js

# Verificar tablas de conexiones
node scripts/verificar-tablas-conexiones.js
```

---

## 📊 COMPARACIÓN: ANTES VS DESPUÉS

### ANTES del reset:
```
Base de Datos:
  - 3 investigadores
  - 1 mensaje
  - N conexiones
  - N notificaciones

Clerk:
  - 0 usuarios (ya limpio)
```

### DESPUÉS del reset:
```
Base de Datos:
  - 0 investigadores ✅
  - 0 mensajes ✅
  - 0 conexiones ✅
  - 0 notificaciones ✅

Clerk:
  - 0 usuarios ✅
```

---

## 🔧 TROUBLESHOOTING

### Error: "relation does not exist"
**Causa:** Tabla no existe en PostgreSQL  
**Solución:** El script ya fue actualizado para usar los nombres correctos

### Error: "Clerk API error"
**Causa:** CLERK_SECRET_KEY inválida  
**Solución:** Verifica `.env.local` y Clerk Dashboard

### Error: "Connection timeout"
**Causa:** No hay conexión a PostgreSQL  
**Solución:** Verifica `DATABASE_URL` en `.env.local`

---

## 📝 NOTAS TÉCNICAS

### Nombres de tablas (PostgreSQL):
```sql
mensajes        -- No "Mensaje"
conexiones      -- No "Conexion"
notificaciones  -- No "Notificaciones" (mayúscula)
investigadores  -- No "Usuario" o "Investigador"
```

### API de Clerk:
```
Base URL: https://api.clerk.com/v1
Endpoint: /users
Método DELETE: /users/{userId}
Auth: Bearer {CLERK_SECRET_KEY}
```

---

## ✅ CHECKLIST POST-RESET

- [x] Base de datos limpia
- [x] Clerk limpio
- [ ] Crear nuevo usuario admin
- [ ] Verificar login funciona
- [ ] Verificar registro funciona
- [ ] Probar dashboard
- [ ] Verificar permisos

---

**Reset completado exitosamente. Sistema listo para nuevos usuarios.**

**Scripts disponibles en:** `scripts/reset-*.js`  
**Documentación:** Este archivo  
**Próximo paso:** Crear usuario administrador
