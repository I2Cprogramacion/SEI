/**
 * Utilidades para manejo de autenticación con Clerk
 * 
 * Estas funciones ayudan a verificar el estado de autenticación
 * y manejar sesiones en la aplicación
 */

import { auth } from "@clerk/nextjs/server"

/**
 * Verifica si el usuario está autenticado en el servidor
 * Usar en Server Components o API Routes
 */
export async function isAuthenticated() {
  const { userId } = await auth()
  return !!userId
}

/**
 * Obtiene el ID del usuario autenticado
 * Retorna null si no está autenticado
 */
export async function getCurrentUserId() {
  const { userId } = await auth()
  return userId
}

/**
 * Verifica si el usuario tiene un rol específico
 * Por ahora retorna true para todos los usuarios autenticados
 * En el futuro se puede expandir con roles de Clerk metadata
 */
export async function hasRole(role: string) {
  const { userId } = await auth()
  if (!userId) return false
  
  // TODO: Implementar verificación de roles con Clerk metadata
  // const { sessionClaims } = await auth()
  // return sessionClaims?.metadata?.role === role
  
  return true // Por ahora todos los usuarios autenticados tienen acceso
}

/**
 * Configuración de roles disponibles
 */
export const ROLES = {
  ADMIN: "admin",
  INVESTIGADOR: "investigador",
  VISITANTE: "visitante",
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]
