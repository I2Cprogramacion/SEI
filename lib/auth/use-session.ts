"use client"

import { useUser, useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"

/**
 * Hook personalizado para obtener información de la sesión
 * Incluye información sobre la duración y renovación del token
 */
export function useSessionInfo() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { sessionId } = useAuth()
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)

  useEffect(() => {
    if (isLoaded && isSignedIn && sessionId) {
      // Calcular la expiración de la sesión (12 horas desde ahora)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 12)
      setSessionExpiry(expiryDate)
    }
  }, [isLoaded, isSignedIn, sessionId])

  return {
    isLoaded,
    isSignedIn,
    user,
    sessionId,
    sessionExpiry,
  }
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 * Por ahora retorna true para todos los usuarios autenticados
 */
export function useUserRole() {
  const { isSignedIn, user } = useUser()

  const hasRole = (role: string): boolean => {
    if (!isSignedIn || !user) return false
    
    // TODO: Verificar roles desde user.publicMetadata
    // return user.publicMetadata?.role === role
    
    return true // Por ahora todos los usuarios tienen acceso
  }

  const isAdmin = (): boolean => {
    return hasRole("admin")
  }

  const isInvestigador = (): boolean => {
    return hasRole("investigador")
  }

  return {
    hasRole,
    isAdmin,
    isInvestigador,
  }
}

/**
 * Hook para proteger componentes (Client Side)
 * Redirige si el usuario no está autenticado
 */
export function useRequireAuth() {
  const { isLoaded, isSignedIn } = useUser()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        // Redirigir a login si no está autenticado
        window.location.href = "/iniciar-sesion"
      } else {
        setIsAuthorized(true)
      }
    }
  }, [isLoaded, isSignedIn])

  return { isLoaded, isAuthorized }
}
