import { DatabaseConfig, DatabaseFactory } from './database-interface'

// Configuración de la base de datos actual
export const currentDatabaseConfig: DatabaseConfig = {
  type: 'vercelPostgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE || 'researcher_platform',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production'
}

// Función para obtener la instancia de base de datos configurada
export async function getDatabase() {
  return await DatabaseFactory.create(currentDatabaseConfig)
}

// Función para cambiar la configuración de base de datos en tiempo de ejecución
export function updateDatabaseConfig(newConfig: DatabaseConfig) {
  Object.assign(currentDatabaseConfig, newConfig)
    // (Eliminado log de actualización de config para reducir el rate limit)
}

// Función para cambiar automáticamente según el entorno
export function autoConfigureDatabase() {
  const env = process.env.NODE_ENV || 'development'
  
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
        // (Eliminado log de configuración para reducir el rate limit)
    } else {
        // (Eliminado log de advertencia para reducir el rate limit)
    }
  } else {
    // En desarrollo, usar SQLite por defecto
    const sqliteConfig: DatabaseConfig = {
      type: 'sqlite',
      filename: 'database.db'
    }
    updateDatabaseConfig(sqliteConfig)
      // (Eliminado log de configuración para reducir el rate limit)
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
