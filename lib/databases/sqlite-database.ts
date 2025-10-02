import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"
import fs from "fs"
import { DatabaseInterface, DatabaseConfig } from "../database-interface"

export class SQLiteDatabase implements DatabaseInterface {
  async consultarInvestigadoresIncompletos() {
    if (!this.db) {
      await this.conectar();
    }
    const investigadores = await this.db.all(`
      SELECT id, no_cvu, curp, nombre_completo, rfc, correo, nacionalidad, fecha_nacimiento, institucion
      FROM investigadores
      WHERE curp = 'NO DETECTADO' OR curp = '' OR curp IS NULL
    `);
    return investigadores;
  }
  private db: any = null
  private config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  async conectar(): Promise<void> {
    const dbPath = path.join(process.cwd(), this.config.filename || "database.db")
    
    // Verificar si el directorio existe, si no, crearlo
    const dbDir = path.dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    console.log(`Conectando a SQLite: ${dbPath}`)
    
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  }

  async desconectar(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }

  async inicializar(): Promise<void> {
    if (!this.db) {
      await this.conectar()
    }

    // Definir los campos de la tabla investigadores
    const campos = [
      "curp",
      "nombre_completo",
      "rfc",
      "correo",
      "telefono",
      "no_cvu",
      "orcid",
      "nivel",
      "area",
      "institucion",
      "nacionalidad",
      "fecha_nacimiento",
      "grado_maximo_estudios",
      "titulo_tesis",
      "anio_grado",
      "pais_grado",
      "disciplina",
      "especialidad",
      "linea_investigacion",
      "sni",
      "anio_sni",
      "cv_conacyt",
      "experiencia_docente",
      "experiencia_laboral",
      "proyectos_investigacion",
      "proyectos_vinculacion",
      "patentes",
      "productos_cientificos",
      "productos_tecnologicos",
      "productos_humanisticos",
      "libros",
      "capitulos_libros",
      "articulos",
      "revistas_indexadas",
      "revistas_no_indexadas",
      "memorias",
      "ponencias",
      "formacion_recursos",
      "direccion_tesis",
      "direccion_posgrados",
      "evaluador_proyectos",
      "miembro_comites",
      "editor_revistas",
      "premios_distinciones",
      "estancias_academicas",
      "idiomas",
      "asociaciones_cientificas",
      "gestion_academica",
      "gestion_institucional",
      "colaboracion_internacional",
      "colaboracion_nacional",
      "divulgacion_cientifica",
      "otros_logros",
      "vinculacion_sector_productivo",
      "vinculacion_sector_social",
      "vinculacion_sector_publico",
      "participacion_politicas_publicas",
      "impacto_social",
      "propuesta_linea_trabajo",
      "documentacion_completa",
      "observaciones",
      "genero",
      "estado_nacimiento",
      "municipio",
      "domicilio",
      "cp",
      "entidad_federativa",
      "cv_ligado_orcid",
      "orcid_verificado",
      "fecha_registro",
    ]

    // Crear la tabla si no existe
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS investigadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${campos.map((campo) => `${campo} TEXT`).join(", ")}
      )
    `

    try {
      await this.db.exec(createTableQuery)
      console.log("Tabla 'investigadores' creada o ya existente")
    } catch (error) {
      console.error("Error al crear la tabla:", error)
      throw error
    }
  }

  async ejecutarMigracion(sql: string): Promise<void> {
    if (!this.db) {
      throw new Error("Base de datos no conectada")
    }
    
    try {
      await this.db.exec(sql)
      console.log("Migración ejecutada exitosamente")
    } catch (error) {
      console.error("Error al ejecutar migración:", error)
      throw error
    }
  }

  async guardarInvestigador(datos: any) {
    try {
      if (!this.db) {
        await this.conectar()
      }

      console.log("Guardando investigador en SQLite:", datos)

      const curp = datos.curp?.trim() || ""
      const nombre = datos.nombre_completo?.trim() || ""
      const correo = datos.correo?.trim() || ""

      // Verificar duplicados por CURP si está disponible
      if (curp && curp !== "") {
        const existenteCurp = await this.db.get("SELECT * FROM investigadores WHERE curp = ?", curp)
        if (existenteCurp) {
          console.log(`CURP duplicado encontrado: ${curp}`)
          return {
            success: false,
            message: `❌ El CURP ${curp} ya está registrado.`,
            id: existenteCurp.id,
          }
        }
      }

      // Verificar duplicados por correo electrónico
      if (correo && correo !== "") {
        const existenteCorreo = await this.db.get("SELECT * FROM investigadores WHERE correo = ?", correo)
        if (existenteCorreo) {
          console.log(`Correo duplicado encontrado: ${correo}`)
          return {
            success: false,
            message: `❌ El correo electrónico ${correo} ya está registrado.`,
            id: existenteCorreo.id,
          }
        }
      }

      // Verificar duplicados por nombre si no hay CURP
      if (!curp || curp === "") {
        const existenteNombre = await this.db.get("SELECT * FROM investigadores WHERE nombre_completo = ?", nombre)
        if (existenteNombre) {
          console.log(`Nombre duplicado encontrado: ${nombre}`)
          return {
            success: false,
            message: `⚠️ El nombre ${nombre} ya está registrado. Verifica si es un duplicado.`,
            id: existenteNombre.id,
          }
        }
      }

      // Preparar los campos y valores para la inserción
      const campos = Object.keys(datos).filter((campo) => datos[campo] !== undefined)
      const placeholders = campos.map(() => "?").join(", ")
      const valores = campos.map((campo) => datos[campo])

      // Construir la consulta SQL
      const query = `
        INSERT INTO investigadores (${campos.join(", ")})
        VALUES (${placeholders})
      `

      console.log("Query SQL:", query)
      console.log("Valores:", valores)

      // Ejecutar la consulta
      const result = await this.db.run(query, valores)
      console.log("Resultado de la inserción:", result)

      return {
        success: true,
        message: `✅ Registro exitoso para ${nombre}`,
        id: result.lastID,
      }
    } catch (error) {
      console.error("Error al guardar investigador:", error)
      return {
        success: false,
        message: `❌ Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`,
        error,
      }
    }
  }

  async obtenerInvestigadores() {
    try {
      if (!this.db) {
        await this.conectar()
      }
      
      const investigadores = await this.db.all("SELECT * FROM investigadores")
      return investigadores
    } catch (error) {
      console.error("Error al obtener investigadores:", error)
      return []
    }
  }

  async obtenerInvestigadorPorId(id: number) {
    try {
      if (!this.db) {
        await this.conectar()
      }
      
      const investigador = await this.db.get("SELECT * FROM investigadores WHERE id = ?", id)
      return investigador
    } catch (error) {
      console.error(`Error al obtener investigador con ID ${id}:`, error)
      return null
    }
  }

  async verificarCredenciales(email: string, password: string) {
    try {
      if (!this.db) {
        await this.conectar();
      }
      // Buscar usuario por email
      const usuario = await this.db.get("SELECT * FROM investigadores WHERE correo = ?", email);
      if (!usuario) {
        return {
          success: false,
          message: "Usuario no encontrado"
        };
      }
      // Validar contraseña con bcrypt
      const bcrypt = require('bcryptjs');
      const hash = usuario.contrasena;
      const ok = await bcrypt.compare(password, hash);
      if (!ok) {
        return {
          success: false,
          message: "Contraseña incorrecta"
        };
      }
      // Login exitoso
      return {
        success: true,
        message: "Login exitoso",
        user: {
          id: usuario.id,
          nombre: usuario.nombre_completo,
          email: usuario.correo,
          nivel: usuario.nivel,
          area: usuario.area,
          institucion: usuario.institucion
        }
      };
    } catch (error) {
      console.error("Error al verificar credenciales:", error);
      return {
        success: false,
        message: "Error interno del servidor"
      };
    }
  }
}
