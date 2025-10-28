# 🧪 TEST DE REGISTRO COMPLETO

## Objetivo
Verificar que TODOS los datos del formulario de registro se guarden correctamente en Neon.

---

## 📋 PREPARACIÓN

### 1. Ejecutar script de reparación en Neon
```sql
-- Copia y pega todo el contenido de:
scripts/verificar-y-reparar-neon.sql
```

### 2. Limpiar caché de Clerk
En la consola del navegador (F12):
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🧪 PROCEDIMIENTO DE TEST

### PASO 1: Iniciar servidor local
```bash
npm run dev
```

### PASO 2: Abrir consola del servidor
Mantén visible la terminal donde corre `npm run dev` para ver los logs.

### PASO 3: Preparar datos de prueba
Usa estos datos para el registro:

| Campo | Valor de Prueba |
|-------|----------------|
| **Nombres** | Juan Alberto |
| **Apellidos** | Pérez López |
| **Correo** | juan.test@gmail.com |
| **Teléfono** | 6141234567 |
| **CURP** | PELJ900101HCHRZN01 |
| **RFC** | PELJ900101ABC |
| **CVU** | 123456 |
| **Grado de Estudios** | Doctorado en Ciencias |
| **Empleo Actual** | Investigador CIMAV |
| **Línea Investigación** | Nanotecnología, Materiales Avanzados |
| **Área Investigación** | Ciencias Exactas |
| **Nacionalidad** | Mexicana |
| **Fecha Nacimiento** | 01/01/1990 |
| **Género** | Masculino |
| **Tipo de Perfil** | Investigador |
| **Nivel Investigador** | Investigador estatal nivel I |
| **Municipio** | Chihuahua |
| **Contraseña** | Test123456! |

### PASO 4: Registrar usuario
1. Ve a `http://localhost:3000/registro`
2. Llena TODOS los campos con los datos de arriba
3. Sube una foto de perfil (opcional pero recomendado)
4. Click en "Registrar"

### PASO 5: Verificar logs del servidor
Deberías ver en la consola:

```
💾 ========== GUARDANDO INVESTIGADOR ==========
Datos recibidos: {
  "nombre_completo": "Juan Alberto Pérez López",
  "nombres": "Juan Alberto",
  "apellidos": "Pérez López",
  "correo": "juan.test@gmail.com",
  "clerk_user_id": "user_xxx...",
  "linea_investigacion": "Nanotecnología, Materiales Avanzados",  ← VERIFICAR ESTE
  "area_investigacion": "Ciencias Exactas",
  "curp": "PELJ900101HCHRZN01",
  "genero": "Masculino",
  "tipo_perfil": "INVESTIGADOR",
  "nivel_investigador": "Investigador estatal nivel I",
  "municipio": "Chihuahua",
  ...
}
📋 Campos a insertar: [...todos los campos...]
✅ REGISTRO EXITOSO:
   - ID: 1
   - Nombre: Juan Alberto Pérez López
   - Correo: juan.test@gmail.com
   - Clerk User ID: user_xxx...
```

### PASO 6: Verificar en Neon
Ejecuta esta query en la consola de Neon:

```sql
SELECT 
    id,
    nombre_completo,
    nombres,
    apellidos,
    correo,
    clerk_user_id,
    curp,
    rfc,
    no_cvu,
    telefono,
    genero,
    municipio,
    tipo_perfil,
    nivel_investigador,
    nivel_tecnologo,
    linea_investigacion,  -- ← VERIFICAR ESTE
    area_investigacion,
    ultimo_grado_estudios,
    empleo_actual,
    nacionalidad,
    fecha_nacimiento,
    fotografia_url,
    fecha_registro,
    activo
FROM investigadores 
WHERE correo = 'juan.test@gmail.com';
```

### PASO 7: Verificar que el perfil carga
1. Inicia sesión: `http://localhost:3000/iniciar-sesion`
2. Usa: `juan.test@gmail.com` / `Test123456!`
3. Deberías ser redirigido al dashboard
4. Verifica que aparezca:
   - ✅ Tu nombre completo (no "Usuario")
   - ✅ Tu correo
   - ✅ Todos tus datos en "Editar Perfil"

---

## ✅ CHECKLIST DE VALIDACIÓN

Marca cada item después de verificar:

### Datos Guardados en Neon:
- [ ] `nombre_completo` = "Juan Alberto Pérez López"
- [ ] `nombres` = "Juan Alberto"
- [ ] `apellidos` = "Pérez López"
- [ ] `correo` = "juan.test@gmail.com"
- [ ] `clerk_user_id` = (tiene valor, no NULL)
- [ ] `curp` = "PELJ900101HCHRZN01"
- [ ] `genero` = "Masculino"
- [ ] `municipio` = "Chihuahua"
- [ ] `tipo_perfil` = "INVESTIGADOR"
- [ ] `nivel_investigador` = "Investigador estatal nivel I"
- [ ] `linea_investigacion` = "Nanotecnología, Materiales Avanzados"
- [ ] `area_investigacion` = "Ciencias Exactas"
- [ ] `ultimo_grado_estudios` = "Doctorado en Ciencias"
- [ ] `empleo_actual` = "Investigador CIMAV"

### Dashboard funciona:
- [ ] Muestra nombre completo (no "Usuario")
- [ ] Muestra correo correcto
- [ ] "Editar Perfil" carga todos los datos
- [ ] No hay errores en consola

---

## 🚨 SI ALGO FALLA

### Problema: Clerk muestra CURP en lugar de email
**Solución:** Limpia localStorage en navegador

### Problema: Campo específico no se guarda
**Solución:** 
1. Verifica que el campo esté en `camposTabla` (app/api/registro/route.ts línea 71)
2. Verifica que la columna existe en Neon
3. Verifica logs del servidor para ver si el campo llega

### Problema: Error al guardar
**Solución:** Revisa logs del servidor, te dirá exactamente qué falta

---

## 📊 RESULTADO ESPERADO

```
✅ TODOS los campos del formulario guardados en Neon
✅ clerk_user_id vinculado correctamente
✅ Dashboard carga perfil completo
✅ Ningún dato se pierde
```

