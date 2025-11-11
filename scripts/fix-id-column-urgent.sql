-- ========================================
-- FIX URGENTE: Columna ID no es auto-increment
-- ========================================
-- El error "null value in column id" significa que la columna
-- NO está configurada como SERIAL (auto-increment)

-- SOLUCIÓN: Recrear la secuencia y configurar el default

-- 1️⃣ Crear secuencia si no existe
CREATE SEQUENCE IF NOT EXISTS investigadores_id_seq;

-- 2️⃣ Establecer el valor actual de la secuencia
-- (basado en el máximo ID existente + 1)
SELECT setval('investigadores_id_seq', 
  COALESCE((SELECT MAX(id) FROM investigadores), 0) + 1, 
  false
);

-- 3️⃣ Alterar la columna para usar la secuencia
ALTER TABLE investigadores 
ALTER COLUMN id SET DEFAULT nextval('investigadores_id_seq');

-- 4️⃣ Asociar la secuencia con la columna
ALTER SEQUENCE investigadores_id_seq OWNED BY investigadores.id;

-- 5️⃣ Verificar que funciona
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'investigadores' AND column_name = 'id';

-- ✅ Deberías ver:
-- column_name | data_type | column_default                      | is_nullable
-- ------------+-----------+-------------------------------------+------------
-- id          | integer   | nextval('investigadores_id_seq'::...) | NO

