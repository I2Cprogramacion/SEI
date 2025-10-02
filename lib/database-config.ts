import { DatabaseConfig, DatabaseFactory } from './database-interface'

// Configuración fija para Neon de Daron (usa DATABASE_URL)
const parseDatabaseUrl = (url: string): DatabaseConfig => {
  // Ejemplo: postgresql://user:pass@host:port/db?sslmode=require
  const regex = /postgresql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*?)\?/;
  const match = url.match(regex);
  if (!match) throw new Error('DATABASE_URL inválida');
  return {
    type: 'vercelPostgres',
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    username: match[1],
    password: match[2],
    ssl: true
  };
};

const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl) throw new Error('DATABASE_URL no definida');
export const currentDatabaseConfig: DatabaseConfig = parseDatabaseUrl(dbUrl);

// Siempre usa Neon de Daron
export async function getDatabase() {
  return await DatabaseFactory.create(currentDatabaseConfig)
}

// (Opcional) Para debug
export function getCurrentConfigString(): string {
  return `${currentDatabaseConfig.type}@${currentDatabaseConfig.host}/${currentDatabaseConfig.database}`
}

// Limpieza: Eliminar funciones y referencias obsoletas
// - updateDatabaseConfig
// - autoConfigureDatabase
// Ya no se usan, toda la lógica es Neon fija.

