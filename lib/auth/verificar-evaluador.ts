import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * Middleware para verificar si el usuario es evaluador
 * Usar en las páginas/APIs que requieren rol de evaluador
 */
export async function verificarEvaluador() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return {
        esEvaluador: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return {
        esEvaluador: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    // Verificar si el usuario es evaluador en la BD
    const emailLower = email.toLowerCase().trim()
    
    let result
    try {
      result = await sql`
        SELECT id, nombre_completo, correo, es_evaluador 
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
      `
    } catch (sqlError) {
      console.error('❌ [verificarEvaluador] Error en la consulta SQL:', sqlError)
      throw sqlError
    }

    if (result.rows.length === 0) {
      return {
        esEvaluador: false,
        usuario: null,
        redirect: '/dashboard'
      }
    }

    const usuario = result.rows[0]
    const esEvaluador = usuario.es_evaluador === true
    
    console.log('✅ [verificarEvaluador] Verificación final:', {
      es_evaluador_valor: usuario.es_evaluador,
      esEvaluador_resultado: esEvaluador
    })

    if (!esEvaluador) {
      console.log('❌ [verificarEvaluador] Usuario NO es evaluador')
      return {
        esEvaluador: false,
        usuario: usuario,
        redirect: '/dashboard'
      }
    }

    console.log('✅ [verificarEvaluador] Usuario ES evaluador')

    return {
      esEvaluador: true,
      usuario: usuario,
      redirect: null
    }
  } catch (error) {
    console.error('❌ [verificarEvaluador] Error al verificar evaluador:', error)
    return {
      esEvaluador: false,
      usuario: null,
      redirect: '/dashboard'
    }
  }
}

/**
 * Verifica si el usuario es admin o evaluador
 * Útil para páginas que permiten acceso a ambos roles
 */
export async function verificarAdminOEvaluador() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return {
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return {
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    const emailLower = email.toLowerCase().trim()
    
    let result
    try {
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin, es_evaluador 
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
      `
    } catch (sqlError) {
      console.error('❌ [verificarAdminOEvaluador] Error en la consulta SQL:', sqlError)
      throw sqlError
    }

    if (result.rows.length === 0) {
      return {
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        usuario: null,
        redirect: '/dashboard'
      }
    }

    const usuario = result.rows[0]
    const esAdmin = usuario.es_admin === true
    const esEvaluador = usuario.es_evaluador === true
    const tieneAcceso = esAdmin || esEvaluador
    
    console.log('✅ [verificarAdminOEvaluador] Verificación final:', {
      esAdmin,
      esEvaluador,
      tieneAcceso
    })

    if (!tieneAcceso) {
      return {
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        usuario: usuario,
        redirect: '/dashboard'
      }
    }

    return {
      tieneAcceso: true,
      esAdmin,
      esEvaluador,
      usuario: usuario,
      redirect: null
    }
  } catch (error) {
    console.error('❌ [verificarAdminOEvaluador] Error al verificar:', error)
    return {
      tieneAcceso: false,
      esAdmin: false,
      esEvaluador: false,
      usuario: null,
      redirect: '/dashboard'
    }
  }
}

