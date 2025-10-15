"use client"

import { useActividadUsuario } from '@/hooks/use-actividad-usuario'

/**
 * Componente que registra automáticamente la actividad del usuario
 * Se debe incluir en el layout principal de la aplicación
 */
export function ActividadUsuarioTracker() {
  useActividadUsuario()
  return null // No renderiza nada, solo ejecuta el hook
}
