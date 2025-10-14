"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

/**
 * Hook para registrar la actividad del usuario en la base de datos
 * Actualiza cada 10 minutos mientras el usuario está activo
 */
export function useActividadUsuario() {
  const { userId } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const registrarActividad = useCallback(async () => {
    if (!userId) return

    try {
      await fetch('/api/usuario/actividad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      lastActivityRef.current = Date.now()
    } catch (error) {
      console.error('Error al registrar actividad:', error)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Registrar actividad inicial
    registrarActividad()

    // Configurar intervalo para actualizar cada 10 minutos
    intervalRef.current = setInterval(() => {
      registrarActividad()
    }, 10 * 60 * 1000) // 10 minutos

    // Limpiar al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userId, registrarActividad])

  return { registrarActividad }
}
