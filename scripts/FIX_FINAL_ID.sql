-- ========================================
-- FIX FINAL: ID AUTO-INCREMENT (SIN COALESCE)
-- ========================================

-- PASO 1: Eliminar secuencia vieja si existe
DROP SEQUENCE IF EXISTS investigadores_id_seq CASCADE;

-- PASO 2: Crear nueva secuencia
CREATE SEQUENCE investigadores_id_seq START WITH 100;

-- PASO 3: Configurar columna ID para usar la secuencia
ALTER TABLE investigadores 
ALTER COLUMN id SET DEFAULT nextval('investigadores_id_seq');

-- PASO 4: Asociar secuencia con la columna
ALTER SEQUENCE investigadores_id_seq OWNED BY investigadores.id;

-- PASO 5: Verificar configuración
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'investigadores' AND column_name = 'id';

-- Deberías ver: nextval('investigadores_id_seq'::regclass)

