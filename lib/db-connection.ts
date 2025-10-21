/**
 * Configuración mejorada de conexión a PostgreSQL
 * Con manejo de errores y reconexión automática
 */

import { sql } from '@vercel/postgres'

// Cache de la última conexión exitosa
let lastConnectionCheck = 0
const CONNECTION_CHECK_INTERVAL = 30000 // 30 segundos

/**
 * Ejecuta una query con manejo de errores y reintentos
 */
export async function executeQuery<T = any>(
  queryFn: () => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await queryFn()
      return result
    } catch (error: any) {
      lastError = error
      
      // Errores de conexión que vale la pena reintentar
      const isConnectionError = 
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('Connection lost')

      if (isConnectionError && attempt < retries) {
        console.warn(`⚠️ Error de conexión (intento ${attempt}/${retries}), reintentando...`)
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }

      // Si no es un error de conexión o ya agotamos reintentos, lanzar error
      break
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error('❌ Error después de todos los reintentos:', lastError)
  throw lastError
}

/**
 * Verificar salud de la conexión
 */
export async function checkConnection(): Promise<boolean> {
  const now = Date.now()
  
  // No verificar muy seguido para evitar overhead
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return true
  }

  try {
    await executeQuery(() => sql`SELECT 1`)
    lastConnectionCheck = now
    return true
  } catch (error) {
    console.error('❌ Verificación de conexión falló:', error)
    return false
  }
}

/**
 * Wrapper para sql con manejo de errores
 */
export async function querySafe<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  return executeQuery(async () => {
    const result = await sql(strings, ...values)
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0
    }
  })
}

/**
 * Obtener configuración de la base de datos
 */
export function getDatabaseConfig() {
  return {
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    hasPassword: !!process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV === 'production',
  }
}

/**
 * Verificar que las variables de entorno están configuradas
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'POSTGRES_HOST',
    'POSTGRES_DATABASE',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  return {
    valid: missing.length === 0,
    missing
  }
}

export { sql }
