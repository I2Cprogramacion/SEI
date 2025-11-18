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
    const emailLower = email.toLowerCase()
    console.log('🔍 [verificarAdmin] Buscando usuario con email:', emailLower)
    
    const result = await sql`
      SELECT id, nombre_completo, correo, es_admin 
      FROM investigadores 
      WHERE LOWER(correo) = ${emailLower}
    `

    console.log('📊 [verificarAdmin] Resultado de la consulta:', {
      rowsCount: result.rows.length,
      rows: result.rows.map(r => ({
        id: r.id,
        correo: r.correo,
        es_admin: r.es_admin,
        tipo_es_admin: typeof r.es_admin
      }))
    })

    if (result.rows.length === 0) {
      console.log('❌ [verificarAdmin] Usuario no encontrado en la base de datos')
      return {
        esAdmin: false,
        usuario: null,
        redirect: '/dashboard'
      }
    }

    const usuario = result.rows[0]
    console.log('👤 [verificarAdmin] Usuario encontrado:', {
      id: usuario.id,
      nombre: usuario.nombre_completo,
      correo: usuario.correo,
      es_admin: usuario.es_admin,
      tipo_es_admin: typeof usuario.es_admin
    })

    // Verificar si es_admin es true (puede ser boolean, string 'true', o número 1)
    const esAdmin = usuario.es_admin === true || usuario.es_admin === 'true' || usuario.es_admin === 1 || usuario.es_admin === '1'
    
    console.log('✅ [verificarAdmin] Resultado de verificación:', esAdmin)

    if (!esAdmin) {
      console.log('❌ [verificarAdmin] Usuario no es administrador. es_admin =', usuario.es_admin)
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
