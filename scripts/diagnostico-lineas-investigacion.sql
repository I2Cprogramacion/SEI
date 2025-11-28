-- =====================================================
-- DIAGNÓSTICO: Líneas de Investigación por Área
-- =====================================================

-- Ver todas las áreas únicas registradas
SELECT 
    DISTINCT COALESCE(area_investigacion, 'Sin especificar') as area,
    COUNT(*) as total_investigadores
FROM investigadores
GROUP BY COALESCE(area_investigacion, 'Sin especificar')
ORDER BY total_investigadores DESC;

-- Ver líneas de investigación por área (solo las que tienen datos)
SELECT 
    COALESCE(area_investigacion, 'Sin especificar') as area,
    linea_investigacion,
    nombre_completo,
    institucion
FROM investigadores
WHERE linea_investigacion IS NOT NULL 
  AND linea_investigacion != ''
ORDER BY area, nombre_completo;

-- Contar líneas de investigación por área
SELECT 
    COALESCE(area_investigacion, 'Sin especificar') as area,
    COUNT(DISTINCT linea_investigacion) as lineas_unicas,
    COUNT(*) as total_con_linea
FROM investigadores
WHERE linea_investigacion IS NOT NULL 
  AND linea_investigacion != ''
GROUP BY COALESCE(area_investigacion, 'Sin especificar')
ORDER BY lineas_unicas DESC;

-- Ver ejemplo específico de un área
SELECT 
    COALESCE(area_investigacion, 'Sin especificar') as area,
    STRING_AGG(DISTINCT linea_investigacion, ', ') as todas_las_lineas
FROM investigadores
WHERE LOWER(COALESCE(area_investigacion, 'Sin especificar')) LIKE '%físico%'
  AND linea_investigacion IS NOT NULL 
  AND linea_investigacion != ''
GROUP BY COALESCE(area_investigacion, 'Sin especificar');

