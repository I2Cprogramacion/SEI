// Archivo de compatibilidad que mantiene las funciones existentes
// pero ahora usa el nuevo sistema de interfaz de base de datos

import { getDatabase } from './database-config'
import bcrypt from 'bcryptjs'

// Registro simple: crear usuario solo con correo y contraseña
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

// Función para obtener proyectos (nueva)

export async function obtenerProyectos() {
  const db = await getDatabase();
  if (typeof db.obtenerProyectos === 'function') {
    return await db.obtenerProyectos();
  }
  throw new Error('Método obtenerProyectos no implementado en la base de datos actual');
}

// Función para obtener publicaciones (nueva)

export async function obtenerPublicaciones() {
  const db = await getDatabase();
  if (typeof db.obtenerPublicaciones === 'function') {
    return await db.obtenerPublicaciones();
  }
  throw new Error('Método obtenerPublicaciones no implementado en la base de datos actual');
}

// Función para insertar publicación (nueva)

export async function insertarPublicacion(datos: any) {
  const db = await getDatabase();
  if (typeof db.insertarPublicacion === 'function') {
    return await db.insertarPublicacion(datos);
  }
  throw new Error('Método insertarPublicacion no implementado en la base de datos actual');
}

// ============================================================
// FUNCIONES PARA GESTIÓN DE REGISTROS PENDIENTES
// ============================================================

export async function guardarRegistroPendiente(clerkUserId: string, correo: string, datosRegistro: any) {
  const db = await getDatabase();
  if (typeof db.guardarRegistroPendiente === 'function') {
    return await db.guardarRegistroPendiente(clerkUserId, correo, datosRegistro);
  }
  throw new Error('Método guardarRegistroPendiente no implementado en la base de datos actual');
}

export async function obtenerRegistroPendiente(clerkUserId: string) {
  const db = await getDatabase();
  if (typeof db.obtenerRegistroPendiente === 'function') {
    return await db.obtenerRegistroPendiente(clerkUserId);
  }
  throw new Error('Método obtenerRegistroPendiente no implementado en la base de datos actual');
}

export async function eliminarRegistroPendiente(clerkUserId: string) {
  const db = await getDatabase();
  if (typeof db.eliminarRegistroPendiente === 'function') {
    return await db.eliminarRegistroPendiente(clerkUserId);
  }
  throw new Error('Método eliminarRegistroPendiente no implementado en la base de datos actual');
}

export async function limpiarRegistrosExpirados() {
  const db = await getDatabase();
  if (typeof db.limpiarRegistrosExpirados === 'function') {
    return await db.limpiarRegistrosExpirados();
  }
  throw new Error('Método limpiarRegistrosExpirados no implementado en la base de datos actual');
}

export async function obtenerEstadisticasRegistrosPendientes() {
  const db = await getDatabase();
  if (typeof db.obtenerEstadisticasRegistrosPendientes === 'function') {
    return await db.obtenerEstadisticasRegistrosPendientes();
  }
  throw new Error('Método obtenerEstadisticasRegistrosPendientes no implementado en la base de datos actual');
}

// Exportar también las nuevas funciones para uso avanzado
export { getDatabase } from './database-config'
export type { DatabaseInterface, DatabaseConfig } from './database-interface'
export { DatabaseFactory } from './database-interface'
