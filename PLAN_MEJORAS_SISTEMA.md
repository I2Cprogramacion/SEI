# Plan de Mejoras del Sistema - Análisis Completo

## 🎯 Problemas Identificados y Soluciones

### 1. ✅ Redirección inteligente al ver tu propio perfil
**PROBLEMA:** Cuando un usuario ve su propio perfil desde `/investigadores/[slug]`, se muestra la vista pública en lugar del dashboard.

**SOLUCIÓN:**
- Detectar en `/investigadores/[slug]/page.tsx` si el perfil que se está viendo es del usuario autenticado
- Si es su propio perfil → redirigir automáticamente a `/dashboard`
- Si es perfil de otro → mostrar vista pública normal

**IMPLEMENTACIÓN:**
```typescript
// En app/investigadores/[slug]/page.tsx
import { useAuth } from "@clerk/nextjs"

useEffect(() => {
  const checkIfOwnProfile = async () => {
    if (userId && investigador?.clerkUserId === userId) {
      // Es tu propio perfil, redirigir al dashboard
      router.push('/dashboard')
    }
  }
  checkIfOwnProfile()
}, [userId, investigador, router])
```

---

### 2. ✅ Editar CV desde el dashboard
**PROBLEMA:** No hay forma de modificar/reemplazar el CV una vez subido desde el dashboard.

**SOLUCIÓN:**
- Agregar botón "Editar CV" o "Reemplazar CV" en el dashboard
- Permitir eliminar CV actual
- Permitir subir nuevo CV
- Mantener el componente `UploadCv` pero con funcionalidad de reemplazo

**IMPLEMENTACIÓN:**
- Botón "Cambiar CV" que abre un dialog
- Opción para eliminar CV actual
- Opción para subir nuevo CV
- Confirmación antes de eliminar

---

### 3. ✅ Sistema de mensajería con opciones
**PROBLEMA:** El sistema de mensajes no diferencia entre mensaje interno vs email directo.

**SOLUCIÓN ACTUAL (MEJOR OPCIÓN):**
El sistema ya está implementado correctamente:
- ✅ Mensajes se guardan en BD (tabla `mensajes`)
- ✅ Se envía notificación por email automáticamente
- ✅ Los usuarios pueden ver mensajes en su dashboard
- ✅ Sistema de "leído/no leído" funcional

**MEJORA REQUERIDA:**
Agregar dos botones distintos en el perfil público:
1. **"Enviar Mensaje"** → Abre dialog, guarda en BD + envía notificación email
2. **"Contactar por Email"** → Abre `mailto:` directo (sin guardar en BD)

---

### 4. ✅ Botón "Contactar por Email" directo
**PROBLEMA:** El botón "Contactar" abre el dialog de mensajes, pero algunos usuarios querrán enviar email directo.

**SOLUCIÓN:**
```tsx
// Opción 1: mailto directo
<Button 
  onClick={() => window.location.href = `mailto:${investigador.email}?subject=Contacto desde SEI`}
>
  Enviar Email
</Button>

// Opción 2: Dialog con selector de método
<Select>
  <SelectItem value="mensaje">Mensaje interno</SelectItem>
  <SelectItem value="email">Email directo</SelectItem>
</Select>
```

**IMPLEMENTACIÓN RECOMENDADA:**
- Cambiar botón "Contactar" → "Enviar Email" (mailto directo)
- Mantener botón "Mensaje" → Sistema interno (BD + notificación)
- Botón "Conectar" → Enviar solicitud de conexión

---

## 📋 Resumen de Cambios a Realizar

### Archivo 1: `app/investigadores/[slug]/page.tsx`
```typescript
CAMBIOS:
1. Importar useAuth de Clerk
2. Detectar si es el propio perfil
3. Redirigir a /dashboard si es tu perfil
4. Separar botones:
   - "Enviar Email" → mailto directo
   - "Mensaje" → Dialog interno (ya existe)
   - "Conectar" → Dialog de conexión (ya existe)
```

### Archivo 2: `app/dashboard/page.tsx`
```typescript
CAMBIOS:
1. Agregar sección "Gestionar CV"
2. Botón "Cambiar CV" con dialog
3. Opción para eliminar CV actual
4. Opción para subir nuevo CV
5. Mostrar preview del CV actual
```

### Archivo 3: `components/enviar-mensaje-dialog.tsx`
```typescript
CAMBIOS:
Ninguno - Ya funciona correctamente:
- Guarda en BD
- Envía notificación email
- Maneja errores
```

### Archivo 4: NUEVO - `components/gestionar-cv-dialog.tsx`
```typescript
CREAR:
- Dialog para gestionar CV desde dashboard
- Opción eliminar CV
- Opción subir nuevo CV
- Preview del CV actual
```

---

## 🔄 Flujo Mejorado del Usuario

### Escenario 1: Usuario ve su propio perfil
```
Usuario → /investigadores/mi-slug 
       → Detecta que es su perfil
       → Redirige a /dashboard
       → Usuario ve su dashboard con opciones de edición
```

### Escenario 2: Usuario quiere contactar a otro investigador
```
Opción A - Mensaje interno:
Usuario → Ver perfil → Click "Mensaje"
       → Abre dialog → Escribe mensaje
       → Se guarda en BD + Envía email notificación
       → Destinatario ve mensaje en su dashboard

Opción B - Email directo:
Usuario → Ver perfil → Click "Enviar Email"
       → Abre cliente de correo (mailto:)
       → No se guarda en BD
       → Email directo sin intermediarios
```

### Escenario 3: Usuario quiere actualizar su CV
```
Usuario → Dashboard → Sección "Mi CV"
       → Click "Cambiar CV"
       → Puede eliminar CV actual
       → Puede subir nuevo CV
       → CV se actualiza en BD y Vercel Blob
```

---

## 🎨 Mejoras de UX Adicionales

### 1. Vista de CV en Dashboard
```typescript
- Mostrar preview del CV actual
- Botón "Ver CV completo"
- Botón "Cambiar CV"
- Botón "Eliminar CV"
- Fecha de última actualización
```

### 2. Mensajes en Dashboard
```typescript
- Contador de mensajes no leídos (badge)
- Lista de mensajes recientes
- Filtro: Recibidos / Enviados
- Marcar como leído
- Botón "Responder"
```

### 3. Perfil Público vs Dashboard
```typescript
PERFIL PÚBLICO (/investigadores/[slug]):
- Vista de solo lectura
- Botones de contacto
- Sin opciones de edición

DASHBOARD (/dashboard):
- Vista editable
- Gestión de CV
- Ver mensajes
- Ver conexiones
- Editar perfil
```

---

## ✅ Ventajas de esta Implementación

1. **Separación clara** entre perfil público y privado
2. **UX intuitiva** - No confunde al usuario viendo su propio perfil público
3. **Mensajería completa** - Sistema interno + notificaciones email
4. **Flexibilidad** - Opción de mensaje interno O email directo
5. **Control total** - Usuario puede gestionar su CV fácilmente
6. **Base de datos utilizada** - Los mensajes se guardan para historial
7. **Sin código duplicado** - Reutilizamos componentes existentes

---

## 🚀 Orden de Implementación Recomendado

### Fase 1: Redirección de perfil propio (CRÍTICO)
- Modificar `/investigadores/[slug]/page.tsx`
- Agregar detección de usuario autenticado
- Implementar redirección a dashboard

### Fase 2: Separar botones de contacto (IMPORTANTE)
- Cambiar "Contactar" → "Enviar Email" (mailto)
- Mantener "Mensaje" → Dialog interno
- Aclarar diferencia visual entre ambos

### Fase 3: Gestión de CV desde dashboard (IMPORTANTE)
- Crear componente `gestionar-cv-dialog.tsx`
- Agregar botones en dashboard
- Implementar eliminación de CV
- Implementar reemplazo de CV

### Fase 4: Mejoras visuales (OPCIONAL)
- Mejorar preview de CV en dashboard
- Mejorar contador de mensajes
- Agregar animaciones y transiciones

---

## 📊 Estado Actual del Sistema

### ✅ Lo que YA funciona bien:
- Sistema de autenticación con Clerk
- Guardado de mensajes en BD
- Notificaciones por email
- Subida de CV a Vercel Blob
- Visualización de CV con 3 métodos
- Sistema de conexiones entre investigadores

### ⚠️ Lo que necesita mejora:
- Redirección al ver tu propio perfil
- Gestión de CV desde dashboard
- Claridad en opciones de contacto (mensaje vs email)
- Preview de CV en dashboard

---

## 💡 Decisiones Técnicas

### Base de Datos de Mensajes: ✅ USAR
**RAZÓN:** Permite:
- Historial de mensajes
- Sistema de mensajería completo
- Notificaciones
- Marcar como leído/no leído
- Búsqueda de conversaciones

### Email Directo: ✅ AGREGAR OPCIÓN
**RAZÓN:** Algunos usuarios prefieren:
- Comunicación fuera de la plataforma
- Usar su cliente de correo habitual
- Respuestas más rápidas
- No depender de login en la plataforma

### Ambos métodos coexisten = MEJOR UX 🎯

---

## 🔧 Archivos a Modificar

1. ✅ `app/investigadores/[slug]/page.tsx` - Redirección + Botones
2. ✅ `app/dashboard/page.tsx` - Gestión de CV
3. ✅ `components/gestionar-cv-dialog.tsx` - NUEVO componente
4. ✅ `app/api/investigadores/update-cv/route.ts` - NUEVO endpoint
5. ✅ `app/api/investigadores/delete-cv/route.ts` - NUEVO endpoint

---

## 🎯 Resultado Final Esperado

Un sistema completo, profesional e intuitivo donde:
- ✅ Los usuarios son redirigidos automáticamente a su dashboard
- ✅ Pueden gestionar su CV fácilmente
- ✅ Tienen opciones claras para contactar (mensaje interno o email)
- ✅ La mensajería funciona correctamente con BD + notificaciones
- ✅ La experiencia es fluida y sin confusiones

---

**Fecha:** 21 de octubre de 2025
**Estado:** Plan completo - Listo para implementación
**Prioridad:** Alta
