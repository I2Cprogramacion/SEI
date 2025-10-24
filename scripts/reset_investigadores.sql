-- Eliminar la tabla si existe
DROP TABLE IF EXISTS investigadores CASCADE;

-- Crear la tabla con los nombres de columnas correctos y tipos adecuados
CREATE TABLE investigadores (
  id SERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  nombres TEXT,
  apellidos TEXT,
  correo TEXT NOT NULL UNIQUE,
  clerk_user_id TEXT UNIQUE,
  area_investigacion TEXT,
  institucion TEXT,
  fotografia_url TEXT,
  slug TEXT UNIQUE,
  curp TEXT,
  rfc TEXT,
  no_cvu TEXT,
  telefono TEXT,
  nacionalidad TEXT,
  fecha_nacimiento DATE,
  cv_url TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  origen TEXT,
  es_admin BOOLEAN DEFAULT FALSE,
  estado_nacimiento TEXT,
  entidad_federativa TEXT,
  orcid TEXT,
  empleo_actual TEXT,
  nivel_actual TEXT,
  institucion_id TEXT,
  activo BOOLEAN DEFAULT TRUE
);
