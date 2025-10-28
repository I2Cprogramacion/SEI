-- Script para agregar las columnas que faltan en la tabla investigadores
-- Ejecuta esto en Neon si ves que faltan columnas

-- Agregar columnas de información personal si no existen
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS nombres VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS apellidos VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS genero VARCHAR(50);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS municipio VARCHAR(100);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS estado_nacimiento VARCHAR(100);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS entidad_federativa VARCHAR(100);

-- Agregar columnas de tipo de perfil y nivel
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(20) DEFAULT 'INVESTIGADOR';
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS nivel_investigador VARCHAR(100);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS nivel_tecnologo VARCHAR(100);

-- Agregar columnas académicas y profesionales
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS ultimo_grado_estudios VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS empleo_actual VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS linea_investigacion TEXT;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS area_investigacion TEXT;

-- Agregar columnas de identificación
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS orcid VARCHAR(50);

-- Agregar columnas de archivos
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS fotografia_url TEXT;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Agregar columnas de metadatos
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS origen VARCHAR(50);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Agregar índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_investigadores_clerk_user_id ON investigadores(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_investigadores_correo ON investigadores(correo);
CREATE INDEX IF NOT EXISTS idx_investigadores_slug ON investigadores(slug);

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
ORDER BY ordinal_position;

