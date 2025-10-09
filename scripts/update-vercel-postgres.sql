-- Script para actualizar la base de datos de Vercel Postgres
-- Agregar nuevas columnas a la tabla investigadores

-- Agregar columnas si no existen
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS ultimo_grado_estudios TEXT,
ADD COLUMN IF NOT EXISTS area_investigacion TEXT,
ADD COLUMN IF NOT EXISTS fotografia_url TEXT,
ADD COLUMN IF NOT EXISTS empleo_actual TEXT,
ADD COLUMN IF NOT EXISTS linea_investigacion TEXT,
ADD COLUMN IF NOT EXISTS nacionalidad TEXT,
ADD COLUMN IF NOT EXISTS fecha_nacimiento TEXT,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS fecha_registro TEXT,
ADD COLUMN IF NOT EXISTS origen TEXT,
ADD COLUMN IF NOT EXISTS archivo_procesado TEXT;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
ORDER BY ordinal_position;
