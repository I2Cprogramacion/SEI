-- =====================================================
-- SCRIPT DE VERIFICACIÓN Y REPARACIÓN DE TABLA NEON
-- Sistema Estatal de Investigadores
-- =====================================================

-- PASO 1: Verificar que la tabla existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investigadores') THEN
        RAISE EXCEPTION 'La tabla investigadores no existe. Ejecuta primero RESET_NEON_COMPLETE.sql';
    END IF;
END $$;

-- PASO 2: Agregar columnas faltantes (si no existen)
-- Estas columnas son críticas para el funcionamiento del sistema

-- Columnas de identificación
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Columnas personales
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS nombres VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS apellidos VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS genero VARCHAR(50);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS municipio VARCHAR(100);

-- Columnas de perfil
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(20) DEFAULT 'INVESTIGADOR';
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS nivel_investigador VARCHAR(100);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS nivel_tecnologo VARCHAR(100);

-- Columnas académicas
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS linea_investigacion TEXT;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS area_investigacion TEXT;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS ultimo_grado_estudios VARCHAR(255);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS empleo_actual VARCHAR(255);

-- Columnas de archivos
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS fotografia_url TEXT;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Columnas de metadatos
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS origen VARCHAR(50);
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT FALSE;

-- PASO 3: Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_investigadores_clerk_user_id ON investigadores(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_investigadores_correo ON investigadores(correo);
CREATE INDEX IF NOT EXISTS idx_investigadores_slug ON investigadores(slug);
CREATE INDEX IF NOT EXISTS idx_investigadores_curp ON investigadores(curp);
CREATE INDEX IF NOT EXISTS idx_investigadores_activo ON investigadores(activo);

-- PASO 4: Verificar estructura final
SELECT 
    column_name, 
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigadores'
AND column_name IN (
    'clerk_user_id', 'nombre_completo', 'nombres', 'apellidos', 
    'correo', 'genero', 'municipio', 'tipo_perfil', 
    'nivel_investigador', 'nivel_tecnologo', 'linea_investigacion',
    'area_investigacion', 'ultimo_grado_estudios', 'empleo_actual'
)
ORDER BY ordinal_position;

-- PASO 5: Verificar datos existentes
SELECT 
    COUNT(*) as total_registros,
    COUNT(clerk_user_id) as con_clerk_id,
    COUNT(nombre_completo) as con_nombre,
    COUNT(correo) as con_correo,
    COUNT(genero) as con_genero,
    COUNT(tipo_perfil) as con_tipo_perfil,
    COUNT(linea_investigacion) as con_linea_investigacion
FROM investigadores;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Todas las columnas existen
-- ✅ Todos los índices creados
-- ✅ Datos verificados
-- =====================================================

