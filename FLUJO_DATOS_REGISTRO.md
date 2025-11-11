# 📊 FLUJO COMPLETO DE DATOS - REGISTRO A DASHBOARD

## 🔄 FLUJO NORMAL (Cómo DEBERÍA funcionar)

```
┌─────────────────────────────────────────────────────────────────┐
│ PASO 1: REGISTRO (/registro)                                    │
├─────────────────────────────────────────────────────────────────┤
│ Usuario llena formulario:                                        │
│ • Nombres, apellidos, correo, password                           │
│ • Género, municipio, nivel_investigador/tecnologo               │
│ • Líneas de investigación, áreas, etc.                          │
│                                                                   │
│ Al hacer submit:                                                 │
│ 1a) Crea usuario en CLERK:                                       │
│     signUp.create({ email, password })                           │
│     ↓                                                             │
│     Obtiene: clerk_user_id (ej: "user_2abc123...")              │
│                                                                   │
│ 1b) Envía TODO a /api/registro:                                  │
│     POST /api/registro                                           │
│     Body: {                                                       │
│       correo: "usuario@ejemplo.com",                             │
│       clerk_user_id: "user_2abc123...",  ← CLAVE                │
│       nombres: "Juan",                                           │
│       apellidos: "Pérez",                                        │
│       genero: "Masculino",                                       │
│       municipio: "Chihuahua",                                    │
│       ... (todos los campos)                                     │
│     }                                                             │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 2: API REGISTRO (/api/registro/route.ts)                   │
├─────────────────────────────────────────────────────────────────┤
│ 2a) Recibe los datos                                             │
│ 2b) Normaliza según camposTabla (línea 70-77):                  │
│     - nombre_completo, nombres, apellidos, correo                │
│     - clerk_user_id ← IMPORTANTE                                 │
│     - genero, tipo_perfil, nivel_investigador, municipio         │
│     - linea_investigacion, area_investigacion                    │
│     - etc.                                                        │
│                                                                   │
│ 2c) Llama a guardarInvestigador(datosRegistro)                  │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 3: POSTGRESQL DATABASE (postgresql-database.ts)            │
├─────────────────────────────────────────────────────────────────┤
│ 3a) Verifica duplicados (CURP)                                   │
│ 3b) Construye INSERT dinámico:                                   │
│     INSERT INTO investigadores                                   │
│     (nombre_completo, correo, clerk_user_id, genero, ...)       │
│     VALUES ($1, $2, $3, $4, ...)                                 │
│                                                                   │
│ 3c) Retorna:                                                      │
│     { success: true, id: 123, clerk_user_id: "user_2abc..." }   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 4: LOGIN (Clerk maneja esto automáticamente)               │
├─────────────────────────────────────────────────────────────────┤
│ Usuario va a /iniciar-sesion                                     │
│ Ingresa correo + password                                        │
│ Clerk lo autentica → Crea sesión                                 │
│ Redirect a /dashboard                                            │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 5: DASHBOARD (/dashboard/page.tsx)                         │
├─────────────────────────────────────────────────────────────────┤
│ 5a) useUser() obtiene usuario de Clerk:                          │
│     user.id = "user_2abc123..."  ← clerk_user_id                │
│     user.emailAddresses[0] = "usuario@ejemplo.com"              │
│                                                                   │
│ 5b) Llama a API:                                                  │
│     GET /api/investigadores/perfil                               │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 6: API PERFIL (/api/investigadores/perfil/route.ts)        │
├─────────────────────────────────────────────────────────────────┤
│ 6a) Obtiene usuario de Clerk:                                    │
│     const user = await currentUser()                             │
│     clerk_user_id = user.id                                      │
│     email = user.emailAddresses[0].emailAddress                  │
│                                                                   │
│ 6b) Busca en BD (línea 29-68):                                   │
│     SELECT * FROM investigadores                                 │
│     WHERE clerk_user_id = $1 OR correo = $2                      │
│                                                                   │
│     ↓ SI ENCUENTRA: Retorna todos los datos                      │
│     ↓ SI NO ENCUENTRA: Error 404 "Perfil no encontrado"         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔴 PROBLEMA ACTUAL

**Usuario:** `jgeraojeda@gmail.com`  
**Síntoma:** Dashboard muestra "Perfil incompleto"

### Causas Posibles:

#### 1️⃣ **Datos NO se guardaron en registro**
   - El registro falló silenciosamente
   - La API retornó error pero no se mostró
   - El `clerk_user_id` no se envió

#### 2️⃣ **Datos están con otro email**
   - Clerk tiene `jgeraojeda@gmail.com`
   - PostgreSQL tiene `otro@email.com`
   - No hay coincidencia

#### 3️⃣ **El clerk_user_id no coincide**
   - Registro: `clerk_user_id = "user_ABC123"`
   - Login: `clerk_user_id = "user_XYZ789"`
   - No hay coincidencia

---

## 🔍 VERIFICACIÓN

Ejecuta este query en Neon Console para ver qué hay:

```sql
-- Ver TODOS los registros
SELECT 
  id,
  nombre_completo,
  correo,
  clerk_user_id,
  genero,
  municipio,
  nivel_investigador,
  fecha_registro
FROM investigadores
ORDER BY fecha_registro DESC
LIMIT 10;

-- Buscar específicamente este usuario
SELECT * FROM investigadores 
WHERE correo ILIKE '%jgeraojeda%' 
   OR correo ILIKE '%jgera%'
   OR nombre_completo ILIKE '%jgera%';
```

---

## 📊 QUÉ DEBERÍAS VER

### ✅ SI EL REGISTRO FUNCIONÓ:
```
id | nombre_completo | correo             | clerk_user_id   | genero    | municipio
---+----------------+--------------------+-----------------+-----------+----------
123| Juan Pérez     | jgeraojeda@gmail.com| user_2abc123...| Masculino | Chihuahua
```

### ❌ SI NO HAY DATOS:
```
(No rows)
```
Significa que el registro NO se completó.

### ⚠️ SI HAY DATOS PERO SIN clerk_user_id:
```
id | nombre_completo | correo             | clerk_user_id | genero
---+----------------+--------------------+---------------+-------
123| Juan Pérez     | jgeraojeda@gmail.com| NULL         | Masculino
```
Significa que el registro se hizo ANTES de integrar Clerk correctamente.

---

## 🛠️ SOLUCIONES

### Solución A: Si NO hay datos (registro falló)
**NECESITAS REGISTRARTE DE NUEVO:**
1. Ve a: https://sei-chih.com.mx/registro
2. Llena el formulario COMPLETO
3. Asegúrate de usar: `jgeraojeda@gmail.com`
4. Usa una contraseña diferente (o la misma)
5. Completa el registro

### Solución B: Si hay datos pero SIN clerk_user_id
**NECESITO ACTUALIZAR EL clerk_user_id:**

Primero, obtén tu `clerk_user_id` actual:
```javascript
// En la consola del navegador en el dashboard:
window.__clerk?.user?.id
```

Luego actualiza en Neon Console:
```sql
UPDATE investigadores 
SET clerk_user_id = 'TU_CLERK_USER_ID_AQUI'
WHERE correo = 'jgeraojeda@gmail.com';
```

### Solución C: Si hay datos con email diferente
**NECESITO ACTUALIZAR EL EMAIL:**
```sql
UPDATE investigadores 
SET correo = 'jgeraojeda@gmail.com'
WHERE id = TU_ID_AQUI;
```

---

## ✅ PRÓXIMOS PASOS

**1. Ejecuta el query de verificación en Neon**  
**2. Comparte el resultado aquí**  
**3. Te diré exactamente qué hacer**

Una vez que sepamos QUÉ datos hay (o no hay), podemos arreglarlo en 2 minutos.

