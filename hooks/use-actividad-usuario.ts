"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

/**
 * Hook para registrar la actividad del usuario en la base de datos
 * Actualiza cada 2 minutos mientras el usuario está activo
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

    // Configurar intervalo para actualizar cada 2 minutos
    intervalRef.current = setInterval(() => {
      registrarActividad()
    }, 2 * 60 * 1000) // 2 minutos

    // Registrar actividad cuando el usuario interactúa
    const handleActivity = () => {
      const now = Date.now()
      // Solo actualizar si han pasado al menos 1 minuto desde la última actualización
      if (now - lastActivityRef.current > 60 * 1000) {
        registrarActividad()
      }
    }

    // Eventos que indican actividad del usuario
    window.addEventListener('click', handleActivity)
    window.addEventListener('keypress', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('mousemove', handleActivity)

    // Limpiar al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keypress', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('mousemove', handleActivity)
    }
  }, [userId, registrarActividad])

  return { registrarActividad }
}
