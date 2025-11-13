/**
 * Utilidades de seguridad para validar ownership de recursos
 * Previene que usuarios accedan/modifiquen datos de otros usuarios
 */

import { sql } from "@vercel/postgres"
import { currentUser } from "@clerk/nextjs/server"

/**
 * Obtiene el ID del investigador asociado al usuario autenticado
 * @returns ID del investigador o null si no existe
 */
export async function getInvestigadorIdFromSession(): Promise<number | null> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return null
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return null
    }

    const result = await sql`
      SELECT id 
      FROM investigadores 
      WHERE correo = ${email}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0].id
  } catch (error) {
    console.error("Error al obtener ID de investigador:", error)
    return null
  }
}

/**
 * Valida que el usuario autenticado sea dueño del perfil especificado
 * @param perfilId - ID del perfil a verificar
 * @returns true si es el dueño, false si no
 */
export async function validateOwnership(perfilId: number): Promise<boolean> {
  try {
    const investigadorId = await getInvestigadorIdFromSession()
    
    if (!investigadorId) {
      return false
    }

    return investigadorId === perfilId
  } catch (error) {
    console.error("Error al validar ownership:", error)
    return false
  }
}

/**
 * Obtiene el ID del investigador desde el email del usuario autenticado
 * Lanza error si no encuentra el perfil
 */
export async function requireInvestigadorId(): Promise<number> {
  const investigadorId = await getInvestigadorIdFromSession()
  
  if (!investigadorId) {
    throw new Error("No se encontró perfil de investigador asociado a este usuario")
  }

  return investigadorId
}

/**
 * Middleware para validar ownership antes de operaciones sensibles
 * Uso: await requireOwnership(perfilId) - lanza error si no es dueño
 */
export async function requireOwnership(perfilId: number): Promise<void> {
  const isOwner = await validateOwnership(perfilId)
  
  if (!isOwner) {
    throw new Error("No autorizado: no eres el dueño de este recurso")
  }
}
