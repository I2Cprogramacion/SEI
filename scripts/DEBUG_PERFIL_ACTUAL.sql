-- ========================================
-- DEBUG: Verificar perfil actual en BD
-- ========================================

-- 1️⃣ Ver TU perfil actual
SELECT 
  id,
  nombre_completo,
  correo,
  clerk_user_id,
  genero,
  municipio,
  tipo_perfil,
  nivel_investigador,
  activo,
  fecha_registro
FROM investigadores
WHERE correo = 'jgeraojeda@gmail.com'
ORDER BY fecha_registro DESC;

-- 2️⃣ Ver TODOS los registros recientes
SELECT 
  id,
  nombre_completo,
  correo,
  clerk_user_id,
  fecha_registro
FROM investigadores
ORDER BY fecha_registro DESC
LIMIT 5;

-- 3️⃣ Ver registros SIN clerk_user_id
SELECT 
  id,
  nombre_completo,
  correo,
  clerk_user_id
FROM investigadores
WHERE clerk_user_id IS NULL OR clerk_user_id = ''
ORDER BY fecha_registro DESC;

