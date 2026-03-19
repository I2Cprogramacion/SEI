# Arquitectura de Registro Seguro - Análisis Completo

## Problema Identificado
El endpoint `/api/registro` estaba requiriendo autenticación Clerk, pero el flujo de registro invoca este endpoint ANTES de que el usuario esté autenticado (solo ha creado la cuenta en Clerk, no la ha verificado).

## Solución Arquitectónica - Cambio de `/api/registro`

### 1. ANÁLISIS DE IMPACTO PREVIO

#### 1.1 Casos de Uso del Endpoint
```
✓ Caso 1: Usuario nuevo → Crea cuenta en Clerk → Llama /api/registro (NO AUTENTICADO)
✓ Caso 2: Usuario autenticado → Completa datos → Llama /api/completar-registro (SÍ AUTENTICADO)
```

#### 1.2 Dónde se Invoca `/api/registro`
- **app/registro/page.tsx** (línea ~1174): Cliente lado del usuario nuevo
  - Usuario anónimo llena formulario
  - Crea usuario en Clerk
  - Llama POST /api/registro con clerk_user_id nuevo
  - AÚN NO está autenticado en la sesión

#### 1.3 Rutas Relacionadas
- `/api/registro` - PÚBLICO (nuevo comportamiento)
- `/api/completar-registro` - AUTENTICADO (verificación de email)
- `/api/registro-directo` - Mencionado en docs pero verificar si existe

#### 1.4 Middleware Configuration
- [middleware.ts](middleware.ts#L24): `/api/registro` YA está en la lista de rutas públicas
  - Esto significa: La intención original ERA hacerlo público
  - El middleware ya lo permite
  - Pero el endpoint tenía `auth()` implementado → **CONFLICTO ARQUITECTÓNICO**

### 2. CAPAS DE SEGURIDAD EXISTENTES

#### 2.1 Validación Zod (FORTALEZA)
- [lib/validations/registro.ts](lib/validations/registro.ts)
- ✅ Valida estructura de datos
- ✅ Tipos estrictos
- ✅ CURP exactamente 18 caracteres
- ✅ RFC máximo 13 caracteres
- ✅ URLs validadas
- ✅ Email validado
- ✅ **Requiere clerk_user_id** (previene spoofing básico)

#### 2.2 Rate Limiting (VERIFICAR)
- [middleware.ts](middleware.ts#L24) menciona: "10 req/hora en /api/registro"
- ⚠️ CRÍTICO: Verificar si rate limiting está activo en Vercel

#### 2.3 reCAPTCHA (VERIFICAR)
- [app/api/registro/route.ts](app/api/registro/route.ts): `verificarCaptcha()` existe
- ⚠️ CRÍTICO: Verificar si `RECAPTCHA_SECRET` está configurado

#### 2.4 Enmascaramiento de Logs (FORTALEZA)
- [app/api/registro/route.ts](app/api/registro/route.ts#L30): `enmascararDatos()`
- ✅ No expone CURP, RFC, correo completo en logs

#### 2.5 Sanitización de Campos (FORTALEZA)
- [app/api/registro/route.ts](app/api/registro/route.ts#L95): Remueve campos de seguridad
- ✅ No permite establecer es_admin, es_evaluador, etc.

#### 2.6 Validaciones en BD (VERIFICAR)
- ✅ Index en LOWER(correo) para duplicados rápidos
- ✅ Constraints en CURP y RFC
- ⚠️ Verificar si hay unique constraints

### 3. RIESGOS IDENTIFICADOS AL HACER PÚBLICO

#### 3.1 Sin autenticación, necesitamos:
| Riesgo | Mitigación | Estado |
|--------|-----------|--------|
| Spam masivo | Rate limiting 10 req/hora | ⚠️ Verificar |
| Fuerza bruta de emails | Rate limiting + registro único | ⚠️ Verificar |
| Inyección SQL | Zod + Prepared statements en DB | ✅ |
| Spoofing de clerk_user_id | Validar que coincida con Clerk | ❌ **NUEVO: Necesario** |
| Datos maliciosos | Zod schema | ✅ |
| Exposición de logs | Enmascaramiento | ✅ |
| CAPTCHA bypass | Verificar RECAPTCHA_SECRET | ⚠️ Verificar |

#### 3.2 CRÍTICO: Validación de clerk_user_id
**Problema actual**: 
- El frontend envía `clerk_user_id` que dice haber creado
- Backend NO valida que ese ID realmente exista en Clerk
- Un atacante podría enviar IDs falsos

**Solución necesaria**:
```typescript
// Verificar que el clerk_user_id existe y es válido
const user = await clerkClient.users.getUser(data.clerk_user_id)
if (!user) {
  return NextResponse.json(
    { error: 'Clerk user ID inválido' },
    { status: 400 }
  )
}
```

### 4. PLAN DE IMPLEMENTACIÓN SEGURA

#### PASO 1: Verificar Rate Limiting
- Confirmar que Vercel/Clerk está aplicando 10 req/hora
- Si no está activo: Implementar rate limiting en el endpoint

#### PASO 2: Verificar reCAPTCHA
- Confirmar que RECAPTCHA_SECRET está en variables de entorno
- Confirmar que el endpoint valida CAPTCHA ANTES de procesar

#### PASO 3: Agregar Validación de clerk_user_id
- Backend debe verificar que el user existe en Clerk
- Usar `clerkClient.users.getUser()`
- NO procesar si el user no existe

#### PASO 4: Agregar Unique Constraints en BD
- Email único
- CURP único
- RFC único
- Prevenir registros duplicados

#### PASO 5: Audit Logging
- Registrar todos los intentos de registro (éxito y error)
- IP del cliente
- Timestamp
- Resumen de datos (enmascarado)

#### PASO 6: Monitoreo
- Alertar si hay spike en intentos de registro
- Alertar si muchos registros fallan por duplicados
- Dashboard de patrones de abuso

### 5. IMPLEMENTACIÓN

#### Phase A: Verificaciones Previas (SIN cambiar código en producción)
```
❌ DETENIDO: No seguir hasta completar esta phase
```

1. Revisar Vercel logs de `/api/registro` últimas 24 horas
2. Verificar si RECAPTCHA_SECRET está configurado
3. Revisar rate limits en Vercel
4. Revisar constraints de BD en Neon

#### Phase B: Implementación Segura
```
Pendiente de Phase A
```

1. Agregar validación de clerk_user_id con Clerk API
2. Asegurar CAPTCHA está activo
3. Asegurar rate limiting está activo
4. Hacer público el endpoint (ya está, solo limpiar código)
5. Hacer push a Vercel

#### Phase C: Monitoreo Post-Cambio
```
Después de Phase B
```

1. Monitorear tasa de registros
2. Monitorear tasas de error
3. Buscar patrones de abuso
4. Alertar si anomalía

### 6. ESTADO ACTUAL

#### ❌ LO QUE HICE MAL
- Cambié el endpoint a público sin:
  - Verificar rate limiting
  - Verificar CAPTCHA
  - Agregar validación de clerk_user_id
  - Documentar implicaciones de seguridad
  - Hacer un plan de monitoreo

#### ✅ LO QUE ESTÁ BIEN
- Zod validation es sólida
- Enmascaramiento de logs existe
- Sanitización de campos existe
- Middleware ya incluye en rutas públicas

#### ⏳ LO QUE FALTA
- Verificar rate limiting está activo
- Verificar CAPTCHA está activo
- Validar clerk_user_id en backend
- Agregar unique constraints en BD
- Implementar audit logging
- Configurar monitoreo

## Recomendación

**REVERTIR el cambio hasta completar Phase A**

Después de verificaciones:
- Si CAPTCHA + rate limiting activos → ✅ Proceder con validación de clerk_user_id
- Si CAPTCHA + rate limiting NO activos → ❌ Implementar primero

## Archivos Afectados
- [app/api/registro/route.ts](app/api/registro/route.ts)
- [lib/validations/registro.ts](lib/validations/registro.ts) 
- [middleware.ts](middleware.ts)
- [app/registro/page.tsx](app/registro/page.tsx)
- Database schema (constraints)
