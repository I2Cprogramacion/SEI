# 🔒 Guía de Mantenimiento de Seguridad - SEI

## 📋 Tabla de Contenidos
1. [Arquitectura de Seguridad](#arquitectura)
2. [Vulnerabilidades Conocidas](#vulnerabilidades)
3. [Checklist de Deployments](#deployments)
4. [Monitoreo y Alertas](#monitoreo)
5. [Respuesta a Incidentes](#incidentes)

---

## 🏗️ Arquitectura de Seguridad {#arquitectura}

### Capas de Protección

```
┌─────────────────────────────────────────────┐
│   1. HTTP Headers (middleware.ts)           │
│   - X-Content-Type-Options                  │
│   - X-Frame-Options                         │
│   - CSP (Content-Security-Policy)           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   2. Clerk Authentication                   │
│   - JWT tokens                              │
│   - Email verification                      │
│   - Session management                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   3. API Validation (app/api/*)            │
│   - Zod schema validation                   │
│   - clerk_user_id verification              │
│   - Input sanitization                      │
│   - CAPTCHA verification                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   4. Database (Prisma + PostgreSQL)         │
│   - Parameterized queries                   │
│   - Unique constraints                      │
│   - Row-level security (opcional)           │
└─────────────────────────────────────────────┘
```

### Mecanismos Clave

#### 1. Email Validation
```typescript
// Acepta dominios institucionales
const emailValidation = z.string()
  .email('Correo inválido')
  .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
```

#### 2. clerk_user_id Verification
```typescript
const { userId } = await auth()
if (authenticatedUserId && data.clerk_user_id !== authenticatedUserId) {
  return NextResponse.json({ error: "..." }, { status: 403 })
}
```

#### 3. Input Sanitization
```typescript
// Remover caracteres peligrosos
const sanitizeString = (str: string): string =>
  str.trim().replace(/[<>]/g, '').substring(0, 500)
```

---

## 🚨 Vulnerabilidades Conocidas {#vulnerabilidades}

### ✅ CORREGIDAS (14 Mayo 2026)

| CVE | Descripción | Fix | Estatus |
|-----|-------------|-----|---------|
| - | @uacj emails rechazados | Email validation mejorada | ✅ CERRADA |
| - | Suplantación de identidad | clerk_user_id validation | ✅ CERRADA |
| - | Missing security headers | Headers en middleware | ✅ CERRADA |
| - | XSS via inputs | Input sanitization | ✅ CERRADA |

### ⚠️ PENDIENTES (No-Críticas)

| Vulnerabilidad | Riesgo | Solución | Prioridad |
|---|---|---|---|
| CSRF Tokens | Medio | Implementar tokens CSRF | Baja |
| Rate Limiting Real | Medio | Vercel Ratelimit / Upstash | Baja |
| File Malware Scan | Medio | ClamAV o VirusTotal API | Baja |
| WAF | Alto | Cloudflare WAF | Futura |

---

## ✅ Checklist de Deployments {#deployments}

### Antes de Cada Deploy

- [ ] Ejecutar tests: `npm test`
- [ ] Verificar no hay errores: `npm run build`
- [ ] Revisar cambios en seguridad: `git diff`
- [ ] Validar headers en DevTools (staging)
- [ ] Probar registro con @uacj en staging
- [ ] Verificar clerk_user_id validation
- [ ] Revisar logs de seguridad (últimas 24h)

### Después de Deploy a Producción

- [ ] Verificar headers en producción
- [ ] Monitorear logs por 1 hora
- [ ] Probar con usuario de prueba
- [ ] Verificar no hay errores 500
- [ ] Validar CSP en console (F12)
- [ ] Confirmar emails @uacj funcionan

### Rollback en Caso de Emergencia

```bash
# Si algo falla:
git revert <commit-hash>
git push origin main
# Vercel auto-redeploya
```

---

## 📊 Monitoreo y Alertas {#monitoreo}

### Métricas Clave

#### 1. Registration Attempts
```sql
-- Alertar si hay > 100 intentos de registro en 1 hora
SELECT COUNT(*) as attempts, 
       DATE_TRUNC('hour', fecha_registro) as hour
FROM investigadores
WHERE fecha_registro > NOW() - INTERVAL '1 hour'
GROUP BY hour
```

#### 2. Failed Authentications
```sql
-- Monitorear intentos fallidos de login
SELECT COUNT(*) FROM clerks_failed_attempts 
WHERE timestamp > NOW() - INTERVAL '1 hour'
```

#### 3. Security Headers Present
```javascript
// Browser console: Verificar headers
fetch('https://sei.uacj.mx').then(r => {
  console.log('X-Content-Type-Options:', r.headers.get('X-Content-Type-Options'))
  console.log('X-Frame-Options:', r.headers.get('X-Frame-Options'))
  console.log('Content-Security-Policy:', r.headers.get('Content-Security-Policy'))
})
```

### Alertas Recomendadas

| Condición | Acción |
|-----------|--------|
| 10+ intentos de suplantación en 1h | Notificar admin |
| Errores 403 en /api/registro | Investigar |
| CSP violations en logs | Revisar CSP |
| Más de 1000 registros en 1h | Verificar CAPTCHA |

---

## 🔴 Respuesta a Incidentes {#incidentes}

### Escalation Plan

```
Nivel 1: Warning
└─> Monitoreo automático detecta anomalía
    └─> Logger registra el evento

Nivel 2: Alert
└─> Alertas van a email del admin
    └─> Revisar logs en 1 hora

Nivel 3: Incident
└─> Posible breach o ataque
    └─> Ejecutar incident response plan
    └─> Notificar a stakeholders

Nivel 4: Critical
└─> Breach confirmado
    └─> Tomar sitio offline si es necesario
    └─> Ejecutar full incident response
```

### Incident Response Checklist

Si se detecta un ataque o breach:

1. **Contención (0-5 min)**
   - [ ] Documentar hora del incidente
   - [ ] Verificar logs de los últimos 24h
   - [ ] Identificar vector de ataque
   - [ ] Notificar a equipo

2. **Investigación (5-30 min)**
   - [ ] Analizar logs del servidor
   - [ ] Revisar cambios recientes de código
   - [ ] Verificar si Clerk reporta anomalías
   - [ ] Revisar database access logs

3. **Mitigación (30-60 min)**
   - [ ] Ejecutar rollback si es necesario
   - [ ] Resetear credenciales expuestas
   - [ ] Aumentar monitoreo
   - [ ] Habilitar WAF si está disponible

4. **Comunicación (1-2h)**
   - [ ] Notificar a usuarios afectados
   - [ ] Publicar status en blog/social
   - [ ] Preparar post-mortem
   - [ ] Documentar lecciones aprendidas

---

## 🔐 Mejores Prácticas

### Para Desarrolladores

1. **Nunca confíes en input del usuario**
   ```typescript
   // ❌ MAL
   const userEmail = req.body.email
   
   // ✅ BIEN
   const parsed = emailSchema.parse(req.body.email)
   ```

2. **Siempre valida clerk_user_id**
   ```typescript
   // ✅ SIEMPRE hacer esto
   const { userId } = await auth()
   if (userId !== data.clerk_user_id) {
     return NextResponse.json({ error: "..." }, { status: 403 })
   }
   ```

3. **Sanitiza strings en HTML**
   ```typescript
   // ✅ BIEN
   const safe = str.replace(/[<>]/g, '')
   ```

4. **Usa Zod para validación**
   ```typescript
   // ✅ SIEMPRE
   const data = schema.parse(rawData)
   ```

### Para Operaciones

1. **Monitorea logs diariamente**
   - Buscar errores 403, 401
   - Alertas de rate limiting
   - Intentos de suplantación

2. **Rotación de credenciales**
   - JWT secrets cada 6 meses
   - Clerk API keys cada 6 meses
   - Database passwords cada 3 meses

3. **Backups regulares**
   - BD cada 24h (Vercel/Railway configura automático)
   - Código fuente en GitHub
   - Archivos uploaded en Vercel Blob

4. **Auditoría de acceso**
   - Quién accedió al admin
   - Cuándo se modificaron registros críticos
   - Cambios de permisos

---

## 📞 Contacto de Seguridad

Para reportar vulnerabilidades:
- Email: seguridad@sei.uacj.mx
- No publicar en redes sociales
- Dar 48h para que respondamos
- Respetar embargo de divulgación responsable

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Clerk Security Docs](https://clerk.com/docs/security)
- [Vercel Security](https://vercel.com/security)
- [Zod Validation](https://zod.dev)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Última actualización:** 14 de Mayo, 2026
**Versión:** 1.0
**Estado:** ✅ ACTIVO

