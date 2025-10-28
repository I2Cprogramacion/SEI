-- ========================================
-- COMPLETAR PERFIL DE USUARIO EXISTENTE EN CLERK
-- ========================================
-- Este script crea el registro en PostgreSQL para un usuario
-- que YA EXISTE en Clerk pero NO tiene datos en la BD

-- ⚠️ IMPORTANTE: 
-- Necesitas obtener tu clerk_user_id primero:
-- 1. Ve a: https://sei-chih.com.mx/dashboard
-- 2. Abre la consola del navegador (F12)
-- 3. Ejecuta: console.log(window.__clerk?.user?.id)
-- 4. Copia el resultado (ejemplo: "user_2abc123...")

-- EJEMPLO DE INSERT (REEMPLAZA CON TUS DATOS REALES):
INSERT INTO investigadores (
  nombre_completo,
  nombres,
  apellidos,
  correo,
  clerk_user_id,
  genero,
  municipio,
  tipo_perfil,
  nivel_investigador,
  activo,
  es_admin,
  fecha_registro
) VALUES (
  'Tu Nombre Completo',           -- Reemplaza con tu nombre
  'Tu Nombre',                     -- Reemplaza
  'Tus Apellidos',                 -- Reemplaza
  'jgeraojeda@gmail.com',          -- Tu email (el que usaste en Clerk)
  'TU_CLERK_USER_ID_AQUI',         -- ← IMPORTANTE: Obtén esto de la consola
  'Masculino',                     -- O 'Femenino' o 'Prefiero no decirlo'
  'Chihuahua',                     -- Tu municipio
  'INVESTIGADOR',                  -- O 'TECNOLOGO'
  'Investigador estatal nivel I',  -- Tu nivel (si aplica)
  TRUE,                            -- activo
  FALSE,                           -- es_admin
  NOW()                            -- fecha_registro
) RETURNING *;

-- ========================================
-- ALTERNATIVA: UPDATE si ya existe registro sin clerk_user_id
-- ========================================
-- Si ya tienes un registro pero sin clerk_user_id, usa esto:

-- UPDATE investigadores 
-- SET 
--   clerk_user_id = 'TU_CLERK_USER_ID_AQUI',
--   correo = 'jgeraojeda@gmail.com',
--   activo = TRUE
-- WHERE id = TU_ID_AQUI
-- RETURNING *;

