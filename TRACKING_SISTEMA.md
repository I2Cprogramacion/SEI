# 👥 Sistema de Tracking de Usuarios Activos

## 🎯 Configuración Actual (Modo Pruebas)

### ⏱️ Tiempos:
- **Actualización automática:** Cada 1 minuto
- **Usuario considerado activo:** Si tuvo actividad en el último minuto
- **Refresco del widget:** Cada 30 segundos

### 📊 En el Panel Admin verás:
1. **Total Usuarios** - Todos los registrados
2. **Usuarios Activos** - Con actividad en el último minuto
3. **Nuevos Hoy** - Registrados hoy
4. **Esta Semana** - Registrados en últimos 7 días

---

## 🔧 Cómo Funciona

### 1. Tracking Automático
Cuando un usuario inicia sesión:
- ✅ Se registra su actividad inicial
- ✅ Se actualiza cada 1 minuto automáticamente
- ✅ Es invisible (no afecta la UI)

### 2. Verificar Usuarios Activos
```bash
# Ver quién está activo ahora
node scripts/check-actividad-column.js
```

### 3. Simular Actividad (para pruebas)
```bash
# Marcar todos los usuarios como activos ahora
node scripts/simular-actividad.js
```

---

## 🚀 Pasos para Ver Múltiples Usuarios Activos

### Opción 1: Usuarios Reales
1. Abre el sitio en tu navegador normal
2. Abre el sitio en modo incógnito con otra cuenta
3. Espera 1 minuto
4. Refresca el panel admin

### Opción 2: Simulación (para pruebas rápidas)
```bash
node scripts/simular-actividad.js
```
Luego ve al panel admin y verás 3 usuarios activos.

---

## 📈 Para Producción

Cuando esté listo para producción, cambiar en 2 archivos:

### 1. `hooks/use-actividad-usuario.ts`
Línea 36:
```typescript
// Cambiar de:
}, 1 * 60 * 1000) // 1 minuto para pruebas

// A:
}, 10 * 60 * 1000) // 10 minutos
```

### 2. `app/api/admin/usuarios-stats/route.ts`
Línea 60:
```typescript
// Cambiar de:
const tiempoActividad = new Date(Date.now() - 1 * 60 * 1000) // 1 minuto

// A:
const tiempoActividad = new Date(Date.now() - 10 * 60 * 1000) // 10 minutos
```

---

## 🧪 Estado Actual

✅ **Tracking funcionando**
✅ **3 usuarios en la base de datos**
✅ **Columna ultima_actividad existe**
✅ **Todos marcados como activos** (con script de prueba)

### Verificación:
```bash
node scripts/check-actividad-column.js
```

Deberías ver:
- Total usuarios: 3
- Con actividad: 3
- Usuarios activos en último minuto: 3

---

## 🎮 Prueba en Vivo

1. Abre el panel admin: `http://localhost:3000/admin`
2. Deberías ver **3 usuarios activos**
3. El número se actualiza cada 30 segundos
4. Si un usuario no navega por 1 minuto, desaparece de activos

---

## 📝 Scripts Disponibles

```bash
# Ver estructura de columnas
node scripts/check-actividad-column.js

# Simular que todos están activos
node scripts/simular-actividad.js

# Hacer a alguien admin
node scripts/make-admin.js correo@ejemplo.com

# Verificar estructura de BD
node scripts/check-db-structure.js

# Probar APIs de admin
node scripts/test-admin-apis.js
```

---

## ⚠️ Notas Importantes

1. **En modo pruebas (1 minuto):**
   - Más fácil de probar
   - Verás cambios rápido
   - Útil para desarrollo

2. **En producción (10 minutos):**
   - Menos carga en la BD
   - Más preciso para flujo real
   - Estándar para analytics

3. **El widget se actualiza automáticamente** cada 30 segundos sin recargar la página

---

¡El sistema está funcionando correctamente! 🎉
