-- =====================================================
-- SCRIPT PARA AGREGAR COLUMNA sni_url
-- Sistema Estatal de Investigadores
-- =====================================================
-- Este script agrega la columna sni_url a la tabla investigadores
-- si no existe, para almacenar la URL del documento SNI

-- Agregar columna sni_url si no existe
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS sni_url TEXT;

-- Verificar que la columna fue agregada
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'investigadores'
AND column_name = 'sni_url';

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Columna sni_url agregada exitosamente
-- =====================================================


