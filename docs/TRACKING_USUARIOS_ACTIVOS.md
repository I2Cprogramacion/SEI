# Sistema de Tracking de Usuarios Activos

## ✅ Implementación Completada

### **Funcionalidad**
El sistema ahora detecta y muestra usuarios activos en tiempo real con las siguientes características:

- **Actualización automática cada 10 minutos** por usuario activo
- **Detección de usuarios activos** en los últimos 10 minutos
- **Estadísticas en tiempo real** en el panel de administración
- **Tracking automático** sin intervención del usuario

---

## 📋 Componentes Implementados

### **1. Base de Datos**
✅ **Columna `ultima_actividad`** agregada a la tabla `investigadores`
- Tipo: `TIMESTAMP`
- Default: `NOW()`
- Actualización automática cada 10 minutos

### **2. API de Actividad** (`/api/usuario/actividad`)
✅ Endpoint POST que actualiza la última actividad del usuario
- Usa `CURRENT_TIMESTAMP` para mayor precisión
- Valida autenticación con Clerk
- Maneja errores gracefully

### **3. Hook de Actividad** (`hooks/use-actividad-usuario.ts`)
✅ Hook React que:
- Registra actividad inicial al cargar
- Actualiza cada **10 minutos** automáticamente
- Se limpia correctamente al desmontar
- Solo funciona para usuarios autenticados

### **4. Tracker Component** (`components/actividad-usuario-tracker.tsx`)
✅ Componente que:
- Se incluye en el layout principal
- Ejecuta el hook automáticamente
- No renderiza ningún UI (invisible)

### **5. API de Estadísticas** (`/api/admin/usuarios-stats`)
✅ Retorna:
- **Total de usuarios** registrados
- **Usuarios activos** (últimos 10 minutos)
- **Nuevos usuarios hoy** (si existe columna de fecha)
- **Nuevos usuarios esta semana** (si existe columna de fecha)
- Timestamp de la consulta

### **6. Widget de Estadísticas** (`components/usuarios-activos-widget.tsx`)
✅ Muestra en el panel de admin:
- Total de usuarios (azul)
- Usuarios activos en 10 min (verde)
- Nuevos hoy (azul)
- Nuevos esta semana (morado)
- Actualización automática cada 30 segundos

---

## 🔄 Flujo de Funcionamiento

```
Usuario autentica
    ↓
Layout carga ActividadUsuarioTracker
    ↓
Hook useActividadUsuario se ejecuta
    ↓
Registra actividad inicial (POST /api/usuario/actividad)
    ↓
Cada 10 minutos: POST /api/usuario/actividad
    ↓
API actualiza investigadores.ultima_actividad
    ↓
Panel admin consulta GET /api/admin/usuarios-stats
    ↓
Cuenta usuarios con ultima_actividad >= (ahora - 10 min)
    ↓
Widget muestra el número en tiempo real
```

---

## 🎯 Cómo Funciona

### **Para Usuarios**
1. El usuario inicia sesión
2. Su actividad se registra automáticamente
3. Cada 10 minutos, su `ultima_actividad` se actualiza
4. No requiere ninguna acción del usuario

### **Para Administradores**
1. Acceder a `/admin`
2. Ver widget de "Usuarios Activos"
3. El número muestra usuarios con actividad en los últimos 10 minutos
4. Se actualiza automáticamente cada 30 segundos

---

## 🔧 Configuración

### **Intervalo de Actualización**
```typescript
// En hooks/use-actividad-usuario.ts
setInterval(() => {
  registrarActividad()
}, 10 * 60 * 1000) // 10 minutos
```

### **Ventana de Usuarios Activos**
```typescript
// En app/api/admin/usuarios-stats/route.ts
const tiempoActividad = new Date(Date.now() - 10 * 60 * 1000) // 10 minutos
```

### **Actualización del Widget**
```typescript
// En components/usuarios-activos-widget.tsx
const interval = setInterval(fetchStats, 30000) // 30 segundos
```

---

## 📊 Ejemplo de Datos

### **Respuesta de /api/admin/usuarios-stats**
```json
{
  "totalUsuarios": 2,
  "usuariosActivos": 1,
  "usuariosNuevosHoy": 0,
  "usuariosNuevosSemana": 0,
  "timestamp": "2025-10-14T22:30:00.000Z"
}
```

---

## 🔒 Seguridad

- ✅ Solo usuarios autenticados pueden registrar actividad
- ✅ Solo administradores pueden ver estadísticas
- ✅ Validación de permisos en todas las APIs
- ✅ Usa Clerk para autenticación

---

## 🚀 Scripts Útiles

### **Agregar columna ultima_actividad**
```bash
node scripts/add-ultima-actividad.js
```

### **Marcar usuario como admin**
```bash
node scripts/make-admin.js email@example.com
```

---

## ✨ Próximas Mejoras (Opcionales)

1. **Tracking más granular**: Actualizar cada 5 minutos en lugar de 10
2. **Dashboard de usuarios**: Ver lista detallada de usuarios activos
3. **Gráficos históricos**: Mostrar actividad por hora/día
4. **Notificaciones**: Alertar cuando hay picos de actividad
5. **Exportar datos**: Descargar reportes de actividad

---

## 📝 Notas Importantes

- El sistema usa la columna `ultima_actividad` que debe existir en la tabla `investigadores`
- Si no existe la columna `fecha_registro` o `created_at`, los contadores de "nuevos usuarios" mostrarán 0
- El tracking solo funciona para usuarios autenticados con Clerk
- La actividad se registra automáticamente sin intervención del usuario

---

**Última actualización**: 14 de Octubre, 2025
**Estado**: ✅ Completamente funcional
