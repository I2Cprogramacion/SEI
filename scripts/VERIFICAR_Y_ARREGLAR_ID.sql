-- ========================================
-- VERIFICAR Y ARREGLAR ID AUTO-INCREMENT
-- ========================================

-- PASO 1: Verificar estado actual de la columna ID
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'investigadores' 
  AND column_name = 'id';

-- ✅ SI column_default es "nextval('investigadores_id_seq'::regclass)", está bien configurado
-- ❌ SI column_default es NULL, necesita arreglarse

-- PASO 2: Verificar si la secuencia existe
SELECT 
  sequence_name,
  last_value,
  increment_by
FROM information_schema.sequences
WHERE sequence_name = 'investigadores_id_seq';

-- PASO 3: ARREGLAR (si es necesario)
-- Ejecuta esto si column_default era NULL:

DROP SEQUENCE IF EXISTS investigadores_id_seq CASCADE;
CREATE SEQUENCE investigadores_id_seq;

-- Obtener el máximo ID actual y ajustar la secuencia
DO $$
DECLARE
    current_max INTEGER;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO current_max FROM investigadores;
    PERFORM setval('investigadores_id_seq', current_max + 1, false);
    RAISE NOTICE 'Secuencia configurada para iniciar en: %', current_max + 1;
END $$;

-- Configurar el DEFAULT en la columna
ALTER TABLE investigadores 
ALTER COLUMN id SET DEFAULT nextval('investigadores_id_seq'::regclass);

-- Asociar la secuencia con la columna
ALTER SEQUENCE investigadores_id_seq OWNED BY investigadores.id;

-- PASO 4: VERIFICAR QUE SE APLICÓ
SELECT 
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'investigadores' 
  AND column_name = 'id';

-- Deberías ver: column_default = "nextval('investigadores_id_seq'::regclass)"

-- PASO 5: PROBAR que funciona
-- (SOLO para prueba, NO insertes esto en producción)
/*
INSERT INTO investigadores (
  nombre_completo, correo, activo
) VALUES (
  'Usuario de Prueba', 'prueba@test.com', TRUE
) RETURNING id, nombre_completo, correo;

-- Si esto funciona y genera un ID automáticamente, ¡está arreglado!
-- Luego elimina el registro de prueba:
-- DELETE FROM investigadores WHERE correo = 'prueba@test.com';
*/

