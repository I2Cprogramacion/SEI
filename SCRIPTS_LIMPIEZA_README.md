# 🧹 Scripts de Limpieza de Usuarios

Scripts para resetear y limpiar usuarios de Clerk y PostgreSQL durante el desarrollo.

## 📋 Scripts Disponibles

### 1. `reset-clerk-users.js` - Limpiar Clerk
Elimina TODOS los usuarios de Clerk (autenticación).

```bash
# Usando npm script
pnpm run clean:clerk

# O directamente
node scripts/reset-clerk-users.js
```

**Usa esto cuando:**
- ✅ Ves "correo ya registrado" pero no aparece en Clerk Dashboard
- ✅ Quieres empezar de cero con usuarios de Clerk
- ✅ Necesitas liberar un email para re-registro

### 2. `clean-postgres-users.js` - Limpiar PostgreSQL
Elimina TODOS los investigadores de la tabla PostgreSQL.

```bash
# Usando npm script
pnpm run clean:postgres

# O directamente
node scripts/clean-postgres-users.js
```

**Usa esto cuando:**
- ✅ Quieres limpiar solo la base de datos
- ✅ Datos de prueba quedaron en PostgreSQL
- ✅ Necesitas resetear investigadores pero mantener usuarios de Clerk

### 3. `reset-all-users.js` - Reset Completo ⚡ (RECOMENDADO)
Elimina TODOS los usuarios de Clerk Y PostgreSQL en una sola ejecución.

```bash
# Usando npm script
pnpm run clean:all

# O directamente
node scripts/reset-all-users.js
```

**Usa esto cuando:**
- ✅ Quieres hacer un reset completo del sistema
- ✅ Necesitas empezar completamente de cero
- ✅ Quieres liberar tu correo para re-registro

## 🔐 Requisitos

Todos los scripts requieren variables de entorno en `.env.local`:

```bash
# Para limpiar Clerk
CLERK_SECRET_KEY=sk_test_...

# Para limpiar PostgreSQL
DATABASE_URL=postgresql://...
# O
POSTGRES_URL=postgresql://...
```

## 🎯 Uso Típico

### Escenario 1: "Mi correo ya está registrado pero no aparece en Users"

```bash
# Ejecuta el reset completo
pnpm run clean:all

# Espera la confirmación (escribe "ELIMINAR TODO")
# ✅ Listo! Ahora puedes registrarte de nuevo
```

### Escenario 2: Quiero empezar de cero

```bash
# Reset completo de todo
pnpm run clean:all

# Ve a http://localhost:3000/registro
# Registra tu cuenta nuevamente
```

### Escenario 3: Solo limpiar base de datos (mantener Clerk)

```bash
# Solo PostgreSQL
pnpm run clean:postgres
```

## ⚠️ Advertencias

### 🚨 IMPORTANTE
- ❌ **NO ejecutes esto en producción**
- ❌ **Esto elimina TODOS los datos** 
- ❌ **No se puede deshacer**

### ✅ Seguro para:
- Desarrollo local
- Testing
- Demos
- Prototipos

### ❌ NO usar en:
- Producción
- Staging con datos reales
- Ambientes compartidos

## 📊 Qué Hace Cada Script

### `reset-clerk-users.js`
1. Se conecta a Clerk API
2. Lista todos los usuarios (máximo 500)
3. Muestra detalles: nombre, email, ID, fecha
4. Pide confirmación (debes escribir "SI")
5. Elimina cada usuario uno por uno
6. Muestra resumen de eliminación

### `clean-postgres-users.js`
1. Se conecta a PostgreSQL
2. Lista todos los investigadores
3. Muestra: nombre, email, ID, fecha de registro
4. Pide confirmación (debes escribir "SI")
5. Ejecuta `DELETE FROM investigadores`
6. Muestra cantidad de registros eliminados

### `reset-all-users.js` (Completo)
1. Lista usuarios en Clerk
2. Lista investigadores en PostgreSQL
3. Muestra totales de ambos sistemas
4. Pide confirmación (debes escribir "ELIMINAR TODO")
5. Elimina de Clerk primero
6. Elimina de PostgreSQL después
7. Muestra resumen completo

## 🔍 Troubleshooting

### Error: "CLERK_SECRET_KEY no encontrada"
```bash
# Verifica tu archivo .env.local
cat .env.local | grep CLERK_SECRET_KEY

# Debe estar presente:
CLERK_SECRET_KEY=sk_test_...
```

### Error: "DATABASE_URL no encontrada"
```bash
# Verifica tu archivo .env.local
cat .env.local | grep DATABASE_URL

# O
cat .env.local | grep POSTGRES_URL
```

### Error: "Cannot find module 'pg'"
```bash
# Instala dependencias
pnpm install
```

### Error de conexión a PostgreSQL
```bash
# Verifica que tu base de datos esté accesible
# Prueba la conexión:
pnpm run test:db
```

## 💡 Tips

### 1. Verifica antes de eliminar
Los scripts siempre muestran qué se va a eliminar antes de hacerlo. **Lee cuidadosamente**.

### 2. Usa el script completo
`reset-all-users.js` es más eficiente porque hace todo de una vez.

### 3. Confirmación requerida
Todos los scripts requieren confirmación explícita para prevenir eliminaciones accidentales.

### 4. Logs detallados
Los scripts muestran cada paso del proceso para que sepas exactamente qué está pasando.

## 🔄 Flujo de Trabajo Recomendado

```bash
# 1. Limpia todo
pnpm run clean:all

# 2. Inicia el servidor de desarrollo
pnpm run dev

# 3. Ve a la página de registro
# http://localhost:3000/registro

# 4. Registra tu cuenta nuevamente
# Usa tu correo real

# 5. ¡Todo limpio y funcionando!
```

## 📝 Notas Adicionales

### Velocidad
- Clerk: ~200ms por usuario (para no saturar la API)
- PostgreSQL: Instantáneo (un solo DELETE)

### Límites
- Clerk: Máximo 500 usuarios por ejecución
- PostgreSQL: Sin límite

### Logs
Todos los scripts usan emojis para claridad:
- ✅ Éxito
- ❌ Error
- ⚠️ Advertencia
- 🔍 Búsqueda
- 🗑️ Eliminación
- 📊 Estadísticas

## 🆘 Soporte

Si tienes problemas:
1. Lee los mensajes de error cuidadosamente
2. Verifica que `.env.local` esté configurado
3. Asegúrate de que las dependencias estén instaladas: `pnpm install`
4. Verifica la conexión a PostgreSQL: `pnpm run test:db`

---

**Recuerda:** Estos scripts son para desarrollo local. **Nunca** los ejecutes en producción.
