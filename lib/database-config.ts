import { DatabaseConfig, DatabaseFactory } from './database-interface'

// Configuración fija para Neon de I2C (usa DATABASE_URL_UNPOOLED para Vercel)
const parseDatabaseUrl = (url: string): DatabaseConfig => {
  try {
    const u = new URL(url);
    return {
      type: 'vercelPostgres',
      host: u.hostname,
      port: parseInt(u.port || '5432'),
      database: u.pathname.replace(/^\//, ''),
      username: u.username,
      password: u.password,
      ssl: true
    };
  } catch {
    throw new Error('DATABASE_URL inválida');
  }
};

// ✅ LAZY LOADING: No parsear en compile-time, solo cuando se use
let parsedConfig: DatabaseConfig | null = null;

export function getCurrentDatabaseConfig(): DatabaseConfig {
  if (parsedConfig) return parsedConfig;
  
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
  if (!dbUrl) throw new Error('DATABASE_URL_UNPOOLED o DATABASE_URL no definida');
  
  parsedConfig = parseDatabaseUrl(dbUrl);
  return parsedConfig;
}

// Usa Neon de I2C
let dbInstance: any = null;

export async function getDatabase() {
  // Siempre usar la configuración de DATABASE_URL_UNPOOLED (PostgreSQL/Neon en Vercel)
  const config = getCurrentDatabaseConfig();
  if (!dbInstance) {
    dbInstance = await DatabaseFactory.create(config)
    // ✅ CRÍTICO: Inicializar la base de datos (crea tablas si no existen)
    await dbInstance.inicializar()
  }
  return dbInstance
}

// (Opcional) Para debug
export function getCurrentConfigString(): string {
  const config = getCurrentDatabaseConfig();
  return `${config.type}@${config.host}/${config.database}`;
}
