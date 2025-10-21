# Guía de Configuración para Vercel - Sistema de Mensajería

## 🚀 Variables de Entorno Requeridas en Vercel

### 1. Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2. PostgreSQL (Neon)
```bash
DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
POSTGRES_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
POSTGRES_PRISMA_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require&pgbouncer=true
POSTGRES_URL_NO_SSL=postgresql://usuario:password@host.neon.tech/dbname
POSTGRES_URL_NON_POOLING=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
POSTGRES_USER=usuario
POSTGRES_HOST=host.neon.tech
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=dbname
```

### 3. Opcional - Email (Resend)
```bash
RESEND_API_KEY=re_...
```

---

## 📋 Checklist Pre-Deploy

### Base de Datos
- [ ] Tablas `mensajes` y `conexiones` creadas
- [ ] Columnas correctas (investigador_origen_id, investigador_destino_id)
- [ ] Datos de prueba insertados

### Verificación Local
- [ ] `npm run build` exitoso
- [ ] No hay errores de TypeScript
- [ ] Todas las APIs responden correctamente
- [ ] UI se renderiza sin problemas

### Vercel
- [ ] Variables de entorno configuradas
- [ ] Build & Development Settings: Next.js detectado
- [ ] Environment: Production

---

## 🔍 Verificación Post-Deploy

### APIs a Probar
```
GET  https://tu-dominio.vercel.app/api/mensajes
GET  https://tu-dominio.vercel.app/api/mensajes/no-leidos
POST https://tu-dominio.vercel.app/api/mensajes
     Body: {"destinatarioId": 1, "asunto": "Test", "mensaje": "Test"}

GET  https://tu-dominio.vercel.app/api/conexiones
GET  https://tu-dominio.vercel.app/api/conexiones/pendientes
POST https://tu-dominio.vercel.app/api/conexiones
     Body: {"investigadorId": 1}
```

### Páginas a Visitar
```
https://tu-dominio.vercel.app/dashboard/mensajes
https://tu-dominio.vercel.app/dashboard/conexiones
https://tu-dominio.vercel.app/investigadores/[slug]
```

---

## 🐛 Troubleshooting Común

### Error: "No autenticado"
**Causa:** Clerk no está configurado correctamente
**Solución:** Verificar CLERK_SECRET_KEY y NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

### Error: "Cannot connect to database"
**Causa:** Variables de PostgreSQL incorrectas
**Solución:** Copiar exactamente desde Neon Dashboard

### Error: 500 en /api/mensajes
**Causa:** Tabla no existe o columnas incorrectas
**Solución:** Ejecutar migrations o crear tablas manualmente

### Badges no aparecen
**Causa:** APIs de contadores no responden
**Solución:** Verificar que /api/mensajes/no-leidos y /api/conexiones/pendientes retornan { count: number }

---

## 📧 Configurar Emails (Opcional)

### Usando Resend (Recomendado)

1. **Crear cuenta en Resend**
   - Ir a https://resend.com
   - Sign up gratis (3,000 emails/mes)

2. **Obtener API Key**
   - Dashboard → API Keys → Create
   - Copiar key (empieza con `re_`)

3. **Configurar en Vercel**
   ```bash
   RESEND_API_KEY=re_tu_key_aqui
   ```

4. **Código ya implementado en:**
   - `lib/email-2fa.ts` (estructura base)
   - Solo descomentar secciones TODO en:
     * `app/api/mensajes/route.ts` línea 77
     * `app/api/conexiones/route.ts` línea XX

### Implementación Básica (Resend)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'SEI <noreply@tu-dominio.com>',
  to: destinatario.correo,
  subject: 'Nuevo mensaje en SEI',
  html: `<p>Has recibido un nuevo mensaje...</p>`
});
```

---

## 🔄 Comandos Útiles

### Deploy Manual
```bash
git add .
git commit -m "feat: sistema de mensajería"
git push origin main
# Vercel detecta el push y deploya automáticamente
```

### Ver Logs en Vercel
```bash
vercel logs [deployment-url]
```

### Redeploy sin cambios
```bash
# En Vercel Dashboard → Deployments → ... → Redeploy
```

---

## ✅ Validación Final

Ejecutar estos tests en production:

1. **Login**
   - Iniciar sesión con Clerk
   - Verificar que perfil carga

2. **Enviar Mensaje**
   - Ir a perfil de otro investigador
   - Click "Contactar"
   - Enviar mensaje de prueba
   - Verificar que aparece en /dashboard/mensajes

3. **Solicitar Conexión**
   - Click "Conectar"
   - Enviar solicitud
   - Verificar que aparece en /dashboard/conexiones

4. **Badges**
   - Verificar que badges muestran contadores
   - Esperar 30 segundos
   - Verificar que se actualizan

---

## 🆘 Soporte

Si algo falla después del merge:

1. **Ver changelog completo:**
   - `SISTEMA_MENSAJERIA_CHANGELOG.md`

2. **Ver commits:**
   ```bash
   git log --oneline --grep="mensaje\|conexion"
   ```

3. **Restaurar archivo específico:**
   ```bash
   git checkout 593ac7f -- [archivo]
   ```

4. **Ver diff:**
   ```bash
   git diff main origin/frontend
   ```

---

**Última actualización:** 15 Octubre 2025
