-- ========================================
-- ACTUALIZAR clerk_user_id PARA USUARIO ACTUAL
-- ========================================

-- Actualizar TU registro con el clerk_user_id correcto
UPDATE investigadores 
SET clerk_user_id = 'user_34hv0p7mFSnfrwk74TpUmVz58q6'
WHERE correo = 'jgeraojeda@gmail.com' 
  AND id = 105
RETURNING id, nombre_completo, correo, clerk_user_id;

-- Verificar que se actualizó correctamente
SELECT 
  id,
  nombre_completo,
  correo,
  clerk_user_id,
  genero,
  municipio,
  tipo_perfil
FROM investigadores
WHERE correo = 'jgeraojeda@gmail.com';

