import { sql } from '@vercel/postgres';

// Configuración para Vercel Postgres
export const vercelPostgresConfig = {
  // Estas variables se configuran automáticamente en Vercel
  // cuando creas una base de datos Postgres
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || '5432',
  database: process.env.POSTGRES_DATABASE,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production',
};

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Conexión a Vercel Postgres exitosa:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Vercel Postgres:', error);
    return false;
  }
}

// Función para obtener la instancia de sql
export function getVercelPostgres() {
  return sql;
}

// Función para verificar si las variables de entorno están configuradas
export function checkEnvironmentVariables() {
  const required = ['POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes para Vercel Postgres:', missing);
    return false;
  }
  
  return true;
}
