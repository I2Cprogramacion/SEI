// Registro simple: crear usuario solo con correo y contraseña
import bcrypt from 'bcryptjs';
export async function crearUsuarioSimple(email: string, password: string) {
  const db = await getDatabase();
  // Verificar si ya existe
  const existentes = await db.obtenerInvestigadores();
  const existe = existentes.find((u: any) => u.correo === email);
  if (existe) return null;
  const hash = await bcrypt.hash(password, 10);
  // Guardar solo correo y contraseña, los demás campos nulos
  const datos = {
    correo: email,
    contrasena: hash,
    nombre_completo: null,
    curp: null,
    rfc: null,
    no_cvu: null,
    nacionalidad: null,
    fecha_nacimiento: null,
    institucion: null,
    nivel: null,
    area: null
  };
  const res = await db.guardarInvestigador(datos);
  if (res.success) {
    return { id: res.id, correo: email };
  }
  return null;
}
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
