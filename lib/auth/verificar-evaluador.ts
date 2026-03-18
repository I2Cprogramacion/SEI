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
  console.log('🚀 [verificarAdminOEvaluador] INICIO - Obteniendo usuario de Clerk...')
  
  try {
    console.log('⏳ [verificarAdminOEvaluador] Esperando currentUser()...')
    const user = await currentUser()
    console.log('✅ [verificarAdminOEvaluador] currentUser() completado. User:', !!user ? user.id : 'NULL')
    
    if (!user) {
      console.log('⚠️ [verificarAdminOEvaluador] No hay usuario (no autenticado)')
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
    console.log('📧 [verificarAdminOEvaluador] Email:', email, 'ClerkID:', clerkUserId)

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
      console.log(`⏱️ [verificarAdminOEvaluador] Iniciando consulta SQL por email: ${emailLower}`)
      
      // Intento 1: Buscar por email (case-insensitive)
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin, es_evaluador, clerk_user_id
        FROM investigadores 
        WHERE LOWER(correo) = ${emailLower}
        LIMIT 1
      `
      
      console.log(`✅ [verificarAdminOEvaluador] Consulta SQL completada. Filas encontradas: ${result.rows.length}`)
      
      // Intento 2: Si no se encontró por email, buscar por clerk_user_id
      if (result.rows.length === 0 && clerkUserId) {
        console.log(`⚠️ [verificarAdminOEvaluador] No encontrado por email. Intentando con clerk_user_id: ${clerkUserId}`)
        result = await sql`
          SELECT id, nombre_completo, correo, es_admin, es_evaluador, clerk_user_id
          FROM investigadores 
          WHERE clerk_user_id = ${clerkUserId}
          LIMIT 1
        `
        console.log(`✅ [verificarAdminOEvaluador] Consulta por clerk_user_id completada. Filas encontradas: ${result.rows.length}`)
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
    console.error('❌ [verificarAdminOEvaluador] Error completo:', JSON.stringify(error, null, 2))
    
    // 🔧 FALLBACK: Si la BD está caída, verificar por email de admin en Clerk
    // Emails permitidos para acceso de emergencia a admin
    const emailsAdminEmergencia = [
      'soporte@sei-chih.com.mx',
      'admin@sei-chih.com.mx',
      'desarrollador@sei-chih.com.mx',
      user?.emailAddresses[0]?.emailAddress
    ].filter(Boolean).map(e => e?.toLowerCase())
    
    const userEmail = user?.emailAddresses[0]?.emailAddress?.toLowerCase()
    const esAdminEmergencia = userEmail && emailsAdminEmergencia.includes(userEmail)
    
    if (esAdminEmergencia) {
      console.log('🔧 [FALLBACK] Acceso de emergencia otorgado para:', userEmail)
      return {
        tieneAcceso: true,
        esAdmin: true,
        esEvaluador: false,
        usuario: {
          id: user?.id,
          nombre_completo: user?.firstName || 'Admin',
          correo: userEmail,
          es_admin: true,
          es_evaluador: false,
          clerk_user_id: user?.id
        },
        redirect: null
      }
    }
    
    // Si no es admin de emergencia, re-lanzar el error para que se maneje en el nivel superior
    console.error('❌ [verificarAdminOEvaluador] FALLBACK no aplicable, lanzando error...')
    throw error
  }
}

