-- ================================================
-- SCRIPT: Sincronizar usuarios de Clerk con PostgreSQL
-- Propósito: Crear registros faltantes para usuarios que existen en Clerk
-- ================================================

-- Este script debe ejecutarse DESPUÉS de fix-all-missing-columns.sql

-- PASO 1: Verificar estado actual
SELECT 
    '🔍 ESTADO ACTUAL DE LA BASE DE DATOS' as titulo;

SELECT 
    COUNT(*) as total_investigadores,
    COUNT(clerk_user_id) as con_clerk_id,
    COUNT(CASE WHEN clerk_user_id IS NULL THEN 1 END) as sin_clerk_id
FROM investigadores;

-- PASO 2: Buscar el usuario específico
-- Reemplaza 'drksh2015@gmail.com' con el email del usuario
SELECT 
    '🔍 BUSCANDO USUARIO: drksh2015@gmail.com' as titulo;

SELECT 
    id,
    nombre_completo,
    nombres,
    apellidos,
    correo,
    clerk_user_id,
    es_admin,
    fecha_registro
FROM investigadores 
WHERE correo = 'drksh2015@gmail.com';

-- ================================================
-- OPCIÓN A: Si el usuario NO EXISTE en PostgreSQL
-- ================================================
-- Descomenta y modifica este INSERT si el usuario no existe

/*
INSERT INTO investigadores (
    nombres,
    apellidos,
    nombre_completo,
    correo,
    clerk_user_id,
    telefono,
    nacionalidad,
    fecha_registro,
    ultima_actividad,
    es_admin
) VALUES (
    'TU_NOMBRE',           -- Reemplaza con el nombre del usuario
    'TU_APELLIDO',         -- Reemplaza con el apellido
    'NOMBRE COMPLETO',     -- Nombre completo
    'drksh2015@gmail.com', -- Email del usuario
    'CLERK_USER_ID_AQUI',  -- Obtén esto del Clerk Dashboard
    NULL,                  -- Teléfono (opcional)
    'México',              -- Nacionalidad
    NOW(),                 -- Fecha de registro
    NOW(),                 -- Última actividad
    FALSE                  -- ¿Es admin? true/false
) RETURNING id, nombre_completo, correo, clerk_user_id;
*/

-- ================================================
-- OPCIÓN B: Si el usuario EXISTE pero falta clerk_user_id
-- ================================================
-- Descomenta y modifica este UPDATE si el usuario existe

/*
UPDATE investigadores 
SET 
    clerk_user_id = 'CLERK_USER_ID_AQUI',  -- Obtén esto del Clerk Dashboard
    ultima_actividad = NOW(),
    es_admin = FALSE
WHERE correo = 'drksh2015@gmail.com'
RETURNING id, nombre_completo, correo, clerk_user_id;
*/

-- ================================================
-- CÓMO OBTENER EL CLERK_USER_ID:
-- ================================================
-- 1. Ve a https://dashboard.clerk.com
-- 2. Selecciona tu aplicación SEI
-- 3. Ve a "Users" en el menú lateral
-- 4. Busca el usuario por email: drksh2015@gmail.com
-- 5. Click en el usuario
-- 6. Copia el "User ID" (empieza con "user_")
-- ================================================

-- VERIFICACIÓN FINAL
SELECT 
    '✅ VERIFICACIÓN DESPUÉS DE LA SINCRONIZACIÓN' as titulo;

SELECT 
    id,
    nombre_completo,
    nombres,
    apellidos,
    correo,
    clerk_user_id,
    es_admin,
    fecha_registro,
    ultima_actividad
FROM investigadores 
WHERE correo = 'drksh2015@gmail.com';
