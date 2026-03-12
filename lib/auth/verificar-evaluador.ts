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
    const clerkUserId = user.id

    if (!email && !clerkUserId) {
      return {
        esEvaluador: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    // Verificar si el usuario es evaluador en la BD
    const emailLower = email?.toLowerCase().trim()
    
    let result
    try {
      // Intento 1: Buscar por email
      result = await sql`
        SELECT id, nombre_completo, correo, es_evaluador, clerk_user_id
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
        LIMIT 1
      `
      
      // Intento 2: Si no se encontró por email, buscar por clerk_user_id
      if (result.rows.length === 0 && clerkUserId) {
        result = await sql`
          SELECT id, nombre_completo, correo, es_evaluador, clerk_user_id
          FROM investigadores 
          WHERE clerk_user_id = ${clerkUserId}
          LIMIT 1
        `
      }
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
    const clerkUserId = user.id

    if (!email && !clerkUserId) {
      return {
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        usuario: null,
        redirect: '/iniciar-sesion'
      }
    }

    console.log(`🔍 [verificarAdminOEvaluador] Buscando para: email=${email}, clerkUserId=${clerkUserId}`)

    const emailLower = email?.toLowerCase().trim()
    
    let result
    try {
      // Intento 1: Buscar por email (case-insensitive)
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin, es_evaluador, clerk_user_id
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
        LIMIT 1
      `
      
      // Intento 2: Si no se encontró por email, buscar por clerk_user_id
      if (result.rows.length === 0 && clerkUserId) {
        console.log(`⚠️ [verificarAdminOEvaluador] No encontrado por email. Intentando con clerk_user_id...`)
        result = await sql`
          SELECT id, nombre_completo, correo, es_admin, es_evaluador, clerk_user_id
          FROM investigadores 
          WHERE clerk_user_id = ${clerkUserId}
          LIMIT 1
        `
      }
    } catch (sqlError) {
      console.error('❌ [verificarAdminOEvaluador] Error en la consulta SQL:', sqlError)
      throw sqlError
    }

    if (result.rows.length === 0) {
      console.warn(`⚠️ [verificarAdminOEvaluador] Usuario no encontrado en BD`)
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
      usuario: usuario.nombre_completo,
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

