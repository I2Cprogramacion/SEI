/**
 * Sistema de notificaciones por correo electrónico
 * Compatible con todos los despliegues (local, Vercel, Railway, etc.)
 */

import nodemailer from 'nodemailer'

// Tipos de notificación
export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  NEW_CONNECTION_REQUEST = 'new_connection_request',
  CONNECTION_ACCEPTED = 'connection_accepted',
  CONNECTION_REJECTED = 'connection_rejected',
  MENTION = 'mention',
  SYSTEM_ALERT = 'system_alert',
}

// Interface para datos de notificación
export interface EmailNotificationData {
  to: string
  subject: string
  type: NotificationType
  data: {
    senderName?: string
    senderEmail?: string
    message?: string
    url?: string
    [key: string]: any
  }
}

/**
 * Crear transporter de nodemailer
 * Soporta múltiples proveedores SMTP
 */
function createTransporter() {
  // Verificar si las variables de entorno están configuradas
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpPort = Number(process.env.SMTP_PORT) || 587

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP no configurado. Las notificaciones por correo están deshabilitadas.')
    console.warn('   Configure SMTP_HOST, SMTP_USER, SMTP_PASS en las variables de entorno.')
    return null
  }

  try {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true para 465, false para otros puertos
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Opciones adicionales para mayor compatibilidad
      tls: {
        rejectUnauthorized: false, // Para desarrollo/pruebas
      },
    })
  } catch (error) {
    console.error('❌ Error creando transporter SMTP:', error)
    return null
  }
}

/**
 * Generar HTML para el correo basado en el tipo de notificación
 */
function generateEmailHTML(notificationData: EmailNotificationData): string {
  const { type, data } = notificationData
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Plantilla base
  const baseTemplate = (title: string, content: string, buttonText?: string, buttonUrl?: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1e40af;
        }
        .header h1 {
          color: #1e40af;
          margin: 0;
          font-size: 24px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #1e40af;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          text-align: center;
        }
        .button:hover {
          background-color: #1e3a8a;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .info-box {
          background-color: #eff6ff;
          border-left: 4px solid #1e40af;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔬 SECCTI</h1>
          <p style="margin: 5px 0 0 0; color: #6b7280;">Sistema de Expediente de Ciencia, Tecnología e Innovación</p>
        </div>
        <div class="content">
          ${content}
        </div>
        ${buttonText && buttonUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${buttonUrl}" class="button">${buttonText}</a>
        </div>
        ` : ''}
        <div class="footer">
          <p>Este es un correo automático, por favor no responder.</p>
          <p>© ${new Date().getFullYear()} SECCTI - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Generar contenido según el tipo
  switch (type) {
    case NotificationType.NEW_MESSAGE:
      return baseTemplate(
        'Nuevo Mensaje',
        `
          <h2>📬 Tienes un nuevo mensaje</h2>
          <p>Hola,</p>
          <p><strong>${data.senderName || 'Un investigador'}</strong> te ha enviado un mensaje:</p>
          <div class="info-box">
            <p><strong>De:</strong> ${data.senderName} (${data.senderEmail})</p>
            <p><strong>Asunto:</strong> ${data.message || 'Sin asunto'}</p>
          </div>
          <p>Inicia sesión para ver el mensaje completo y responder.</p>
        `,
        'Ver Mensaje',
        `${baseURL}/dashboard/mensajes`
      )

    case NotificationType.NEW_CONNECTION_REQUEST:
      return baseTemplate(
        'Nueva Solicitud de Conexión',
        `
          <h2>🤝 Nueva solicitud de conexión</h2>
          <p>Hola,</p>
          <p><strong>${data.senderName || 'Un investigador'}</strong> quiere conectar contigo en SECCTI.</p>
          <div class="info-box">
            <p><strong>De:</strong> ${data.senderName}</p>
            <p><strong>Email:</strong> ${data.senderEmail}</p>
          </div>
          <p>Revisa su perfil y acepta o rechaza la solicitud.</p>
        `,
        'Ver Solicitud',
        `${baseURL}/dashboard/conexiones`
      )

    case NotificationType.CONNECTION_ACCEPTED:
      return baseTemplate(
        'Conexión Aceptada',
        `
          <h2>✅ ¡Conexión aceptada!</h2>
          <p>Hola,</p>
          <p><strong>${data.senderName || 'Un investigador'}</strong> ha aceptado tu solicitud de conexión.</p>
          <div class="info-box">
            <p>Ahora puedes colaborar y comunicarte directamente.</p>
          </div>
          <p>¡Felicidades por expandir tu red de investigación!</p>
        `,
        'Ver Conexiones',
        `${baseURL}/dashboard/conexiones`
      )

    case NotificationType.CONNECTION_REJECTED:
      return baseTemplate(
        'Solicitud de Conexión Rechazada',
        `
          <h2>❌ Solicitud rechazada</h2>
          <p>Hola,</p>
          <p><strong>${data.senderName || 'Un investigador'}</strong> ha rechazado tu solicitud de conexión.</p>
          <p>No te preocupes, hay muchos otros investigadores con los que puedes colaborar.</p>
        `,
        'Explorar Investigadores',
        `${baseURL}/explorar`
      )

    case NotificationType.MENTION:
      return baseTemplate(
        'Te han mencionado',
        `
          <h2>@️⃣ Te han mencionado</h2>
          <p>Hola,</p>
          <p><strong>${data.senderName || 'Un investigador'}</strong> te ha mencionado:</p>
          <div class="info-box">
            <p>${data.message || 'Ver mención...'}</p>
          </div>
        `,
        'Ver Mención',
        data.url || `${baseURL}/dashboard`
      )

    case NotificationType.SYSTEM_ALERT:
      return baseTemplate(
        'Alerta del Sistema',
        `
          <h2>⚠️ Alerta del Sistema</h2>
          <p>Hola,</p>
          <div class="info-box">
            <p>${data.message || 'Notificación del sistema'}</p>
          </div>
        `,
        data.url ? 'Ver Detalles' : undefined,
        data.url
      )

    default:
      return baseTemplate(
        'Notificación',
        `
          <h2>Nueva Notificación</h2>
          <p>Tienes una nueva notificación en SEI.</p>
        `,
        'Ver Notificaciones',
        `${baseURL}/dashboard`
      )
  }
}

/**
 * Enviar notificación por correo
 * @returns true si se envió exitosamente, false si falló o SMTP no está configurado
 */
export async function sendEmailNotification(
  notificationData: EmailNotificationData
): Promise<boolean> {
  try {
    const transporter = createTransporter()

    // Si no hay transporter configurado, solo logear (no es error crítico)
    if (!transporter) {
      console.log(`📧 [EMAIL DISABLED] Notificación a ${notificationData.to}: ${notificationData.subject}`)
      return false
    }

    const htmlContent = generateEmailHTML(notificationData)
    const textContent = `
      ${notificationData.subject}
      
      De: ${notificationData.data.senderName || 'Sistema SECCTI'}
      
      ${notificationData.data.message || 'Tienes una nueva notificación.'}
      
      Visita ${process.env.NEXT_PUBLIC_APP_URL || 'https://sei.vercel.app'} para más detalles.
    `.trim()

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"SECCTI" <${process.env.SMTP_USER}>`,
      to: notificationData.to,
      subject: notificationData.subject,
      text: textContent,
      html: htmlContent,
    })

    console.log(`✅ Email enviado a ${notificationData.to}: ${info.messageId}`)
    return true
  } catch (error) {
    console.error(`❌ Error enviando email a ${notificationData.to}:`, error)
    return false
  }
}

/**
 * Enviar notificación de nuevo mensaje
 */
export async function notifyNewMessage(
  recipientEmail: string,
  senderName: string,
  senderEmail: string,
  subject: string,
  messagePreview: string
): Promise<boolean> {
  return sendEmailNotification({
    to: recipientEmail,
    subject: `Nuevo mensaje de ${senderName}`,
    type: NotificationType.NEW_MESSAGE,
    data: {
      senderName,
      senderEmail,
      message: subject,
    },
  })
}

/**
 * Enviar notificación de nueva solicitud de conexión
 */
export async function notifyNewConnectionRequest(
  recipientEmail: string,
  senderName: string,
  senderEmail: string
): Promise<boolean> {
  return sendEmailNotification({
    to: recipientEmail,
    subject: `${senderName} quiere conectar contigo`,
    type: NotificationType.NEW_CONNECTION_REQUEST,
    data: {
      senderName,
      senderEmail,
    },
  })
}

/**
 * Enviar notificación de conexión aceptada
 */
export async function notifyConnectionAccepted(
  recipientEmail: string,
  senderName: string
): Promise<boolean> {
  return sendEmailNotification({
    to: recipientEmail,
    subject: `${senderName} aceptó tu solicitud de conexión`,
    type: NotificationType.CONNECTION_ACCEPTED,
    data: {
      senderName,
    },
  })
}

/**
 * Verificar si el sistema de email está configurado
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  )
}
