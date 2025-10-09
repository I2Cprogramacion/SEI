-- Agregar columnas faltantes a la tabla investigadores

-- Agregar area_investigacion si no existe
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS area_investigacion TEXT;

-- Agregar fotografia_url si no existe
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS fotografia_url TEXT;

-- Verificar las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'investigadores'
ORDER BY ordinal_position;
