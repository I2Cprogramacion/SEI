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
    // Buscar con email en minúsculas para evitar problemas de case sensitivity
    const emailLower = email.toLowerCase().trim()
    
    let result
    try {
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin 
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
      `
    } catch (sqlError) {
      console.error('❌ [verificarAdmin] Error en la consulta SQL:', sqlError)
      throw sqlError
    }

    if (result.rows.length === 0) {
      return {
        esAdmin: false,
        usuario: null,
        redirect: '/dashboard'
      }
    }

    const usuario = result.rows[0]

    // Verificar directamente si es_admin es true (boolean)
    // El campo es BOOLEAN en la BD, así que verificamos directamente
    const esAdmin = usuario.es_admin === true
    
    console.log('✅ [verificarAdmin] Verificación final:', {
      es_admin_valor: usuario.es_admin,
      es_admin_tipo: typeof usuario.es_admin,
      esAdmin_resultado: esAdmin
    })

    if (!esAdmin) {
      console.log('❌ [verificarAdmin] Usuario NO es administrador. es_admin =', usuario.es_admin, '(tipo:', typeof usuario.es_admin, ')')
      return {
        esAdmin: false,
        usuario: usuario,
        redirect: '/dashboard'
      }
    }

    console.log('✅ [verificarAdmin] Usuario ES administrador')

    return {
      esAdmin: true,
      usuario: usuario,
      redirect: null
    }
  } catch (error) {
    console.error('❌ [verificarAdmin] Error al verificar admin:', error)
    console.error('❌ [verificarAdmin] Detalles del error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return {
      esAdmin: false,
      usuario: null,
      redirect: '/dashboard'
    }
  }
}
