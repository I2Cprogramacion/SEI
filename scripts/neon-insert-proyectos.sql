-- =====================================================
-- SQL PARA INSERTAR EN NEON - PROYECTOS
-- =====================================================
-- Tabla: proyectos
-- Columna requerida: titulo
-- Investigador ID 2: Jesus Gerardo Ojeda Martinez
-- =====================================================

-- 1. PROYECTO DE INVESTIGACIÓN EN IA
INSERT INTO proyectos (
  titulo,
  descripcion,
  investigador_principal_id,
  investigador_principal,
  fecha_inicio,
  fecha_fin,
  estado,
  area_investigacion,
  categoria,
  presupuesto,
  fuente_financiamiento,
  institucion
) VALUES (
  'Desarrollo de Sistema Inteligente de Recomendación Educativa',
  'Proyecto enfocado en crear una plataforma que utilice algoritmos de machine learning para personalizar contenidos educativos según el perfil y progreso de cada estudiante.',
  2,
  'Jesus Gerardo Ojeda Martinez',
  '2024-01-15',
  '2025-12-31',
  'En Progreso',
  'Inteligencia Artificial',
  'Investigación Aplicada',
  850000.00,
  'CONACyT',
  'Universidad Autónoma de Chihuahua'
);

-- 2. PROYECTO DE TRANSFORMACIÓN DIGITAL
INSERT INTO proyectos (
  titulo,
  descripcion,
  investigador_principal_id,
  investigador_principal,
  fecha_inicio,
  fecha_fin,
  estado,
  area_investigacion,
  categoria,
  presupuesto,
  fuente_financiamiento,
  institucion
) VALUES (
  'Digitalización de Procesos de Investigación Científica',
  'Implementación de herramientas digitales y automatización de flujos de trabajo en laboratorios de investigación para mejorar eficiencia y trazabilidad.',
  2,
  'Jesus Gerardo Ojeda Martinez',
  '2023-06-01',
  '2024-05-31',
  'Completado',
  'Gestión de la Ciencia',
  'Desarrollo Tecnológico',
  450000.00,
  'Fondos Institucionales',
  'Universidad Autónoma de Chihuahua'
);

-- 3. PROYECTO DE COLABORACIÓN INTERNACIONAL
INSERT INTO proyectos (
  titulo,
  descripcion,
  investigador_principal_id,
  investigador_principal,
  fecha_inicio,
  estado,
  area_investigacion,
  categoria,
  presupuesto,
  fuente_financiamiento,
  institucion
) VALUES (
  'Red Latinoamericana de Investigación en IA Educativa',
  'Proyecto multinacional para establecer una red de colaboración entre instituciones de México, Colombia, Chile y Argentina enfocada en aplicaciones educativas de IA.',
  2,
  'Jesus Gerardo Ojeda Martinez',
  '2024-08-01',
  'En Progreso',
  'Inteligencia Artificial',
  'Colaboración Internacional',
  1200000.00,
  'UNESCO',
  'Red Multiuniversitaria'
);

-- 4. PROYECTO DE INNOVACIÓN EDUCATIVA
INSERT INTO proyectos (
  titulo,
  descripcion,
  investigador_principal_id,
  investigador_principal,
  fecha_inicio,
  fecha_fin,
  estado,
  area_investigacion,
  categoria,
  institucion
) VALUES (
  'Implementación de Tutores Virtuales Inteligentes en Educación Superior',
  'Desarrollo e implementación de asistentes virtuales basados en IA para apoyo académico 24/7 a estudiantes universitarios.',
  2,
  'Jesus Gerardo Ojeda Martinez',
  '2024-02-01',
  '2024-11-30',
  'En Progreso',
  'Tecnología Educativa',
  'Innovación',
  'Universidad Autónoma de Chihuahua'
);

-- 5. PROYECTO DE VINCULACIÓN CON SECTOR PRODUCTIVO
INSERT INTO proyectos (
  titulo,
  descripcion,
  investigador_principal_id,
  investigador_principal,
  fecha_inicio,
  estado,
  area_investigacion,
  categoria,
  presupuesto,
  fuente_financiamiento
) VALUES (
  'Optimización de Procesos Industriales mediante IA',
  'Proyecto de consultoría e investigación aplicada para implementar soluciones de machine learning en procesos de manufactura y control de calidad.',
  2,
  'Jesus Gerardo Ojeda Martinez',
  '2024-03-15',
  'En Progreso',
  'Inteligencia Artificial',
  'Vinculación',
  600000.00,
  'Empresa Privada'
);

-- =====================================================
-- VERIFICAR DATOS INSERTADOS
-- =====================================================

-- Contar proyectos por estado
SELECT estado, COUNT(*) as cantidad 
FROM proyectos 
GROUP BY estado 
ORDER BY cantidad DESC;

-- Ver todos los proyectos del investigador
SELECT 
  id,
  titulo,
  estado,
  fecha_inicio,
  fecha_fin,
  area_investigacion,
  presupuesto
FROM proyectos 
WHERE investigador_principal_id = 2
ORDER BY fecha_inicio DESC;

-- Estadísticas generales
SELECT 
  COUNT(*) as total_proyectos,
  COUNT(CASE WHEN estado = 'En Progreso' THEN 1 END) as en_progreso,
  COUNT(CASE WHEN estado = 'Completado' THEN 1 END) as completados,
  SUM(presupuesto) as presupuesto_total,
  AVG(presupuesto) as presupuesto_promedio
FROM proyectos
WHERE investigador_principal_id = 2;

-- Proyectos activos con mayor presupuesto
SELECT 
  titulo,
  presupuesto,
  fuente_financiamiento,
  fecha_inicio
FROM proyectos 
WHERE estado = 'En Progreso'
  AND investigador_principal_id = 2
ORDER BY presupuesto DESC;
