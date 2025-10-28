-- ========================================
-- SOLUCIÓN SIMPLIFICADA: Arreglar ID e insertar perfil
-- ========================================

-- PASO 1: Crear secuencia
DROP SEQUENCE IF EXISTS investigadores_id_seq CASCADE;
CREATE SEQUENCE investigadores_id_seq START WITH 1;

-- PASO 2: Configurar columna para usar secuencia
ALTER TABLE investigadores 
ALTER COLUMN id SET DEFAULT nextval('investigadores_id_seq');

-- PASO 3: Asociar secuencia con columna
ALTER SEQUENCE investigadores_id_seq OWNED BY investigadores.id;

-- PASO 4: Ajustar el valor de la secuencia (si ya hay registros)
DO $$
DECLARE
    max_id INTEGER;
BEGIN
    SELECT MAX(id) INTO max_id FROM investigadores WHERE id IS NOT NULL;
    IF max_id IS NOT NULL THEN
        PERFORM setval('investigadores_id_seq', max_id + 1);
    END IF;
END $$;

-- PASO 5: Limpiar registros incompletos
DELETE FROM investigadores 
WHERE correo = 'jgeraojeda@gmail.com';

-- PASO 6: Insertar tu perfil
INSERT INTO investigadores (
  nombre_completo, nombres, apellidos, correo, telefono, clerk_user_id,
  curp, rfc, no_cvu, genero, nacionalidad, fecha_nacimiento, municipio,
  tipo_perfil, nivel_investigador, ultimo_grado_estudios, empleo_actual,
  linea_investigacion, area_investigacion, activo, es_admin, origen, fecha_registro
) VALUES (
  'Jesus Gerardo Ojeda Martinez',
  'Jesus Gerardo',
  'Ojeda Martinez',
  'jgeraojeda@gmail.com',
  '614-473-6621',
  'user_34hv0p7mFSnfrwk74TpUmVz58q6',
  'OEMJ05053108H500',
  'OEMJ050531K47',
  '123456',
  'Masculino',
  'Mexicana',
  '2005-05-31',
  'Chihuahua',
  'INVESTIGADOR',
  'Candidato a investigador estatal',
  'Preparatoria ESFER Salesianos Kennedy',
  'practicante de IIC',
  'tecnologia',
  'aaaaaaaaaaaaaa',
  TRUE,
  FALSE,
  'manual-fix',
  NOW()
) RETURNING id, nombre_completo, correo, clerk_user_id;

-- PASO 7: Verificar
SELECT 
  id,
  nombre_completo,
  correo,
  clerk_user_id,
  genero,
  municipio,
  tipo_perfil,
  nivel_investigador
FROM investigadores
WHERE correo = 'jgeraojeda@gmail.com';

