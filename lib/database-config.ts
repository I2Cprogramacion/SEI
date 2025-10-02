import { DatabaseConfig, DatabaseFactory } from './database-interface'

// Configuración fija para Neon de I2C (usa DATABASE_URL)
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

const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl) throw new Error('DATABASE_URL no definida');
export const currentDatabaseConfig: DatabaseConfig = parseDatabaseUrl(dbUrl);

// Usa Neon de I2C
export async function getDatabase() {
  return await DatabaseFactory.create(currentDatabaseConfig)
}

// (Opcional) Para debug
export function getCurrentConfigString(): string {
  return `${currentDatabaseConfig.type}@${currentDatabaseConfig.host}/${currentDatabaseConfig.database}`
}


