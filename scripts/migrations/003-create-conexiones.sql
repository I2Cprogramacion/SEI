-- Migration: 003-create-conexiones.sql
-- Purpose: create the conexiones table used by /api/conexiones and related endpoints.
-- This script is idempotent.

CREATE TABLE IF NOT EXISTS conexiones (
  id SERIAL PRIMARY KEY,
  investigador_origen_id VARCHAR(255) NOT NULL,   -- Clerk user id del solicitante
  investigador_destino_id VARCHAR(255) NOT NULL,  -- Clerk user id del destinatario
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente | aceptada | rechazada
  mensaje TEXT,
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP,
  CONSTRAINT chk_estado_conexion CHECK (estado IN ('pendiente','aceptada','rechazada'))
);

-- Índices para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_conexiones_origen ON conexiones(investigador_origen_id);
CREATE INDEX IF NOT EXISTS idx_conexiones_destino ON conexiones(investigador_destino_id);
CREATE INDEX IF NOT EXISTS idx_conexiones_estado ON conexiones(estado);

-- Evita solicitudes duplicadas pendientes entre el mismo par, sin importar dirección
CREATE UNIQUE INDEX IF NOT EXISTS ux_conexiones_pendiente_pair
ON conexiones (
  LEAST(investigador_origen_id, investigador_destino_id),
  GREATEST(investigador_origen_id, investigador_destino_id)
)
WHERE estado = 'pendiente';
