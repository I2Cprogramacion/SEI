# 🔴 Entender el Error "Datos de Registro Inválidos"

## ¿Qué significa?

El error **"Datos de registro inválidos"** significa que **faltan campos obligatorios en el formulario**.

Específicamente, estos campos **NO pueden estar vacíos**:

| Campo | Qué es | Formato | Ejemplo |
|-------|--------|---------|---------|
| **CURP** | Clave Única de Registro de Población (México) | 18 caracteres (mayúsculas) | ABCD123456HDFNZL01 |
| **RFC** | Registro Federal de Contribuyentes | 10-13 caracteres | ABC123456XYZ |
| **CVU/No. de investigador** | Número de investigador en SNII (opcional según caso) | Números | 123456 |

## ¿Por qué me sale este error?

### Causa 1: El OCR no extrajo estos campos
El OCR que procesa tu CV intenta sacar estos números, **pero no siempre lo logra**. 

**Solución:** Llena estos campos **manualmente** en el formulario.

### Causa 2: Los dejas vacíos sin darte cuenta
Si das clic en "Registrarse" sin completar CURP/RFC/CVU, recibirás este error.

**Solución:** Verifica que los tres campos tengan datos antes de dar clic en "Registrarse".

## Paso a paso para resolver

1. **Ubica el formulario de registro**
   - Sección: "Datos del investigador"
   - Busca los campos: CURP, RFC, CVU/No. de investigador

2. **Completa los datos manualmente**
   - CURP: Encuentra en tu identificación oficial mexicana (18 caracteres)
   - RFC: Solicita a SAT o busca en tu comprobante de domicilio (10-13 caracteres)
   - CVU: Si eres investigador SNII, ingresa tu número. Si no, déjalo vacío (verifica si realmente es obligatorio)

3. **Verifica el color del alerta naranja**
   - Si ves un alerta naranja diciendo "CAMPOS OBLIGATORIOS VACÍOS", completa esos campos
   - Se actualizará automáticamente cuando ingreses los datos

4. **Intenta registrarte de nuevo**
   - Haz clic en "Registrarse"
   - Si ves el error nuevamente, verifica los campos nuevamente

## ¿Qué datos son extraídos por el OCR?

El OCR del CV puede extraer automáticamente:

✅ **SÍ extrae (normalmente):**
- Nombre
- Email
- Teléfono
- Institución
- Área de especialización

❌ **NO extrae (fallan frecuentemente):**
- CURP
- RFC
- CVU/Número de investigador

> **Nota:** El OCR es "complementario, no completo". Es decir, ayuda pero no garantiza extraer todo.

## ¿Y si aún así me sale el error?

Si completaste todos los campos y aún ves el error, puede ser:

1. **Error temporal del servidor**
   - Intenta nuevamente en 5-10 minutos
   - Recarga la página (Ctrl+F5)

2. **Problema de conexión con la base de datos**
   - Verifica tu conexión a internet
   - Intenta desde otro navegador o dispositivo

3. **Formato incorrecto**
   - CURP: Debe ser exactamente 18 caracteres
   - RFC: Debe ser 10-13 caracteres
   - Verifica que no tengas espacios al inicio o final

## Contacto si el problema persiste

Si después de seguir estos pasos aún tienes problemas, contacta al equipo de soporte con:
- Screenshot del error
- Los datos que intentaste ingresar (sin información sensible)
- Navegador y sistema operativo

---

**Versión:** 1.0  
**Fecha:** 17 de marzo, 2026  
**Estado:** Activo
