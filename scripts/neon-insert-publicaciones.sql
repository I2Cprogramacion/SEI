-- =====================================================
-- SQL PARA INSERTAR EN NEON - PUBLICACIONES
-- =====================================================
-- Tabla: publicaciones
-- Columnas requeridas: titulo, autor
-- Investigador ID 2: Jesus Gerardo Ojeda Martinez
-- =====================================================

-- 1. ARTÍCULO CIENTÍFICO
INSERT INTO publicaciones (
  titulo, 
  autor, 
  resumen,
  tipo, 
  categoria,
  año_creacion,
  doi,
  palabras_clave,
  acceso,
  volumen,
  numero,
  paginas,
  investigador_id
) VALUES (
  'Inteligencia Artificial Aplicada a la Educación Superior en México',
  'Jesus Gerardo Ojeda Martinez',
  'Este artículo analiza el impacto de las tecnologías de IA en las metodologías educativas contemporáneas, identificando beneficios y desafíos en su implementación.',
  'Artículo',
  'Tecnología Educativa',
  2024,
  '10.1234/ejemplo.2024.001',
  'inteligencia artificial, educación, tecnología, aprendizaje',
  'Abierto',
  '12',
  '3',
  '145-167',
  2
);

-- 2. LIBRO
INSERT INTO publicaciones (
  titulo, 
  autor, 
  resumen,
  tipo, 
  categoria,
  año_creacion,
  editorial,
  palabras_clave,
  acceso,
  investigador_id
) VALUES (
  'Fundamentos de Machine Learning y Deep Learning',
  'Jesus Gerardo Ojeda Martinez',
  'Guía completa sobre algoritmos de aprendizaje automático, redes neuronales y aplicaciones prácticas en diversos sectores industriales.',
  'Libro',
  'Inteligencia Artificial',
  2023,
  'Editorial Académica Internacional',
  'machine learning, deep learning, redes neuronales, algoritmos',
  'Abierto',
  2
);

-- 3. CAPÍTULO DE LIBRO
INSERT INTO publicaciones (
  titulo, 
  autor, 
  resumen,
  tipo, 
  categoria,
  año_creacion,
  editorial,
  palabras_clave,
  paginas,
  investigador_id
) VALUES (
  'Capítulo 5: Aplicaciones de IA en Sistemas de Recomendación',
  'Jesus Gerardo Ojeda Martinez',
  'Análisis detallado de técnicas de filtrado colaborativo y sistemas de recomendación basados en IA para plataformas educativas.',
  'Capítulo de Libro',
  'Inteligencia Artificial',
  2024,
  'Springer Nature',
  'sistemas de recomendación, filtrado colaborativo, personalización',
  '89-112',
  2
);

-- 4. PONENCIA EN CONFERENCIA
INSERT INTO publicaciones (
  titulo, 
  autor, 
  resumen,
  tipo, 
  categoria,
  año_creacion,
  palabras_clave,
  investigador_id
) VALUES (
  'Transformación Digital en la Investigación Científica Mexicana',
  'Jesus Gerardo Ojeda Martinez',
  'Presentación sobre el estado actual de la digitalización en centros de investigación, casos de éxito y propuestas de mejora.',
  'Ponencia',
  'Gestión de la Ciencia',
  2024,
  'transformación digital, investigación, México, innovación',
  2
);

-- 5. TESIS
INSERT INTO publicaciones (
  titulo, 
  autor, 
  resumen,
  tipo, 
  categoria,
  año_creacion,
  palabras_clave,
  institucion,
  investigador_id
) VALUES (
  'Optimización de Algoritmos de Clasificación mediante Técnicas de Ensemble Learning',
  'Jesus Gerardo Ojeda Martinez',
  'Tesis doctoral que propone nuevos métodos de combinación de clasificadores para mejorar precisión y robustez en problemas de clasificación multiclase.',
  'Tesis',
  'Ciencias Computacionales',
  2022,
  'ensemble learning, clasificación, machine learning, optimización',
  'Universidad Autónoma de Chihuahua',
  2
);

-- =====================================================
-- VERIFICAR DATOS INSERTADOS
-- =====================================================

-- Contar publicaciones por tipo
SELECT tipo, COUNT(*) as cantidad 
FROM publicaciones 
GROUP BY tipo 
ORDER BY cantidad DESC;

-- Ver todas las publicaciones del investigador
SELECT 
  id,
  titulo,
  tipo,
  año_creacion,
  autor
FROM publicaciones 
WHERE investigador_id = 2
ORDER BY año_creacion DESC;

-- Estadísticas generales
SELECT 
  COUNT(*) as total_publicaciones,
  COUNT(DISTINCT investigador_id) as investigadores_con_publicaciones,
  COUNT(DISTINCT tipo) as tipos_diferentes,
  MIN(año_creacion) as año_mas_antiguo,
  MAX(año_creacion) as año_mas_reciente
FROM publicaciones;
