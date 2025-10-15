# Sistema de Mensajería y Conexiones - Changelog

**Fecha:** 15 de Octubre, 2025
**Autor:** Copilot + DRKSH
**Commits:** 3d9dee1, 593ac7f

---

## 🎯 Resumen Ejecutivo

Se implementó un **sistema completo de mensajería y conexiones** entre investigadores con:
- Mensajes internos (enviar, recibir, responder, marcar como leído)
- Solicitudes de conexión (enviar, aceptar, rechazar)
- Notificaciones en tiempo real con badges
- UI completamente funcional con shadcn/ui

---

## 📦 Archivos Nuevos Creados

### APIs
```
✅ app/api/mensajes/no-leidos/route.ts
   - GET: Contador de mensajes no leídos
   - Usado para badge en navbar

✅ app/api/conexiones/pendientes/route.ts
   - GET: Contador de solicitudes pendientes
   - Usado para badge en navbar
```

### Componentes UI
```
✅ components/conectar-investigador-dialog.tsx
   - Diálogo modal para solicitar conexión
   - Props: investigadorId, investigadorNombre
   - Features: mensaje opcional, validaciones, toast

✅ components/enviar-mensaje-dialog.tsx
   - Diálogo modal para enviar mensajes
   - Props: investigadorId, investigadorNombre, investigadorEmail
   - Features: asunto y mensaje requeridos, validaciones
```

### Páginas Dashboard
```
✅ app/dashboard/mensajes/page.tsx
   - Vista completa de mensajería
   - Tabs: Recibidos / Enviados
   - Cards: Recibidos (azul), No leídos (naranja), Enviados (verde)
   - Features:
     * Marcar como leído automático
     * Botón Responder
     * Modal de detalle
     * Formateo de fechas relativas

✅ app/dashboard/conexiones/page.tsx
   - Vista completa de red de conexiones
   - Secciones: Conectados / Pendientes
   - Cards: Conectados (verde), Pendientes (naranja), Total (azul)
   - Features:
     * Botones Aceptar/Rechazar (solo destinatarios)
     * Badges de estado coloreados
     * Avatares con fallback
```

---

## 🔧 Archivos Modificados

### APIs Extendidas

**app/api/mensajes/route.ts**
```typescript
// AGREGADO:
- export async function PATCH() - Marcar mensaje como leído
- SELECT remitente_id, destinatario_id en GET (necesario para responder)
```

**app/api/conexiones/route.ts**
```typescript
// AGREGADO:
- export async function PATCH() - Aceptar/rechazar conexión
- Campo es_destinatario en SELECT (saber si puedo aceptar/rechazar)
- investigador_origen_id, investigador_destino_id en SELECT
```

### Componentes UI

**components/navbar.tsx**
```typescript
// AGREGADO:
- import Badge from shadcn/ui
- useState: mensajesNoLeidos, conexionesPendientes
- useEffect: cargar contadores cada 30 segundos
- Badges en DropdownMenuItems de Mensajes y Conexiones

// CAMBIOS VISUALES:
Mensajes: Badge naranja con contador
Conexiones: Badge azul con contador
```

**app/investigadores/[slug]/page.tsx**
```typescript
// MODIFICADO:
Botón "Contactar":
  ANTES: <Button asChild><a href={`mailto:...`}>
  AHORA: <Button onClick={() => setMensajeDialogOpen(true)}>

// RAZÓN:
- Consistencia con sistema interno
- No depende de cliente de email
- Usa misma UI que botón "Mensaje"
```

---

## 🗃️ Estructura de Base de Datos

### Tabla: mensajes
```sql
CREATE TABLE mensajes (
  id SERIAL PRIMARY KEY,
  remitente_id INTEGER REFERENCES investigadores(id),
  destinatario_id INTEGER REFERENCES investigadores(id),
  asunto TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leido BOOLEAN DEFAULT FALSE
);
```

### Tabla: conexiones
```sql
CREATE TABLE conexiones (
  id SERIAL PRIMARY KEY,
  investigador_origen_id INTEGER REFERENCES investigadores(id),
  investigador_destino_id INTEGER REFERENCES investigadores(id),
  estado VARCHAR(20) DEFAULT 'pendiente',
  mensaje TEXT,
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP
);
```

**Estados válidos:** 'pendiente', 'aceptada', 'rechazada'

---

## 🎨 Flujos de Usuario

### Enviar Mensaje
```
1. Ir a perfil investigador → Click "Contactar" o "Mensaje"
2. Diálogo se abre con campo "Para" pre-rellenado
3. Escribir Asunto y Mensaje (ambos requeridos)
4. Click "Enviar mensaje"
5. Toast de confirmación
6. Mensaje guardado en BD con leido=false
```

### Recibir y Responder Mensaje
```
1. Badge naranja en navbar muestra contador
2. Click avatar → Mensajes
3. Tab "Recibidos" muestra mensajes con badge "Nuevo"
4. Click en mensaje → Abre modal + marca como leído automático
5. Click "Responder" → Diálogo con asunto "Re: ..."
6. Escribir respuesta → Enviar
7. Respuesta aparece en "Enviados" del remitente original
```

### Solicitar Conexión
```
1. Ir a perfil investigador → Click "Conectar"
2. Escribir mensaje opcional
3. Click "Enviar solicitud"
4. Conexión creada con estado='pendiente'
5. Toast de confirmación
```

### Aceptar/Rechazar Conexión
```
1. Badge azul en navbar muestra contador
2. Click avatar → Conexiones
3. Sección "Solicitudes Pendientes" muestra tarjetas
4. SOLO si eres destinatario: botones Aceptar/Rechazar
5. Click botón → PATCH a API actualiza estado
6. fecha_respuesta se actualiza automáticamente
7. Conexión se mueve a "Conectados" o desaparece (si rechazada)
```

---

## 🔌 Endpoints de API

### Mensajes
```
POST   /api/mensajes
       Body: { destinatarioId, asunto, mensaje }
       Response: { success, message, mensajeId }

GET    /api/mensajes
       Response: Array<{id, asunto, mensaje, fecha_envio, leido, tipo, 
                        otro_usuario, otro_email, otro_foto, 
                        remitente_id, destinatario_id}>

PATCH  /api/mensajes
       Body: { mensajeId }
       Response: { success }
       Acción: Marca mensaje como leído

GET    /api/mensajes/no-leidos
       Response: { count: number }
```

### Conexiones
```
POST   /api/conexiones
       Body: { investigadorId, mensaje? }
       Response: { success, message, conexionId }

GET    /api/conexiones
       Response: Array<{id, estado, fecha_solicitud, fecha_respuesta,
                        id_conexion, nombre, email, fotografia_url,
                        institucion, es_destinatario}>

PATCH  /api/conexiones
       Body: { conexionId, estado: 'aceptada' | 'rechazada' }
       Response: { success }
       Acción: Actualiza estado y fecha_respuesta

GET    /api/conexiones/pendientes
       Response: { count: number }
```

---

## 🚀 Funcionalidades Implementadas

### ✅ Mensajería
- [x] Enviar mensaje desde perfil
- [x] Ver mensajes recibidos/enviados
- [x] Marcar como leído automáticamente
- [x] Responder mensajes
- [x] Badge contador en navbar
- [x] Filtros por tipo (recibido/enviado)
- [x] Estadísticas (recibidos, no leídos, enviados)
- [x] Formateo de fechas relativas
- [x] Modal de detalle
- [x] Iconos y badges "Nuevo"

### ✅ Conexiones
- [x] Solicitar conexión desde perfil
- [x] Ver red de conexiones
- [x] Aceptar solicitudes (solo destinatario)
- [x] Rechazar solicitudes (solo destinatario)
- [x] Badge contador en navbar
- [x] Filtros por estado (aceptada/pendiente)
- [x] Estadísticas (conectados, pendientes, total)
- [x] Badges de estado coloreados
- [x] Avatares con fallback

### ✅ UI/UX
- [x] Diálogos con shadcn/ui
- [x] Toast notifications
- [x] Loading states
- [x] Validaciones de formularios
- [x] Responsive design
- [x] Iconos de Lucide
- [x] Esquema de colores consistente
- [x] Actualización automática de contadores (30s)

---

## 🐛 Problemas Conocidos y Pendientes

### ❌ NO Implementado (Aún)
```
- [ ] Envío de emails de notificación (SMTP no configurado)
- [ ] Notificaciones push en tiempo real (WebSockets)
- [ ] Búsqueda/filtrado de mensajes
- [ ] Paginación (si hay muchos mensajes)
- [ ] Eliminar mensajes
- [ ] Archivar conversaciones
- [ ] Adjuntar archivos
- [ ] Emojis/markdown en mensajes
- [ ] Chat en tiempo real
```

### ⚠️ Requiere Configuración en Vercel
```
Variables de entorno necesarias:
- DATABASE_URL
- POSTGRES_URL (y todas las variantes)
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- (Opcional) RESEND_API_KEY para emails
```

---

## 📚 Dependencias Agregadas

```json
// Ya existentes (no se agregó nada nuevo)
- @clerk/nextjs
- @vercel/postgres
- date-fns (v4.1.0)
- lucide-react
- shadcn/ui components
```

---

## 🔄 Para Sincronizar con Frontend Branch

Si hay conflictos después del merge de frontend a main:

### Archivos Críticos a Revisar:
```
1. components/navbar.tsx
   - Verificar que tiene badges y useEffect
   
2. app/investigadores/[slug]/page.tsx
   - Verificar botón Contactar usa onClick, no mailto

3. Todas las APIs en app/api/mensajes/* y app/api/conexiones/*
   - No deben ser sobrescritas
   
4. Páginas app/dashboard/mensajes y app/dashboard/conexiones
   - Son nuevas, no deben tener conflictos
```

### Si Se Pierden Cambios:
```bash
# Ver este archivo para restaurar:
git show 593ac7f
git show 3d9dee1

# O restaurar archivos específicos:
git checkout 593ac7f -- app/api/mensajes/route.ts
git checkout 593ac7f -- components/navbar.tsx
```

---

## 📝 Notas Importantes

1. **Base de Datos:** Las tablas `mensajes` y `conexiones` ya existen con las columnas correctas
2. **Autenticación:** Usa Clerk currentUser() en todas las APIs
3. **Queries SQL:** Usan template literals de @vercel/postgres: sql\`SELECT ...\`
4. **Fechas:** Se formatean con date-fns: formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es })
5. **Toasts:** Usan el hook useToast() de shadcn/ui
6. **Badges:** Se actualizan cada 30 segundos en el navbar

---

## 🎓 Lecciones Aprendidas

1. Siempre verificar nombres de columnas en BD antes de escribir queries
2. Usar `es_destinatario` flag para saber quién puede aceptar/rechazar
3. Marcar como leído automáticamente mejora UX
4. Badges en navbar dan feedback inmediato al usuario
5. Separar APIs de lectura (GET) y escritura (POST/PATCH) es más limpio
6. Dialog de shadcn/ui es mejor que modales custom con position fixed

---

## ✅ Testing Checklist

Antes de deploy a production, verificar:

- [ ] Enviar mensaje desde perfil funciona
- [ ] Ver mensajes en /dashboard/mensajes funciona
- [ ] Marcar como leído funciona
- [ ] Responder mensaje funciona
- [ ] Solicitar conexión funciona
- [ ] Ver conexiones en /dashboard/conexiones funciona
- [ ] Aceptar conexión funciona (solo destinatario)
- [ ] Rechazar conexión funciona (solo destinatario)
- [ ] Badges en navbar se actualizan
- [ ] Botón Contactar abre diálogo (no mailto)
- [ ] Todo funciona en mobile/tablet
- [ ] Variables de entorno configuradas en Vercel

---

**Fin del Changelog**
