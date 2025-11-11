-- Create `publicaciones` table used by the app/api/publicaciones endpoints
-- Run with the companion Node script or execute directly against your Postgres DB
CREATE TABLE IF NOT EXISTS publicaciones (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT,
  institucion VARCHAR(255),
  editorial VARCHAR(255),
  año_creacion INTEGER,
  doi VARCHAR(255),
  resumen TEXT,
  palabras_clave TEXT,
  categoria VARCHAR(100),
  tipo VARCHAR(100),
  acceso VARCHAR(50) DEFAULT 'abierto',
  volumen VARCHAR(50),
  numero VARCHAR(50),
  paginas VARCHAR(50),
  archivo TEXT,
  archivo_url TEXT,
  clerk_user_id VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_publicaciones_clerk_user ON publicaciones(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_fecha ON publicaciones(fecha_creacion);
