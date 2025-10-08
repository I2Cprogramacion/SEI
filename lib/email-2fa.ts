import nodemailer from 'nodemailer';

export async function send2FACode(email: string, code: string) {
  // Validar que las variables de entorno de SMTP estén configuradas
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      'Configuración SMTP incompleta. Verifica que las variables de entorno SMTP_HOST, SMTP_USER y SMTP_PASS estén configuradas.'
    );
  }

  // Configura aquí tu SMTP real o usa variables de entorno
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@sei.com',
    to: email,
    subject: 'Tu código de verificación SEI',
    text: `Tu código de verificación es: ${code}`,
    html: `<p>Tu código de verificación es: <b>${code}</b></p>`
  });
  return info;
}
