-- Script para agregar los campos genero, nivel_investigador y municipio
-- a la tabla investigadores

-- Agregar columna genero
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS genero VARCHAR(50);

-- Agregar columna nivel_investigador
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS nivel_investigador VARCHAR(100);

-- Agregar columna municipio
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS municipio VARCHAR(100);

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
  AND column_name IN ('genero', 'nivel_investigador', 'municipio');

