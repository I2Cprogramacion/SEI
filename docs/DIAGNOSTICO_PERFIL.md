# 🔍 Diagnóstico: Perfil no muestra datos

## Problemas detectados:
1. **Los datos no se ven en el dashboard** - Muestra "Usuario" genérico
2. **Los datos no se están guardando en Neon**

## ✅ Cambios realizados:

### 1. **Endpoint de perfil mejorado** (`/api/investigadores/perfil`)
- ✅ Agregados todos los campos faltantes:
  - `linea_investigacion`
  - `ultimo_grado_estudios`
  - `genero`
  - `municipio`
  - `tipo_perfil`
  - `nivel_investigador`
  - `nivel_tecnologo`
- ✅ Logs detallados para debugging

### 2. **Debugging de guardado**
- ✅ Logs completos en `guardarInvestigador()`
- ✅ Mostrar datos recibidos, campos insertados y resultado

## 🛠️ Pasos para diagnosticar:

### **PASO 1: Verificar estructura de la tabla en Neon**

Ve a tu consola de Neon y ejecuta:

```sql
-- Ver columnas de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'investigadores'
ORDER BY ordinal_position;
```

O usa el script completo:
```bash
cat scripts/verificar-estructura-tabla.sql
```

**¿Qué debes ver?**
- ✅ Columna `clerk_user_id`
- ✅ Columna `genero`
- ✅ Columna `tipo_perfil`
- ✅ Columna `nivel_investigador`
- ✅ Columna `nivel_tecnologo`
- ✅ Columna `municipio`
- ✅ Columna `linea_investigacion`
- ✅ Columna `ultimo_grado_estudios`

### **PASO 2: Si faltan columnas, agregarlas**

Ejecuta en Neon:
```bash
cat scripts/agregar-columnas-faltantes.sql
```

Este script agrega todas las columnas necesarias de forma segura (usa `IF NOT EXISTS`).

### **PASO 3: Registrar un nuevo usuario de prueba**

1. Ve a `http://localhost:3000/registro`
2. Llena el formulario completo
3. **Observa la consola del servidor** (donde corre `npm run dev`)
4. Busca estos logs:

```
💾 ========== GUARDANDO INVESTIGADOR ==========
Datos recibidos: { ... }
📋 Campos a insertar: [...]
✅ REGISTRO EXITOSO:
   - ID: 123
   - Nombre: Juan Pérez
   - Correo: juan@ejemplo.com
   - Clerk User ID: user_abc123
===============================================
```

### **PASO 4: Verificar que se guardó en Neon**

```sql
SELECT 
    id,
    nombre_completo,
    correo,
    clerk_user_id,
    genero,
    municipio,
    tipo_perfil
FROM investigadores 
ORDER BY fecha_registro DESC 
LIMIT 1;
```

### **PASO 5: Verificar que el perfil carga**

1. Inicia sesión con el usuario recién creado
2. Ve al dashboard: `http://localhost:3000/dashboard`
3. **Observa la consola del servidor**, busca:

```
🔍 Buscando perfil para clerk_user_id: user_abc123 o correo: juan@ejemplo.com
📊 Resultados encontrados: 1
✅ Perfil encontrado: { id: 123, nombre_completo: 'Juan Pérez', ... }
✅ Retornando perfil exitosamente
```

## 🚨 Posibles problemas y soluciones:

### Problema 1: "No se encontró perfil"
**Causa**: El `clerk_user_id` no coincide
**Solución**:
```sql
-- Ver qué clerk_user_id tiene el registro
SELECT id, nombre_completo, correo, clerk_user_id 
FROM investigadores 
WHERE correo = 'tu_correo@ejemplo.com';

-- Si está vacío o NULL, necesitas actualizar la tabla
```

### Problema 2: Columnas faltantes
**Causa**: La tabla no tiene todas las columnas
**Solución**: Ejecutar `scripts/agregar-columnas-faltantes.sql`

### Problema 3: Error al insertar
**Causa**: Tipo de dato incorrecto o columna no existe
**Solución**: Ver los logs del servidor, te dirá exactamente qué columna falta

### Problema 4: Dashboard muestra "Usuario" genérico
**Causa**: El campo `nombre_completo` está vacío o NULL
**Solución**:
```sql
-- Verificar datos
SELECT id, nombre_completo, nombres, apellidos, correo
FROM investigadores 
WHERE correo = 'tu_correo@ejemplo.com';

-- Si nombre_completo está vacío:
UPDATE investigadores 
SET nombre_completo = CONCAT(nombres, ' ', apellidos)
WHERE nombre_completo IS NULL OR nombre_completo = '';
```

## 📊 Comandos útiles de debugging:

### Ver todos los investigadores:
```sql
SELECT id, nombre_completo, correo, clerk_user_id, fecha_registro
FROM investigadores
ORDER BY fecha_registro DESC;
```

### Ver un investigador específico:
```sql
SELECT * FROM investigadores WHERE correo = 'tu_correo@ejemplo.com';
```

### Ver estadísticas de la tabla:
```sql
SELECT 
    COUNT(*) as total,
    COUNT(clerk_user_id) as con_clerk_id,
    COUNT(nombre_completo) as con_nombre,
    COUNT(genero) as con_genero,
    COUNT(tipo_perfil) as con_tipo_perfil
FROM investigadores;
```

## 🔄 Si nada funciona: Reset completo

Si después de todo sigues teniendo problemas, puedes resetear la tabla:

```sql
-- CUIDADO: Esto borra todos los datos
DROP TABLE IF EXISTS investigadores CASCADE;

-- Luego ejecuta el script de reset completo:
-- scripts/RESET_NEON_COMPLETE.sql
```

## 📝 Checklist de verificación:

- [ ] La tabla `investigadores` existe en Neon
- [ ] La tabla tiene todas las columnas necesarias
- [ ] El registro muestra logs de éxito en la consola
- [ ] El registro se ve en Neon con `SELECT *`
- [ ] El `clerk_user_id` no es NULL
- [ ] El perfil muestra logs al cargar
- [ ] El dashboard carga sin errores 404

## 💡 Próximos pasos:

1. Ejecuta el script de verificación
2. Comparte los resultados en la consola
3. Si hay errores, muestra los logs del servidor

