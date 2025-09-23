import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"
import fs from "fs"
import { DatabaseInterface, DatabaseConfig } from "../database-interface"

export class SQLiteDatabase implements DatabaseInterface {
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
      "password",
      "is_admin",
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
      // Filtrar campos que no existen en la tabla
      const camposExistentes = [
        'id', 'curp', 'nombre_completo', 'rfc', 'correo', 'telefono', 'no_cvu', 'orcid',
        'nivel', 'area', 'institucion', 'nacionalidad', 'fecha_nacimiento', 'grado_maximo_estudios',
        'titulo_tesis', 'anio_grado', 'pais_grado', 'disciplina', 'especialidad', 'linea_investigacion',
        'sni', 'anio_sni', 'cv_conacyt', 'experiencia_docente', 'experiencia_laboral',
        'proyectos_investigacion', 'proyectos_vinculacion', 'patentes', 'productos_cientificos',
        'productos_tecnologicos', 'productos_humanisticos', 'libros', 'capitulos_libros',
        'articulos', 'revistas_indexadas', 'revistas_no_indexadas', 'memorias', 'ponencias',
        'formacion_recursos', 'direccion_tesis', 'direccion_posgrados', 'evaluador_proyectos',
        'miembro_comites', 'editor_revistas', 'premios_distinciones', 'estancias_academicas',
        'idiomas', 'asociaciones_cientificas', 'gestion_academica', 'gestion_institucional',
        'colaboracion_internacional', 'colaboracion_nacional', 'divulgacion_cientifica',
        'otros_logros', 'vinculacion_sector_productivo', 'vinculacion_sector_social',
        'vinculacion_sector_publico', 'participacion_politicas_publicas', 'impacto_social',
        'propuesta_linea_trabajo', 'documentacion_completa', 'observaciones', 'genero',
        'estado_nacimiento', 'municipio', 'domicilio', 'cp', 'entidad_federativa',
        'cv_ligado_orcid', 'orcid_verificado', 'fecha_registro', 'is_admin', 'password'
      ]
      
      const campos = Object.keys(datos).filter((campo) => 
        datos[campo] !== undefined && camposExistentes.includes(campo)
      )
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
        await this.conectar()
      }
      
      // Buscar usuario por email
      const usuario = await this.db.get("SELECT * FROM investigadores WHERE correo = ?", email)
      
      if (!usuario) {
        return {
          success: false,
          message: "Usuario no encontrado"
        }
      }

      // Verificar contraseña si existe
      if (usuario.password && usuario.password !== password) {
        return {
          success: false,
          message: "Contraseña incorrecta"
        }
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
          institucion: usuario.institucion,
          isAdmin: usuario.is_admin === 1 || usuario.is_admin === '1' || usuario.is_admin === true
        }
      }

    } catch (error) {
      console.error("Error al verificar credenciales:", error)
      return {
        success: false,
        message: "Error interno del servidor"
      }
    }
  }

  async obtenerProyectos() {
    try {
      // Obtener investigadores que tengan proyectos
      const result = await this.db.all(`
        SELECT 
          id,
          nombre_completo,
          institucion,
          proyectos_investigacion,
          articulos,
          libros,
          capitulos_libros,
          memorias,
          ponencias
        FROM investigadores 
        WHERE proyectos_investigacion IS NOT NULL 
        AND proyectos_investigacion != ''
        ORDER BY fecha_registro DESC
      `)
      
      const proyectos: any[] = []
      
      for (const investigador of result) {
        // Procesar proyectos de investigación
        if (investigador.proyectos_investigacion) {
          const proyectosTexto = investigador.proyectos_investigacion.split('\n').filter((p: string) => p.trim())
          proyectosTexto.forEach((proyectoTexto: string, index: number) => {
            if (proyectoTexto.trim()) {
              proyectos.push({
                id: `${investigador.id}_proyecto_${index}`,
                titulo: proyectoTexto.trim(),
                descripcion: proyectoTexto.trim(),
                autor: {
                  nombreCompleto: investigador.nombre_completo,
                  institucion: investigador.institucion,
                  estado: "Chihuahua"
                },
                institucion: investigador.institucion,
                categoria: "Investigación",
                fechaPublicacion: new Date().toISOString().split('T')[0],
                slug: `proyecto-${investigador.id}-${index}`
              })
            }
          })
        }
      }
      
      return { proyectos }
    } catch (error) {
      console.error('Error al obtener proyectos de SQLite:', error)
      return { proyectos: [] }
    }
  }

  async insertarPublicacion(datos: any) {
    try {
      if (!this.db) {
        await this.conectar()
      }

      // Crear tabla de publicaciones si no existe
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS publicaciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          autor TEXT NOT NULL,
          institucion TEXT NOT NULL,
          editorial TEXT NOT NULL,
          año_creacion INTEGER NOT NULL,
          doi TEXT,
          resumen TEXT,
          palabras_clave TEXT,
          categoria TEXT NOT NULL,
          tipo TEXT NOT NULL,
          acceso TEXT,
          volumen TEXT,
          numero TEXT,
          paginas TEXT,
          archivo TEXT,
          archivo_url TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Insertar la publicación
      const result = await this.db.run(`
        INSERT INTO publicaciones (
          titulo, autor, institucion, editorial, año_creacion, doi, resumen,
          palabras_clave, categoria, tipo, acceso, volumen, numero, paginas,
          archivo, archivo_url, fecha_creacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        datos.titulo,
        datos.autor,
        datos.institucion,
        datos.editorial,
        datos.año_creacion,
        datos.doi,
        datos.resumen,
        datos.palabras_clave,
        datos.categoria,
        datos.tipo,
        datos.acceso,
        datos.volumen,
        datos.numero,
        datos.paginas,
        datos.archivo,
        datos.archivo_url,
        datos.fecha_creacion
      ])

      return {
        success: true,
        message: "Publicación creada exitosamente",
        id: result.lastID
      }

    } catch (error) {
      console.error("Error al insertar publicación en SQLite:", error)
      return {
        success: false,
        message: "Error al crear la publicación",
        error: error
      }
    }
  }

  async obtenerPublicaciones() {
    try {
      if (!this.db) {
        await this.conectar()
      }

      // Verificar si la tabla existe
      const tableExists = await this.db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='publicaciones'
      `)

      if (!tableExists) {
        return []
      }

      // Obtener todas las publicaciones
      const result = await this.db.all(`
        SELECT * FROM publicaciones 
        ORDER BY fecha_creacion DESC
      `)

      return result.map((pub: any) => ({
        id: pub.id,
        titulo: pub.titulo,
        autor: pub.autor,
        institucion: pub.institucion,
        editorial: pub.editorial,
        año_creacion: pub.año_creacion,
        doi: pub.doi,
        resumen: pub.resumen,
        palabras_clave: pub.palabras_clave,
        categoria: pub.categoria,
        tipo: pub.tipo,
        acceso: pub.acceso,
        volumen: pub.volumen,
        numero: pub.numero,
        paginas: pub.paginas,
        archivo: pub.archivo,
        archivo_url: pub.archivo_url,
        fecha_creacion: pub.fecha_creacion
      }))

    } catch (error) {
      console.error("Error al obtener publicaciones de SQLite:", error)
      return []
    }
  }
}
