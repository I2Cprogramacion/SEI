-- MIGRACIÓN: Actualizar tabla institutions con todos los campos del formulario
-- Ejecutar en: Neon Console (https://console.neon.tech) o directamente en la base de datos

-- Agregar nuevas columnas a la tabla institutions
ALTER TABLE institutions
  -- Información básica adicional
  ADD COLUMN IF NOT EXISTS siglas VARCHAR(50),
  ADD COLUMN IF NOT EXISTS tipo_otro_especificar VARCHAR(255),
  ADD COLUMN IF NOT EXISTS año_fundacion INTEGER,
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS imagen_url TEXT,
  
  -- Régimen fiscal 
  ADD COLUMN IF NOT EXISTS tipo_persona VARCHAR(10), -- 'fisica' o 'moral'
  ADD COLUMN IF NOT EXISTS rfc VARCHAR(13),
  ADD COLUMN IF NOT EXISTS razon_social TEXT,
  ADD COLUMN IF NOT EXISTS regimen_fiscal VARCHAR(255),
  ADD COLUMN IF NOT EXISTS actividad_economica TEXT,
  
  -- Persona física específicos
  ADD COLUMN IF NOT EXISTS curp VARCHAR(18),
  ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(255),
  
  -- Persona moral específicos
  ADD COLUMN IF NOT EXISTS numero_escritura VARCHAR(100),
  ADD COLUMN IF NOT EXISTS fecha_constitucion DATE,
  ADD COLUMN IF NOT EXISTS notario_publico VARCHAR(255),
  ADD COLUMN IF NOT EXISTS numero_notaria VARCHAR(50),
  ADD COLUMN IF NOT EXISTS registro_publico VARCHAR(100),
  ADD COLUMN IF NOT EXISTS objeto_social TEXT,
  
  -- Domicilio fiscal (JSON)
  ADD COLUMN IF NOT EXISTS domicilio_fiscal JSONB,
  
  -- Representante legal (JSON - solo persona moral)
  ADD COLUMN IF NOT EXISTS representante_legal JSONB,
  
  -- Contacto institucional (JSON)
  ADD COLUMN IF NOT EXISTS contacto_institucional JSONB,
  
  -- Áreas de investigación (JSON array)
  ADD COLUMN IF NOT EXISTS areas_investigacion JSONB,
  
  -- Capacidad de investigación
  ADD COLUMN IF NOT EXISTS capacidad_investigacion TEXT,
  
  -- Documentos (JSON con URLs)
  ADD COLUMN IF NOT EXISTS documentos JSONB,
  
  -- Estado
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'PENDIENTE',
  
  -- Metadatos de auditoría
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Actualizar columnas existentes si es necesario
-- Asegurar que sitio_web y ubicacion existan (pueden tener nombres diferentes)
DO $$
BEGIN
  -- Verificar si sitioWeb existe, si no, crear sitio_web
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'sitio_web'
  ) THEN
    ALTER TABLE institutions ADD COLUMN sitio_web VARCHAR(500);
  END IF;
  
  -- Verificar si ubicacion existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'ubicacion'
  ) THEN
    ALTER TABLE institutions ADD COLUMN ubicacion VARCHAR(255);
  END IF;
END $$;

-- Renombrar columnas en formato camelCase si aún existen
DO $$
BEGIN
  -- Renombrar createdAt -> created_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'createdAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE institutions RENAME COLUMN "createdAt" TO created_at;
  END IF;

  -- Renombrar updatedAt -> updated_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'updatedAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE institutions RENAME COLUMN "updatedAt" TO updated_at;
  END IF;

  -- Renombrar sitioWeb -> sitio_web si aún no existe la versión con guion bajo
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'sitioWeb'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institutions' AND column_name = 'sitio_web'
  ) THEN
    ALTER TABLE institutions RENAME COLUMN "sitioWeb" TO sitio_web;
  END IF;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_institutions_rfc ON institutions(rfc);
CREATE INDEX IF NOT EXISTS idx_institutions_tipo ON institutions(tipo);
CREATE INDEX IF NOT EXISTS idx_institutions_estado ON institutions(estado);
CREATE INDEX IF NOT EXISTS idx_institutions_activo ON institutions(activo);

-- Comentarios en las columnas para documentación
COMMENT ON COLUMN institutions.tipo_persona IS 'Tipo de persona: fisica o moral';
COMMENT ON COLUMN institutions.estado IS 'Estado de la institución: PENDIENTE, APROBADA, RECHAZADA';
COMMENT ON COLUMN institutions.domicilio_fiscal IS 'JSON con datos del domicilio fiscal: {calle, numeroExterior, numeroInterior, colonia, codigoPostal, municipio, estado, pais}';
COMMENT ON COLUMN institutions.representante_legal IS 'JSON con datos del representante legal: {nombre, cargo, rfc, telefono, email}';
COMMENT ON COLUMN institutions.contacto_institucional IS 'JSON con datos de contacto: {nombreContacto, cargo, telefono, email, extension}';
COMMENT ON COLUMN institutions.areas_investigacion IS 'JSON array con áreas de investigación';
COMMENT ON COLUMN institutions.documentos IS 'JSON con URLs de documentos: {constanciaSituacionFiscal, actaConstitutiva, poderRepresentante, comprobanteDomicilio, identificacionOficial}';

