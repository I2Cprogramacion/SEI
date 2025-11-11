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

<!-- test-registro.md — ARCHIVED -->

Este documento de pruebas fue archivado y su contenido eliminado por limpieza automática.
Si necesitas el procedimiento de test original, restaura desde control de versiones.


