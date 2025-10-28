-- ========================================
-- SOLUCIÓN COMPLETA: Arreglar ID y crear perfil
-- ========================================
-- Ejecuta este script COMPLETO en Neon Console
-- https://console.neon.tech → Tu proyecto → SQL Editor

-- ========================================
-- PASO 1: Arreglar columna ID (CRÍTICO)
-- ========================================
-- Problema: La columna "id" no es auto-increment, por eso falla con "null value"

-- 1.1: Crear secuencia
DROP SEQUENCE IF EXISTS investigadores_id_seq CASCADE;
CREATE SEQUENCE investigadores_id_seq;

-- 1.2: Establecer valor inicial (basado en máximo ID existente)
SELECT setval('investigadores_id_seq', 
  COALESCE((SELECT MAX(id) FROM investigadores WHERE id IS NOT NULL), 0) + 1, 
  false
);

-- 1.3: Configurar la columna para usar la secuencia
ALTER TABLE investigadores 
ALTER COLUMN id SET DEFAULT nextval('investigadores_id_seq');

-- 1.4: Asociar secuencia con la columna
ALTER SEQUENCE investigadores_id_seq OWNED BY investigadores.id;

-- 1.5: VERIFICAR que se aplicó correctamente
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'investigadores' AND column_name = 'id';

-- ✅ DEBERÍAS VER:
-- column_default: nextval('investigadores_id_seq'::regclass)
-- is_nullable: NO

-- ========================================
-- PASO 2: Limpiar registros incompletos (si existen)
-- ========================================
-- Eliminar registros sin clerk_user_id o sin correo válido
DELETE FROM investigadores 
WHERE correo = 'jgeraojeda@gmail.com' 
  AND (clerk_user_id IS NULL OR clerk_user_id = '');

-- ========================================
-- PASO 3: Insertar tu perfil completo
-- ========================================
INSERT INTO investigadores (
  -- Campos básicos
  nombre_completo,
  nombres,
  apellidos,
  correo,
  telefono,
  
  -- Clerk integration
  clerk_user_id,
  
  -- Identificación
  curp,
  rfc,
  no_cvu,
  
  -- Datos personales
  genero,
  nacionalidad,
  fecha_nacimiento,
  municipio,
  
  -- Datos académicos/profesionales
  tipo_perfil,
  nivel_investigador,
  ultimo_grado_estudios,
  empleo_actual,
  linea_investigacion,
  area_investigacion,
  
  -- Metadata
  activo,
  es_admin,
  origen,
  fecha_registro
) VALUES (
  -- Campos básicos
  'Jesus Gerardo Ojeda Martinez',
  'Jesus Gerardo',
  'Ojeda Martinez',
  'jgeraojeda@gmail.com',
  '614-473-6621',
  
  -- ⚠️ IMPORTANTE: Este es tu clerk_user_id real (de la línea 971 de tu terminal)
  'user_34hv0p7mFSnfrwk74TpUmVz58q6',
  
  -- Identificación
  'OEMJ05053108H500',
  'OEMJ050531K47',
  '123456',
  
  -- Datos personales
  'Masculino',
  'Mexicana',
  '2005-05-31',
  'Chihuahua',
  
  -- Datos académicos/profesionales
  'INVESTIGADOR',
  'Candidato a investigador estatal',
  'Preparatoria ESFER Salesianos Kennedy',
  'practicante de IIC',
  'tecnologia',
  'aaaaaaaaaaaaaa',
  
  -- Metadata
  TRUE,
  FALSE,
  'manual-fix',
  NOW()
) 
ON CONFLICT (correo) DO UPDATE SET
  clerk_user_id = EXCLUDED.clerk_user_id,
  nombre_completo = EXCLUDED.nombre_completo,
  nombres = EXCLUDED.nombres,
  apellidos = EXCLUDED.apellidos,
  genero = EXCLUDED.genero,
  municipio = EXCLUDED.municipio,
  tipo_perfil = EXCLUDED.tipo_perfil,
  nivel_investigador = EXCLUDED.nivel_investigador,
  activo = TRUE
RETURNING id, nombre_completo, correo, clerk_user_id;

-- ========================================
-- PASO 4: Verificar que se guardó correctamente
-- ========================================
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
WHERE correo = 'jgeraojeda@gmail.com';

-- ✅ DEBERÍAS VER TUS DATOS CON:
-- - id: (un número, no null)
-- - clerk_user_id: user_34hv0p7mFSnfrwk74TpUmVz58q6
-- - nombre_completo: Jesus Gerardo Ojeda Martinez
-- - activo: true

-- ========================================
-- PASO 5: Verificar que el auto-increment funciona
-- ========================================
-- Esto debería funcionar sin problemas ahora
-- (NO ejecutes esto, solo es para verificar que el ID se genera automáticamente)
-- 
-- INSERT INTO investigadores (nombre_completo, correo, activo)
-- VALUES ('Test Usuario', 'test@example.com', TRUE)
-- RETURNING id;

-- ========================================
-- RESUMEN
-- ========================================
-- ✅ Columna ID ahora es auto-increment
-- ✅ Tu perfil está creado con clerk_user_id correcto
-- ✅ Todos los campos necesarios están llenos
-- 
-- PRÓXIMO PASO:
-- 1. Ve a: http://localhost:3000/dashboard
-- 2. Recarga la página (F5)
-- 3. Tus datos deberían aparecer correctamente

