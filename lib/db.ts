// Consultar investigadores incompletos (sin CURP)
export async function consultarInvestigadoresIncompletos() {
  const db = await getDatabase();
  if (typeof db.consultarInvestigadoresIncompletos === 'function') {
    return await db.consultarInvestigadoresIncompletos();
  }
  throw new Error('Método consultarInvestigadoresIncompletos no implementado en la base de datos actual');
}
// Archivo de compatibilidad que mantiene las funciones existentes
// pero ahora usa el nuevo sistema de interfaz de base de datos

import { getDatabase } from './database-config'

// Función para inicializar la base de datos (mantiene compatibilidad)
export async function initDB() {
  const db = await getDatabase()
  await db.inicializar()
  return db
}

// Función para guardar investigador (mantiene compatibilidad)
export async function guardarInvestigador(datos: any) {
  const db = await getDatabase()
  return await db.guardarInvestigador(datos)
}

// Función para obtener todos los investigadores (mantiene compatibilidad)
export async function obtenerInvestigadores() {
  const db = await getDatabase()
  return await db.obtenerInvestigadores()
}

// Función para obtener un investigador por ID (mantiene compatibilidad)
export async function obtenerInvestigadorPorId(id: number) {
  const db = await getDatabase()
  return await db.obtenerInvestigadorPorId(id)
}

// Función para verificar credenciales (mantiene compatibilidad)
export async function verificarCredenciales(email: string, password: string) {
  const db = await getDatabase()
  return await db.verificarCredenciales(email, password)
}

// Exportar también las nuevas funciones para uso avanzado
export { getDatabase, updateDatabaseConfig, autoConfigureDatabase, useVercelPostgres, useSQLite } from './database-config'
export type { DatabaseInterface, DatabaseConfig } from './database-interface'
export { DatabaseFactory } from './database-interface'
