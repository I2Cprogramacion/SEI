-- ========================================
-- VERIFICAR USUARIO ESPECÍFICO EN NEON
-- ========================================
-- Ejecuta esto en Neon Console (https://console.neon.tech)

-- 1️⃣ Buscar por email específico
SELECT 
  id,
  nombre_completo,
  nombres,
  apellidos,
  correo,
  clerk_user_id,
  genero,
  municipio,
  tipo_perfil,
  nivel_investigador,
  nivel_tecnologo,
  fecha_registro,
  activo
FROM investigadores 
WHERE correo ILIKE '%jgeraojeda%' 
   OR correo ILIKE '%jgera%'
   OR nombre_completo ILIKE '%jgera%';

-- 2️⃣ Ver los últimos 10 registros (para contexto)
SELECT 
  id,
  nombre_completo,
  correo,
  clerk_user_id,
  fecha_registro
FROM investigadores
ORDER BY fecha_registro DESC
LIMIT 10;

-- 3️⃣ Contar cuántos registros hay en total
SELECT 
  COUNT(*) as total_investigadores,
  COUNT(clerk_user_id) as con_clerk_id,
  COUNT(*) - COUNT(clerk_user_id) as sin_clerk_id
FROM investigadores;

-- 4️⃣ Ver registros SIN clerk_user_id
SELECT 
  id,
  nombre_completo,
  correo,
  fecha_registro
FROM investigadores
WHERE clerk_user_id IS NULL
ORDER BY fecha_registro DESC;

-- ========================================
-- SOLUCIONES RÁPIDAS (SI ES NECESARIO)
-- ========================================

-- SOLUCIÓN A: Actualizar clerk_user_id para un usuario existente
-- (Reemplaza 'TU_CLERK_USER_ID' con el ID real de Clerk)
-- UPDATE investigadores 
-- SET clerk_user_id = 'TU_CLERK_USER_ID'
-- WHERE correo = 'jgeraojeda@gmail.com';

-- SOLUCIÓN B: Ver qué clerk_user_ids ya existen
-- SELECT DISTINCT clerk_user_id 
-- FROM investigadores 
-- WHERE clerk_user_id IS NOT NULL;

