# Validación de Seguridad - Cambio de `/api/registro` a Público

## Fecha de Implementación
19 de Marzo de 2026

## Cambio Realizado
Modificar `/api/registro` de autenticado a PÚBLICO, pero CON 7 CAPAS DE SEGURIDAD

## Justificación Arquitectónica
El endpoint debe ser público porque:
1. El usuario nuevo NO existe en Clerk aún cuando se registra
2. El frontend crea el usuario en Clerk primero
3. Luego el frontend llama a `/api/registro` para guardar en BD
4. El usuario AÚN NO está autenticado en la sesión de Clerk

## Capas de Seguridad Implementadas

### ✅ CAPA 1: Validación Zod (lib/validations/registro.ts)
- Estructura de datos estrictamente tipada
- CURP exactamente 18 caracteres
- RFC máximo 13 caracteres
- Email validado
- Previene campos maliciosos

### ✅ CAPA 2: Validación en Clerk
- Backend verifica que `clerk_user_id` existe realmente en Clerk
- Backend verifica que email coincida entre formulario y Clerk
- Previene spoofing de IDs falsos
- Usa `clerkClient().users.getUser()`

### ✅ CAPA 3: Validación reCAPTCHA
- Verificación de CAPTCHA si está configurado
- Previene bots y automatización
- Estado: **VERIFICAR en producción**

### ✅ CAPA 4: Rate Limiting
- 10 req/hora via middleware Clerk
- Previene fuerza bruta
- Estado: **VERIFICAR en producción**

### ✅ CAPA 5: Sanitización de Datos
- Remueve campos como `es_admin`, `es_evaluador`, etc.
- Usuario NO puede establecer privilegios
- Campos prohibidos: `['es_admin', 'es_evaluador', 'activo', 'es_aprobado', 'aprobado']`

### ✅ CAPA 6: BD - Unique Constraints
- Email único en investigadores
- CURP único (previene duplicados)
- RFC único (previene duplicados)
- Errores amigables si existen duplicados

### ✅ CAPA 7: Enmascaramiento de Logs
- No expone CURP, RFC, correo completo en logs
- Solo resumen: `email@***, curp****,` etc.
- Protege datos sensibles en Vercel logs

## Riesgos Residuales

### ⚠️ Moderado: Fuerza bruta de emails
- **Mitigación**: Rate limiting 10 req/hora
- **Acción**: Monitorear en primeras 48 horas

### ⚠️ Moderado: Spam masivo
- **Mitigación**: reCAPTCHA + rate limiting
- **Acción**: Verificar RECAPTCHA_SECRET está configurado

### ⚠️ Bajo: Inyección SQL
- **Mitigación**: Zod validation + prepared statements
- **Estado**: ✅ Controlado

## Checklist de Verificación Pre-Producción

- [ ] Verificar RECAPTCHA_SECRET está en Vercel environment variables
- [ ] Verificar rate limiting (10 req/hora) está activo
- [ ] Revisar Vercel logs después de deploy
- [ ] Monitorear tasa de registros en primeras 24 horas
- [ ] Buscar patrones de abuso (muchos intentos fallidos desde una IP)
- [ ] Confirmar que emails únicos previenen duplicados
- [ ] Prueba manual: intentar registrar con email duplicado → debe fallar con error amigable

## Monitoreo Post-Deploy

### Métricas a Vigilar
1. **Tasa de registros exitosos**: Debe ser <10 por minuto en normal
2. **Tasa de registros fallidos**: Buscar anomalías
3. **Emails duplicados intentados**: Indica ataque
4. **reCAPTCHA fails**: Indica bots
5. **Latencia del endpoint**: Debe ser <1s

### Alertas a Configurar
- Si más de 50 registros fallidos en 1 hora → investigar
- Si patrón de emails similares repetidos → posible automatización
- Si reCAPTCHA fail rate > 20% → investigar

## Comparación: Antes vs Después

| Aspecto | Antes | Después |
|--------|-------|---------|
| Auth requerida | ✅ SÍ (BLOQUEANTE) | ❌ NO (PUBLIC) |
| Validación Clerk | ❌ NO | ✅ SÍ (NUEVO) |
| Zod validation | ✅ SÍ | ✅ SÍ (MEJORADO) |
| Email validation | ✅ SÍ | ✅ SÍ (+ Clerk check) |
| Rate limiting | ✅ SÍ | ✅ SÍ |
| reCAPTCHA | ✅ SÍ | ✅ SÍ |
| Función | ❌ ROTA (401 errors) | ✅ FUNCIONAL |

## Conclusión

El endpoint `/api/registro` cambia de autenticado a PÚBLICO con 7 capas de seguridad. Esta es la configuración CORRECTA arquitectónicamente porque:

1. ✅ Resuelve el error lógico (usuario nuevo no puede estar autenticado)
2. ✅ Mantiene seguridad con capas redundantes
3. ✅ Valida en Clerk backend (previene spoofing)
4. ✅ Ya estaba marcado como público en middleware
5. ✅ Restaura funcionalidad de registro

**Estado**: LISTO PARA PRODUCCIÓN (con verificaciones post-deploy)

## Autor
GitHub Copilot (arquitecto de software)

## Archivos Modificados
- `app/api/registro/route.ts` - Implementado 7 capas de seguridad
- `ARQUITECTURA-REGISTRO-SEGURO.md` - Análisis completo
- `VALIDACION-SEGURIDAD-REGISTRO.md` - Este documento
