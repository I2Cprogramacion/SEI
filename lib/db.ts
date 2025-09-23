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
  // Asegurar que el esquema esté inicializado/migrado antes de operar
  try {
    await db.inicializar()
  } catch (e) {
    console.warn('Aviso: no se pudo inicializar antes de guardar (continuando):', e)
  }
  return await db.guardarInvestigador(datos)
}

// Función para obtener todos los investigadores (mantiene compatibilidad)
export async function obtenerInvestigadores() {
  const db = await getDatabase()
  try {
    await db.inicializar()
  } catch {}
  return await db.obtenerInvestigadores()
}

// Función para obtener un investigador por ID (mantiene compatibilidad)
export async function obtenerInvestigadorPorId(id: number) {
  const db = await getDatabase()
  try {
    await db.inicializar()
  } catch {}
  return await db.obtenerInvestigadorPorId(id)
}

// Función para verificar credenciales (mantiene compatibilidad)
export async function verificarCredenciales(email: string, password: string) {
  const db = await getDatabase()
  try {
    await db.inicializar()
  } catch {}
  return await db.verificarCredenciales(email, password)
}

// Función para obtener proyectos (extraídos del campo proyectos_investigacion)
export async function obtenerProyectos() {
  const db = await getDatabase()
  try {
    await db.inicializar()
  } catch {}
  return await db.obtenerProyectos()
}

// Función para insertar una nueva publicación
export async function insertarPublicacion(datos: any) {
  const db = await getDatabase()
  try {
    await db.inicializar()
  } catch {}
  return await db.insertarPublicacion(datos)
}

// Función para obtener todas las publicaciones
export async function obtenerPublicaciones() {
  const db = await getDatabase()
  try {
    await db.inicializar()
  } catch {}
  return await db.obtenerPublicaciones()
}

// Exportar también las nuevas funciones para uso avanzado
export { getDatabase, updateDatabaseConfig, autoConfigureDatabase, useVercelPostgres, useSQLite } from './database-config'
export type { DatabaseInterface, DatabaseConfig } from './database-interface'
export { DatabaseFactory } from './database-interface'
