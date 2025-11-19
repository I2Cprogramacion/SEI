-- Migration: fix-conexiones-table.sql
-- Purpose: Update conexiones table to use investigador IDs instead of clerk_user_id
-- This script drops the old table and recreates it with the correct schema

-- Drop the old table (this will also drop the data - safe since it's a new feature)
DROP TABLE IF EXISTS conexiones CASCADE;

-- Create new conexiones table with investigador IDs
CREATE TABLE conexiones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  investigador_id TEXT NOT NULL,
  conectado_con_id TEXT NOT NULL,
  investigador_destino_id TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  mensaje TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT chk_estado_conexion CHECK (estado IN ('pendiente','aceptada','rechazada')),
  CONSTRAINT fk_investigador FOREIGN KEY (investigador_id) REFERENCES investigadores(id) ON DELETE CASCADE,
  CONSTRAINT fk_conectado_con FOREIGN KEY (conectado_con_id) REFERENCES investigadores(id) ON DELETE CASCADE,
  CONSTRAINT fk_investigador_destino FOREIGN KEY (investigador_destino_id) REFERENCES investigadores(id) ON DELETE CASCADE
);

-- Create indexes for fast lookups
CREATE INDEX idx_conexiones_investigador ON conexiones(investigador_id);
CREATE INDEX idx_conexiones_conectado_con ON conexiones(conectado_con_id);
CREATE INDEX idx_conexiones_estado ON conexiones(estado);

-- Prevent duplicate pending connections
CREATE UNIQUE INDEX ux_conexiones_pendiente_pair
ON conexiones (
  LEAST(investigador_id, conectado_con_id),
  GREATEST(investigador_id, conectado_con_id)
)
WHERE estado = 'pendiente';

-- Success message
SELECT 'Tabla conexiones actualizada correctamente' AS resultado;
