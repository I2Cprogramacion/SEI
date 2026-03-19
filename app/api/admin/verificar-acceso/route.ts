import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

/**
 * API para verificar si el usuario tiene acceso (admin o evaluador)
 * GET /api/admin/verificar-acceso
 */
export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    steps: [] as string[]
  }
  
  try {
    debugInfo.steps.push('1. Iniciando')
    console.log('⏱️ [API] Inicio')
    
    // Paso 1: Obtener usuario de Clerk (con timeout)
    debugInfo.steps.push('2. Obteniendo usuario de Clerk...')
    let user
    try {
      user = await Promise.race([
        currentUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout Clerk - 10s')), 10000))
      ])
    } catch (e) {
      debugInfo.steps.push('❌ Timeout en Clerk')
      return NextResponse.json({
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Timeout de autenticación',
        debugInfo
      }, { status: 500 })
    }
    
    debugInfo.steps.push('3. Usuario obtenido')
    console.log('✅ [API] Usuario:', user?.id)
    
    if (!user) {
      debugInfo.steps.push('4. Usuario no autenticado')
      return NextResponse.json({
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'No autenticado',
        debugInfo
      }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    
    if (!email) {
      debugInfo.steps.push('5. Sin email')
      return NextResponse.json({
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Sin email',
        debugInfo
      }, { status: 400 })
    }

    debugInfo.steps.push(`6. Buscando admin con email: ${email}`)
    
    // Paso 2: Consulta SQL rápida
    let result
    try {
      result = await Promise.race([
        sql`SELECT id, nombre_completo, correo, es_admin, es_evaluador FROM investigadores WHERE LOWER(correo) = LOWER(${email}) LIMIT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout SQL - 15s')), 15000))
      ])
    } catch (e) {
      debugInfo.steps.push('❌ Timeout en SQL')
      console.error('SQL timeout:', e)
      return NextResponse.json({
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Timeout de base de datos',
        debugInfo
      }, { status: 500 })
    }
    
    debugInfo.steps.push(`7. Resultado SQL: ${result.rows.length} filas`)
    
    if (result.rows.length === 0) {
      debugInfo.steps.push('8. Usuario no encontrado en BD')
      return NextResponse.json({
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Usuario no encontrado',
        debugInfo
      }, { status: 403 })
    }

    const usuario = result.rows[0]
    const tieneAcceso = usuario.es_admin === true || usuario.es_evaluador === true
    
    debugInfo.steps.push(`9. es_admin: ${usuario.es_admin}, es_evaluador: ${usuario.es_evaluador}`)
    
    if (!tieneAcceso) {
      debugInfo.steps.push('10. Usuario sin permisos')
      return NextResponse.json({
        tieneAcceso: false,
        esAdmin: false,
        esEvaluador: false,
        error: 'Sin permisos',
        debugInfo
      }, { status: 403 })
    }

    debugInfo.steps.push('11. ✅ Acceso otorgado')
    console.log('✅ [API] Acceso permitido para:', email)
    
    return NextResponse.json({
      tieneAcceso: true,
      esAdmin: usuario.es_admin === true,
      esEvaluador: usuario.es_evaluador === true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        email: usuario.correo
      },
      debugInfo
    })
    
  } catch (error) {
    debugInfo.steps.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    console.error('❌ [API] Error:', error)
    
    return NextResponse.json({
      tieneAcceso: false,
      esAdmin: false,
      esEvaluador: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      debugInfo
    }, { status: 500 })
  }
}

