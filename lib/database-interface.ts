// Interfaz abstracta para diferentes tipos de base de datos
export interface DatabaseInterface {
  // Métodos de investigadores
  guardarInvestigador(datos: any): Promise<{
    success: boolean
    message: string
    id?: number
    error?: any
  }>
  
  obtenerInvestigadores(): Promise<any[]>
  
  obtenerInvestigadorPorId(id: number): Promise<any | null>
  
  verificarCredenciales(email: string, password: string): Promise<{
    success: boolean
    message: string
    user?: any
  }>
  
  // Métodos de conexión
  conectar(): Promise<void>
  
  desconectar(): Promise<void>
  
  // Métodos de inicialización
  inicializar(): Promise<void>
  
  // Métodos de migración
  ejecutarMigracion(sql: string): Promise<void>

  // Consultar investigadores incompletos (sin CURP)
  consultarInvestigadoresIncompletos(): Promise<any[]>

  // Métodos para proyectos y publicaciones (opcional, según implementación)
  obtenerProyectos?(): Promise<any[]>
  obtenerPublicaciones?(): Promise<any[]>
  insertarPublicacion?(datos: any): Promise<any>
}

// Tipos de base de datos soportados
export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'vercelPostgres'

// Configuración de base de datos
export interface DatabaseConfig {
  type: DatabaseType
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  // filename?: string // Eliminado: solo para SQLite
  ssl?: boolean
  connectionString?: string
}

// Factory para crear instancias de base de datos
export class DatabaseFactory {
  static async create(config: DatabaseConfig): Promise<DatabaseInterface> {
    switch (config.type) {
      // case 'sqlite':
      //   const { SQLiteDatabase } = await import('./databases/sqlite-database')
      //   return new SQLiteDatabase(config)
        
      case 'postgresql':
      case 'vercelPostgres':
        const { PostgreSQLDatabase } = await import('./databases/postgresql-database')
        return new PostgreSQLDatabase(config)
        
      case 'mysql':
        throw new Error('MySQL no está implementado aún')
        
      case 'mongodb':
        throw new Error('MongoDB no está implementado aún')
        
      default:
        throw new Error(`Tipo de base de datos no soportado: ${config.type}`)
    }
  }
}

// Configuración por defecto
// export const defaultDatabaseConfig: DatabaseConfig = {
//   type: 'sqlite',
//   filename: 'database.db'
// }

// Configuración para diferentes entornos
export const databaseConfigs = {
  development: {
    postgresql: {
      type: 'postgresql' as const,
      host: 'localhost',
      port: 5432,
      database: 'researcher_platform_dev',
      username: 'postgres',
      password: 'password'
    }
  },
  
  production: {
    postgresql: {
      type: 'postgresql' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'researcher_platform',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: true
    }
  }
}
