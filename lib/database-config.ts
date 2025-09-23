import { DatabaseConfig, DatabaseFactory } from './database-interface'

// Función para parsear DATABASE_URL
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432'),
      database: parsed.pathname.slice(1), // Remover el '/' inicial
      username: parsed.username,
      password: parsed.password,
      ssl: parsed.searchParams.get('sslmode') === 'require'
    }
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error)
    return null
  }
}

// Configuración de la base de datos actual
export const currentDatabaseConfig: DatabaseConfig = (() => {
  // FORZAR SQLite para desarrollo
  console.log('🔧 Configurando base de datos para usar SQLite...')
  return {
    type: 'sqlite',
    filename: 'database.db'
  }
})()

// Función para obtener la instancia de base de datos configurada
export async function getDatabase() {
  return await DatabaseFactory.create(currentDatabaseConfig)
}

// Función para cambiar la configuración de base de datos en tiempo de ejecución
export function updateDatabaseConfig(newConfig: DatabaseConfig) {
  Object.assign(currentDatabaseConfig, newConfig)
  console.log('Configuración de base de datos actualizada:', currentDatabaseConfig)
}

// Función para cambiar automáticamente según el entorno
export function autoConfigureDatabase() {
  const env = process.env.NODE_ENV || 'development'
  
  // Si existe DATABASE_URL, usarla (tanto en desarrollo como producción)
  if (process.env.DATABASE_URL) {
    const parsed = parseDatabaseUrl(process.env.DATABASE_URL)
    if (parsed) {
      const config: DatabaseConfig = {
        type: 'vercelPostgres',
        host: parsed.host,
        port: parsed.port,
        database: parsed.database,
        username: parsed.username,
        password: parsed.password,
        ssl: parsed.ssl
      }
      updateDatabaseConfig(config)
      console.log('✅ Configurado para usar DATABASE_URL:', parsed.host)
      return
    }
  }
  
  if (env === 'production') {
    // En producción, usar Vercel Postgres si está disponible
    if (process.env.POSTGRES_HOST && process.env.POSTGRES_DATABASE) {
      const vercelConfig: DatabaseConfig = {
        type: 'vercelPostgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DATABASE,
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        ssl: true
      }
      updateDatabaseConfig(vercelConfig)
      console.log('✅ Configurado para usar Vercel Postgres en producción')
    } else {
      console.log('⚠️ Variables de entorno de Vercel Postgres no encontradas')
    }
  } else {
    // En desarrollo, usar SQLite por defecto
    const sqliteConfig: DatabaseConfig = {
      type: 'sqlite',
      filename: 'database.db'
    }
    updateDatabaseConfig(sqliteConfig)
    console.log('✅ Configurado para usar SQLite en desarrollo')
  }
}

// Función para obtener la configuración actual como string
export function getCurrentConfigString(): string {
  return `${currentDatabaseConfig.type}${currentDatabaseConfig.host ? `@${currentDatabaseConfig.host}` : ''}${currentDatabaseConfig.database ? `/${currentDatabaseConfig.database}` : ''}`
}

// Función para verificar si Vercel Postgres está disponible
export function isVercelPostgresAvailable(): boolean {
  return !!(process.env.POSTGRES_HOST && process.env.POSTGRES_DATABASE && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD)
}

// Función para cambiar a Vercel Postgres
export function useVercelPostgres() {
  if (isVercelPostgresAvailable()) {
    const config: DatabaseConfig = {
      type: 'vercelPostgres',
      host: process.env.POSTGRES_HOST!,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DATABASE!,
      username: process.env.POSTGRES_USER!,
      password: process.env.POSTGRES_PASSWORD!,
      ssl: true
    }
    updateDatabaseConfig(config)
    return true
  }
  console.error('❌ Variables de entorno de Vercel Postgres no disponibles')
  return false
}

// Función para cambiar a SQLite
export function useSQLite() {
  const config: DatabaseConfig = {
    type: 'sqlite',
    filename: 'database.db'
  }
  updateDatabaseConfig(config)
  return true
}
