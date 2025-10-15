# Sistema de Notificaciones por Correo Electrónico

## 📧 Resumen

Sistema completo de notificaciones por correo electrónico para mensajes y conexiones entre investigadores. **Compatible con todos los despliegues** (local, Vercel, Railway, etc.) y **completamente opcional** (la aplicación funciona sin SMTP configurado).

**Fecha**: 15 de Octubre, 2025  
**Status**: ✅ Implementado y listo para producción  
**Prioridad**: Opcional (mejora la experiencia del usuario)

---

## ✨ Características

### 1. **Notificaciones Automáticas**
- ✅ **Nuevo mensaje**: Email al destinatario cuando recibe un mensaje
- ✅ **Nueva solicitud de conexión**: Email al investigador invitado
- ✅ **Conexión aceptada**: Email al investigador que envió la solicitud
- ✅ **Templates HTML profesionales** con branding SECCTI

### 2. **Proveedores SMTP Soportados**
- ✅ Gmail (con App Password)
- ✅ Outlook/Hotmail
- ✅ SendGrid (recomendado para producción)
- ✅ Mailgun
- ✅ Amazon SES
- ✅ Cualquier servidor SMTP personalizado

### 3. **Funcionamiento Graceful**
- ✅ Si SMTP no está configurado, la app funciona normalmente
- ✅ Si falla el email, no afecta el envío del mensaje interno
- ✅ Logs claros de estado (enviado/fallido)
- ✅ Sin bloqueo de la aplicación

---

## 🚀 Implementación

### Archivos Modificados/Creados

#### 1. **lib/email-notifications.ts** (NUEVO - 400+ líneas)
Sistema completo de notificaciones por correo:

```typescript
// Funciones principales
export async function sendEmailNotification(data: EmailNotificationData): Promise<boolean>
export async function notifyNewMessage(recipientEmail, senderName, senderEmail, subject, messagePreview): Promise<boolean>
export async function notifyNewConnectionRequest(recipientEmail, senderName, senderEmail): Promise<boolean>
export async function notifyConnectionAccepted(recipientEmail, senderName): Promise<boolean>
export function isEmailConfigured(): boolean
```

**Características**:
- Transporter de nodemailer con múltiples proveedores
- Templates HTML profesionales con CSS inline
- Textos alternativos para clientes sin HTML
- Manejo de errores sin romper la aplicación
- Detección automática de configuración

---

#### 2. **app/api/mensajes/route.ts** (MODIFICADO)
API de mensajes actualizada para enviar emails:

```typescript
import { notifyNewMessage } from "@/lib/email-notifications"
import { clerkClient } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  // ... guardar mensaje en BD ...

  // Enviar notificación por correo (no bloquear si falla)
  try {
    const senderName = user.fullName || user.firstName || 'Un investigador'
    const senderEmail = user.emailAddresses[0]?.emailAddress || ''
    
    const recipient = await (await clerkClient()).users.getUser(destinatarioClerkId)
    const recipientEmail = recipient.emailAddresses[0]?.emailAddress

    if (recipientEmail) {
      await notifyNewMessage(recipientEmail, senderName, senderEmail, asunto, mensaje)
    }
  } catch (emailError) {
    console.warn('⚠️ No se pudo enviar notificación por email:', emailError)
  }

  return NextResponse.json({ success: true })
}
```

**Cambios**:
- Import de `notifyNewMessage` y `clerkClient`
- Obtención del destinatario desde Clerk
- Envío de email en bloque try-catch separado
- No bloquea si falla el email

---

#### 3. **app/api/conexiones/route.ts** (MODIFICADO)
API de conexiones actualizada:

**POST** (nueva solicitud):
```typescript
// Después de guardar la conexión
try {
  const senderName = user.fullName || user.firstName || 'Un investigador'
  const senderEmail = user.emailAddresses[0]?.emailAddress || ''
  
  const recipient = await (await clerkClient()).users.getUser(destinatarioClerkId)
  const recipientEmail = recipient.emailAddresses[0]?.emailAddress

  if (recipientEmail) {
    await notifyNewConnectionRequest(recipientEmail, senderName, senderEmail)
  }
} catch (emailError) {
  console.warn('⚠️ No se pudo enviar notificación por email:', emailError)
}
```

**PATCH** (aceptar/rechazar):
```typescript
// Después de actualizar la conexión
if (accion === 'aceptar' && conexion.rows.length > 0) {
  try {
    const senderClerkId = conexion.rows[0].investigador_origen_id
    const accepterName = user.fullName || user.firstName || 'Un investigador'
    
    const sender = await (await clerkClient()).users.getUser(senderClerkId)
    const senderEmail = sender.emailAddresses[0]?.emailAddress

    if (senderEmail) {
      await notifyConnectionAccepted(senderEmail, accepterName)
    }
  } catch (emailError) {
    console.warn('⚠️ No se pudo enviar notificación por email:', emailError)
  }
}
```

---

#### 4. **app/api/investigadores/[slug]/route.ts** (MODIFICADO)
Agregado `clerk_user_id` al SELECT:

```typescript
SELECT 
  id,
  clerk_user_id as "clerkUserId",  // ← NUEVO
  nombre_completo as name,
  correo as email,
  ...
```

**Razón**: Los componentes de mensajes/conexiones necesitan el Clerk ID para enviar notificaciones.

---

#### 5. **components/enviar-mensaje-dialog.tsx** (MODIFICADO)
Props actualizadas:

```typescript
interface EnviarMensajeDialogProps {
  // ... props existentes ...
  investigadorClerkId: string  // ← NUEVO
}

// En el fetch:
body: JSON.stringify({
  destinatarioClerkId: investigadorClerkId,  // ← CAMBIO (antes: destinatarioId)
  asunto,
  mensaje,
}),
```

---

#### 6. **components/conectar-investigador-dialog.tsx** (MODIFICADO)
Props actualizadas:

```typescript
interface ConectarInvestigadorDialogProps {
  // ... props existentes ...
  investigadorClerkId: string  // ← NUEVO
}

// En el fetch:
body: JSON.stringify({
  destinatarioClerkId: investigadorClerkId,  // ← CAMBIO (antes: investigadorId)
  mensaje,
}),
```

---

#### 7. **app/investigadores/[slug]/page.tsx** (MODIFICADO)
Interface actualizada:

```typescript
interface InvestigadorData {
  id: number
  clerkUserId?: string  // ← NUEVO
  // ... otros campos ...
}
```

Uso de componentes actualizado:
```tsx
<EnviarMensajeDialog
  investigadorClerkId={investigador.clerkUserId || ''}  // ← NUEVO
  // ... otras props ...
/>

<ConectarInvestigadorDialog
  investigadorClerkId={investigador.clerkUserId || ''}  // ← NUEVO
  // ... otras props ...
/>
```

---

#### 8. **env.local.example** (MODIFICADO)
Agregada sección completa de SMTP:

```bash
# ========================================
# EMAIL NOTIFICATIONS (SMTP) - OPCIONAL
# ========================================
# Gmail (Opción 1)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-aqui
SMTP_FROM="SECCTI <tu-email@gmail.com>"

# SendGrid (Opción 2 - Recomendado para producción)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=tu-sendgrid-api-key
# SMTP_FROM="SECCTI <noreply@tudominio.com>"
```

---

## 🔧 Configuración

### Opción 1: Gmail (Desarrollo)

1. **Activa verificación en 2 pasos** en tu cuenta Google
2. **Genera App Password**: https://myaccount.google.com/apppasswords
3. Agrega a `.env.local`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # App Password de 16 caracteres
SMTP_FROM="SECCTI <tu-email@gmail.com>"
```

**Ventajas**: 
- ✅ Gratis
- ✅ Fácil de configurar
- ✅ Perfecto para desarrollo

**Desventajas**:
- ❌ Límite de 500 emails/día
- ❌ No ideal para producción

---

### Opción 2: SendGrid (Producción - RECOMENDADO)

1. **Crea cuenta**: https://sendgrid.com (gratis hasta 100 emails/día)
2. **Genera API Key**: Settings → API Keys → Create API Key
3. **Verifica dominio** (opcional, mejora deliverability)
4. Agrega a variables de entorno de Vercel:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM="SECCTI <noreply@tudominio.com>"
```

**Ventajas**:
- ✅ 100 emails/día gratis
- ✅ Excelente deliverability
- ✅ Dashboard con analytics
- ✅ Ideal para producción

---

### Opción 3: Mailgun

1. **Crea cuenta**: https://www.mailgun.com
2. **Obtén credenciales SMTP** del dashboard
3. Agrega a variables de entorno:

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tudominio.mailgun.org
SMTP_PASS=tu-password-aqui
SMTP_FROM="SECCTI <noreply@tudominio.com>"
```

---

### Opción 4: Sin SMTP (Default)

Si NO configuras SMTP:
- ✅ La aplicación funciona **normalmente**
- ✅ Los mensajes se envían **dentro de la app**
- ✅ Los usuarios ven notificaciones en **badges** (polling 30s)
- ⚠️ No se envían emails de notificación
- 📝 Logs muestran: `[EMAIL DISABLED] Notificación a...`

---

## 📬 Templates de Email

### 1. Nuevo Mensaje
```
Asunto: Nuevo mensaje de [Nombre]

📬 Tienes un nuevo mensaje

Hola,

[Nombre] te ha enviado un mensaje:

┌──────────────────────────┐
│ De: [Nombre] ([Email])   │
│ Asunto: [Asunto]         │
└──────────────────────────┘

Inicia sesión para ver el mensaje completo y responder.

[Ver Mensaje] → https://tudominio.com/dashboard/mensajes
```

### 2. Nueva Solicitud de Conexión
```
Asunto: [Nombre] quiere conectar contigo

🤝 Nueva solicitud de conexión

Hola,

[Nombre] quiere conectar contigo en SECCTI.

┌──────────────────────────┐
│ De: [Nombre]             │
│ Email: [Email]           │
└──────────────────────────┘

Revisa su perfil y acepta o rechaza la solicitud.

[Ver Solicitud] → https://tudominio.com/dashboard/conexiones
```

### 3. Conexión Aceptada
```
Asunto: [Nombre] aceptó tu solicitud de conexión

✅ ¡Conexión aceptada!

Hola,

[Nombre] ha aceptado tu solicitud de conexión.

Ahora puedes colaborar y comunicarte directamente.

¡Felicidades por expandir tu red de investigación!

[Ver Conexiones] → https://tudominio.com/dashboard/conexiones
```

---

## 🧪 Testing

### 1. Verificar Configuración

Crea `scripts/test-email.js`:

```javascript
import { sendEmailNotification, NotificationType, isEmailConfigured } from '../lib/email-notifications.js'

console.log('🔍 Verificando configuración SMTP...')
console.log('SMTP configurado:', isEmailConfigured())

if (isEmailConfigured()) {
  console.log('✅ SMTP está configurado')
  console.log('Host:', process.env.SMTP_HOST)
  console.log('User:', process.env.SMTP_USER)
  console.log('Port:', process.env.SMTP_PORT || 587)
  
  // Enviar email de prueba
  const result = await sendEmailNotification({
    to: 'tu-email@gmail.com',
    subject: 'Test SECCTI',
    type: NotificationType.SYSTEM_ALERT,
    data: {
      message: 'Este es un email de prueba del sistema SECCTI'
    }
  })
  
  if (result) {
    console.log('✅ Email enviado exitosamente')
  } else {
    console.log('❌ Error al enviar email')
  }
} else {
  console.log('⚠️ SMTP no configurado (esto es normal si no quieres emails)')
}
```

Ejecutar:
```bash
node scripts/test-email.js
```

---

### 2. Probar en la Aplicación

**Test 1: Enviar Mensaje**
1. Inicia sesión en la app
2. Visita perfil de investigador: `/investigadores/derek-ojeda`
3. Click "Enviar mensaje"
4. Completa el formulario y envía
5. **Resultado esperado**:
   - ✅ Mensaje guardado en BD
   - ✅ Mensaje visible en `/dashboard/mensajes`
   - ✅ Email enviado al destinatario (si SMTP configurado)
   - 📝 Log en consola: `✅ Email enviado a...` o `[EMAIL DISABLED]`

**Test 2: Solicitar Conexión**
1. Visita perfil de investigador
2. Click "Conectar"
3. (Opcional) Escribe mensaje personalizado
4. Envía solicitud
5. **Resultado esperado**:
   - ✅ Conexión guardada con estado "pendiente"
   - ✅ Visible en `/dashboard/conexiones`
   - ✅ Email enviado al destinatario (si SMTP configurado)

**Test 3: Aceptar Conexión**
1. Inicia sesión como el destinatario
2. Ve a `/dashboard/conexiones`
3. Click "Aceptar" en una solicitud pendiente
4. **Resultado esperado**:
   - ✅ Estado cambia a "aceptada"
   - ✅ Email enviado al remitente original (si SMTP configurado)

---

## 📊 Logs y Debugging

### Logs Normales

**SMTP Configurado**:
```
✅ Email enviado a investigador@email.com: <message-id@smtp.gmail.com>
```

**SMTP No Configurado**:
```
⚠️ SMTP no configurado. Las notificaciones por correo están deshabilitadas.
   Configure SMTP_HOST, SMTP_USER, SMTP_PASS en las variables de entorno.
📧 [EMAIL DISABLED] Notificación a investigador@email.com: Nuevo mensaje de Derek
```

**Error de Email (no crítico)**:
```
⚠️ No se pudo enviar notificación por email: Error: Invalid login
```

---

### Debugging

**Problema**: "No llegan los emails"

**Soluciones**:
1. **Verificar variables de entorno**:
   ```bash
   echo $SMTP_HOST
   echo $SMTP_USER
   echo $SMTP_PORT
   ```

2. **Verificar App Password (Gmail)**:
   - Usa App Password, NO tu contraseña normal
   - Formato: `xxxx-xxxx-xxxx-xxxx` (16 caracteres)

3. **Verificar puerto**:
   - Gmail: 587 (TLS) o 465 (SSL)
   - SendGrid: 587

4. **Revisar spam**:
   - Los primeros emails pueden ir a spam
   - Marca como "No spam" para futuros envíos

5. **Probar con script**:
   ```bash
   node scripts/test-email.js
   ```

---

## 🚀 Deployment

### Vercel

1. **Agregar variables de entorno**:
   ```
   Dashboard → Settings → Environment Variables
   ```

2. **Agregar cada variable**:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxxxxxxx
   SMTP_FROM="SECCTI <noreply@tudominio.com>"
   ```

3. **Aplicar a todos los entornos**:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

4. **Redeploy**:
   ```bash
   git push origin main
   ```

---

### Railway

1. **Variables de entorno**:
   ```
   Settings → Variables
   ```

2. **Agregar variables** (mismo formato que Vercel)

3. **Restart service**

---

### Render / Otras Plataformas

Proceso similar:
1. Encuentra sección de "Environment Variables"
2. Agrega las 5 variables SMTP
3. Restart/Redeploy

---

## ✅ Checklist de Verificación

### Desarrollo Local
- [ ] `nodemailer` instalado (`npm list nodemailer`)
- [ ] Variables SMTP en `.env.local`
- [ ] `npm run dev` sin errores
- [ ] Script de test funciona: `node scripts/test-email.js`
- [ ] Email de prueba recibido

### Producción
- [ ] Variables SMTP en plataforma de deployment
- [ ] Deployed sin errores
- [ ] Logs muestran `✅ Email enviado` (no `[EMAIL DISABLED]`)
- [ ] Email de nuevo mensaje funciona
- [ ] Email de nueva conexión funciona
- [ ] Email de conexión aceptada funciona
- [ ] Emails NO van a spam

---

## 📝 Notas Importantes

### 1. **Email es Opcional**
- La app **funciona perfectamente** sin SMTP
- Los mensajes internos **siempre funcionan**
- El email solo **mejora la notificación**

### 2. **No Bloquea la App**
- Si falla el email, el mensaje/conexión **se guarda igual**
- Usuario ve toast de éxito **siempre**
- Solo se loggea el error de email

### 3. **Compatibilidad Total**
- ✅ Local (con `.env.local`)
- ✅ Vercel (con variables de entorno)
- ✅ Railway
- ✅ Render
- ✅ Cualquier plataforma Node.js

### 4. **Seguridad**
- No expone contraseñas (variables de entorno)
- Usa `rejectUnauthorized: false` solo para dev
- SMTP con TLS/SSL habilitado

---

## 🔮 Mejoras Futuras (Opcional)

### 1. **Rate Limiting**
Prevenir spam de emails:
```typescript
// Limitar emails por usuario
const emailRateLimit = new Map<string, number>()

function canSendEmail(userId: string): boolean {
  const lastSent = emailRateLimit.get(userId) || 0
  const now = Date.now()
  
  if (now - lastSent < 60000) { // 1 minuto
    return false
  }
  
  emailRateLimit.set(userId, now)
  return true
}
```

### 2. **Email Queue**
Usar BullMQ o RabbitMQ para emails en cola:
```typescript
await emailQueue.add('send-notification', {
  to: recipientEmail,
  type: NotificationType.NEW_MESSAGE,
  data: { ... }
})
```

### 3. **Preferencias de Usuario**
Permitir desactivar emails:
```sql
ALTER TABLE investigadores 
ADD COLUMN email_notifications BOOLEAN DEFAULT true;
```

### 4. **Templates Personalizables**
Editor visual de templates en admin panel.

---

## 📚 Referencias

- **Nodemailer**: https://nodemailer.com/
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/
- **Vercel Env Variables**: https://vercel.com/docs/environment-variables

---

**Autor**: GitHub Copilot  
**Revisión**: DRKSH  
**Proyecto**: SEI - Sistema de Expediente de Investigadores  
**Status**: ✅ Listo para producción
