import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // 1. Autenticación
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'No autenticado'
      }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase()
    const clerkUserId = user.id

    if (!email && !clerkUserId) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'Sin email'
      }, { status: 400 })
    }

    console.log(`🔍 [admin] Verificando: email=${email}, clerkUserId=${clerkUserId}`)

    // 2. Búsqueda con fallback (igual que investigadores/actual)
    let result = null

    // Intento 1: Por email
    if (email) {
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin, es_evaluador
        FROM investigadores 
        WHERE LOWER(correo) = ${email}
        LIMIT 1
      `
    }

    // Intento 2: Si no encontró por email, buscar por clerk_user_id
    if ((!result || result.rows.length === 0) && clerkUserId) {
      console.log(`⚠️ [admin] No encontrado por email. Intentando clerk_user_id...`)
      result = await sql`
        SELECT id, nombre_completo, correo, es_admin, es_evaluador
        FROM investigadores 
        WHERE clerk_user_id = ${clerkUserId}
        LIMIT 1
      `
    }

    if (!result || result.rows.length === 0) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'Usuario no encontrado en BD'
      }, { status: 403 })
    }

    const usuario = result.rows[0]
    const tieneAcceso = usuario.es_admin === true || usuario.es_evaluador === true

    console.log(`✅ [admin] ${usuario.correo}: es_admin=${usuario.es_admin}, es_evaluador=${usuario.es_evaluador}`)

    if (!tieneAcceso) {
      return NextResponse.json({
        tieneAcceso: false,
        error: 'Sin permisos'
      }, { status: 403 })
    }

    return NextResponse.json({
      tieneAcceso: true,
      esAdmin: usuario.es_admin === true,
      esEvaluador: usuario.es_evaluador === true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        email: usuario.correo
      }
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    
    console.error('❌ [admin] Error COMPLETO:')
    console.error('  Mensaje:', errorMsg)
    console.error('  Stack:', errorStack)
    console.error('  Raw:', JSON.stringify(error, null, 2))
    
    return NextResponse.json({
      tieneAcceso: false,
      error: 'Error al verificar',
      debug: {
        errorMsg,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 })
  }
}

