import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * Middleware para verificar si el usuario es administrador
 * Usar en las páginas/APIs de admin
 */
export async function verificarAdmin() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return {
        esAdmin: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return {
        esAdmin: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    // Verificar si el usuario es admin en la BD
    const result = await sql`
      SELECT id, nombre_completo, correo, es_admin 
      FROM investigadores 
      WHERE correo = ${email}
    `

    if (result.rows.length === 0) {
      return {
        esAdmin: false,
        usuario: null,
        redirect: '/dashboard'
      }
    }

    const usuario = result.rows[0]

    if (!usuario.es_admin) {
      return {
        esAdmin: false,
        usuario: usuario,
        redirect: '/dashboard'
      }
    }

    return {
      esAdmin: true,
      usuario: usuario,
      redirect: null
    }
  } catch (error) {
    console.error('Error al verificar admin:', error)
    return {
      esAdmin: false,
      usuario: null,
      redirect: '/dashboard'
    }
  }
}
