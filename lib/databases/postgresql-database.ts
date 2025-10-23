import { DatabaseInterface, DatabaseConfig } from "../database-interface"
import bcrypt from "bcryptjs"

export class PostgreSQLDatabase implements DatabaseInterface {
  private client: any = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async consultarInvestigadoresIncompletos() {
    if (!this.client) {
      await this.conectar();
    }
    const result = await this.client.query(`
      SELECT id, no_cvu, curp, nombre_completo, rfc, correo, nacionalidad, fecha_nacimiento, institucion
      FROM investigadores
      WHERE curp = 'NO DETECTADO' OR curp = '' OR curp IS NULL
    `);
    return result.rows;
  }
  // ...existing code...

  async conectar(): Promise<void> {
    try {
      // Importar pg solo cuando se necesite
      const { Client } = await import('pg')
      
      this.client = new Client({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false
      })

      await this.client.connect()
      console.log('Conectado a PostgreSQL')
    } catch (error) {
      console.error('Error al conectar a PostgreSQL:', error)
      throw error
    }
  }

  async desconectar(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = null
    }
  }

  async inicializar(): Promise<void> {
    if (!this.client) {
      await this.conectar()
    }

    // Crear tabla investigadores en PostgreSQL
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS investigadores (
        id SERIAL PRIMARY KEY,
        curp VARCHAR(18),
        nombre_completo VARCHAR(255) NOT NULL,
        rfc VARCHAR(13),
        correo VARCHAR(255) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        no_cvu VARCHAR(20),
        orcid VARCHAR(20),
        nivel VARCHAR(50),
        area VARCHAR(255),
        institucion VARCHAR(255),
        nacionalidad VARCHAR(100),
        fecha_nacimiento DATE,
        grado_maximo_estudios VARCHAR(100),
        titulo_tesis TEXT,
        anio_grado INTEGER,
        pais_grado VARCHAR(100),
        disciplina VARCHAR(255),
        especialidad VARCHAR(255),
        linea_investigacion TEXT,
        sni VARCHAR(10),
        anio_sni INTEGER,
        cv_conacyt TEXT,
        experiencia_docente TEXT,
        experiencia_laboral TEXT,
        proyectos_investigacion TEXT,
        proyectos_vinculacion TEXT,
        patentes TEXT,
        productos_cientificos TEXT,
        productos_tecnologicos TEXT,
        productos_humanisticos TEXT,
        libros TEXT,
        capitulos_libros TEXT,
        articulos TEXT,
        revistas_indexadas TEXT,
        revistas_no_indexadas TEXT,
        memorias TEXT,
        ponencias TEXT,
        formacion_recursos TEXT,
        direccion_tesis TEXT,
        direccion_posgrados TEXT,
        evaluador_proyectos TEXT,
        miembro_comites TEXT,
        editor_revistas TEXT,
        premios_distinciones TEXT,
        estancias_academicas TEXT,
        idiomas TEXT,
        asociaciones_cientificas TEXT,
        gestion_academica TEXT,
        gestion_institucional TEXT,
        colaboracion_internacional TEXT,
        colaboracion_nacional TEXT,
        divulgacion_cientifica TEXT,
        otros_logros TEXT,
        vinculacion_sector_productivo TEXT,
        vinculacion_sector_social TEXT,
        vinculacion_sector_publico TEXT,
        participacion_politicas_publicas TEXT,
        impacto_social TEXT,
        propuesta_linea_trabajo TEXT,
        documentacion_completa TEXT,
        observaciones TEXT,
        genero VARCHAR(20),
        estado_nacimiento VARCHAR(100),
        municipio VARCHAR(100),
        domicilio TEXT,
        cp VARCHAR(10),
        entidad_federativa VARCHAR(100),
        cv_ligado_orcid TEXT,
        orcid_verificado BOOLEAN DEFAULT FALSE,
        clerk_user_id VARCHAR(255),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    try {
      await this.client.query(createTableQuery)
      console.log('Tabla investigadores creada o ya existente en PostgreSQL')
      
      // Agregar clerk_user_id si no existe (migración)
      try {
        await this.client.query(`
          ALTER TABLE investigadores 
          ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255)
        `)
        console.log('Columna clerk_user_id agregada o ya existente')
      } catch (alterError) {
        console.warn('No se pudo agregar clerk_user_id (posiblemente ya existe):', alterError)
      }
    } catch (error) {
      console.error('Error al crear tabla en PostgreSQL:', error)
      throw error
    }
  }

  async ejecutarMigracion(sql: string): Promise<void> {
    if (!this.client) {
      throw new Error('Base de datos no conectada')
    }
    
    try {
      await this.client.query(sql)
      console.log('Migración ejecutada exitosamente en PostgreSQL')
    } catch (error) {
      console.error('Error al ejecutar migración en PostgreSQL:', error)
      throw error
    }
  }

  async guardarInvestigador(datos: any) {
    try {
      if (!this.client) {
        await this.conectar()
      }

      console.log("==================================================")
      console.log("💾 GUARDANDO EN POSTGRESQL")
      console.log("==================================================")
      console.log('Datos completos recibidos:', JSON.stringify(datos, null, 2))
      console.log("==================================================")

      const curp = datos.curp?.trim() || ""
      const nombre = datos.nombre_completo?.trim() || ""
      const correo = datos.correo?.trim() || ""

      console.log("Valores extraídos:")
      console.log("- CURP:", curp || "(vacío)")
      console.log("- Nombre completo:", nombre || "(vacío)")
      console.log("- Correo:", correo || "(vacío)")
      console.log("- Clerk User ID:", datos.clerk_user_id || "(vacío)")

      // NOTA: Las verificaciones de duplicados ahora se manejan en Clerk
      // Solo verificamos CURP para evitar duplicados de documentos oficiales
      if (curp && curp !== "") {
        const existenteCurp = await this.client.query(
          'SELECT * FROM investigadores WHERE curp = $1',
          [curp]
        )
        if (existenteCurp.rows.length > 0) {
          console.log(`CURP duplicado encontrado: ${curp}`)
          return {
            success: false,
            message: `⚠️ El CURP ${curp} ya existe en el sistema. Si ya tienes cuenta, inicia sesión.`,
          }
        }
      }

      // NOTA: NO hashear password aquí - Clerk maneja la autenticación
      // Solo guardamos datos de perfil en PostgreSQL
      
      // Preparar los campos y valores para la inserción
      const campos = Object.keys(datos).filter((campo) => datos[campo] !== undefined)
      const placeholders = campos.map((_, index) => `$${index + 1}`).join(", ")
      const valores = campos.map((campo) => datos[campo])

      console.log("==================================================")
      console.log("🔧 CONSTRUYENDO QUERY SQL")
      console.log("==================================================")
      console.log('Campos a insertar:', campos)
      console.log('Número de campos:', campos.length)
      console.log('Placeholders:', placeholders)
      console.log('Valores:', valores)
      console.log("==================================================")

      // Construir la consulta SQL
      const query = `
        INSERT INTO investigadores (${campos.join(", ")})
        VALUES (${placeholders})
        RETURNING id
      `

      console.log("==================================================")
      console.log('📝 QUERY SQL FINAL:')
      console.log("==================================================")
      console.log(query)
      console.log("==================================================")

      console.log("🚀 Ejecutando INSERT...")

      // Ejecutar la consulta
      const result = await this.client.query(query, valores)
      
      console.log("==================================================")
      console.log("✅ INSERT EXITOSO!")
      console.log("==================================================")
      console.log('Resultado completo:', result)
      console.log('ID generado:', result.rows[0]?.id)
      console.log("==================================================")

      return {
        success: true,
        message: `✅ Registro exitoso para ${nombre}`,
        id: result.rows[0].id,
      }
    } catch (error) {
      console.error("==================================================")
      console.error('❌ ERROR AL GUARDAR EN POSTGRESQL')
      console.error("==================================================")
      console.error('Tipo de error:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('Mensaje:', error instanceof Error ? error.message : String(error))
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('Error completo:', error)
      console.error("==================================================")
      
      return {
        success: false,
        message: `❌ Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`,
        error,
      }
    }
  }

  async obtenerInvestigadores() {
    try {
      if (!this.client) {
        await this.conectar()
      }
      
      const result = await this.client.query('SELECT * FROM investigadores ORDER BY id')
      return result.rows
    } catch (error) {
      console.error('Error al obtener investigadores de PostgreSQL:', error)
      return []
    }
  }

  async obtenerInvestigadorPorId(id: number) {
    try {
      if (!this.client) {
        await this.conectar()
      }
      
      const result = await this.client.query('SELECT * FROM investigadores WHERE id = $1', [id])
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error al obtener investigador con ID ${id} de PostgreSQL:`, error)
      return null
    }
  }

  async verificarCredenciales(email: string, password: string) {
    try {
      if (!this.client) {
        await this.conectar()
      }
      
      // Buscar usuario por email
      const result = await this.client.query(
          'SELECT * FROM investigadores WHERE correo = $1',
        [email]
      )
      
      const usuario = result.rows[0]
        
        if (!usuario) {
          console.error('Usuario no encontrado:', email);
          return {
            success: false,
            message: "Usuario no encontrado"
          }
        }
        
        // Verificar hash de contraseña con bcryptjs
        const hash = usuario.password;
        if (!hash || typeof hash !== 'string') {
          console.error('Hash de contraseña no encontrado o inválido para el usuario:', email);
          return {
            success: false,
            message: "Hash de contraseña no encontrado o inválido"
          }
        }
        const valido = await bcrypt.compare(password, hash);
        if (!valido) {
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
            institucion: usuario.institucion
          }
        }

    } catch (error) {
      console.error('Error al verificar credenciales en PostgreSQL:', error)
      return {
        success: false,
        message: "Error interno del servidor"
      }
    }
  }

  async buscarInvestigadores(params: {
    termino: string
    limite?: number
  }): Promise<any[]> {
    try {
      const { termino, limite = 10 } = params
      const terminoBusqueda = `%${termino.toLowerCase()}%`
      
      const query = `
        SELECT id, nombre_completo as nombre, correo as email, institucion, area
        FROM investigadores 
        WHERE (
          LOWER(nombre_completo) LIKE $1 OR 
          LOWER(correo) LIKE $1 OR 
          LOWER(institucion) LIKE $1 OR
          LOWER(area) LIKE $1
        )
        ORDER BY nombre_completo ASC
        LIMIT $2
      `
      
      const result = await this.client.query(query, [terminoBusqueda, limite])
      return result.rows
    } catch (error) {
      console.error("Error al buscar investigadores:", error)
      return []
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      if (!this.client) {
        await this.conectar()
      }
      
      const result = await this.client.query(sql, params)
      return result.rows // Retornar solo el array de filas
    } catch (error: any) {
      // Solo loggear errores inesperados, no errores de tabla no existe
      if (error?.code !== '42P01') {
        console.error("Error al ejecutar query:", error)
      }
      throw error
    }
  }

  async obtenerProyectos(): Promise<any[]> {
    try {
      // Como no hay tabla de proyectos, devolver array vacío
      return []
    } catch (error) {
      console.error("Error al obtener proyectos:", error)
      return []
    }
  }

  async obtenerPublicaciones(): Promise<any[]> {
    try {
      const result = await this.client.query("SELECT * FROM publicaciones ORDER BY fecha_creacion DESC")
      return result.rows
    } catch (error) {
      console.error("Error al obtener publicaciones:", error)
      return []
    }
  }

  async insertarPublicacion(datos: any): Promise<{
    success: boolean
    message: string
    id?: number
    error?: any
  }> {
    try {
      const campos = Object.keys(datos).filter((campo) => datos[campo] !== undefined)
      const placeholders = campos.map((_, index) => `$${index + 1}`).join(", ")
      const valores = campos.map((campo) => datos[campo])

      const query = `
        INSERT INTO publicaciones (${campos.join(", ")})
        VALUES (${placeholders})
        RETURNING id
      `

      const result = await this.client.query(query, valores)
      
      return {
        success: true,
        message: "Publicación insertada exitosamente",
        id: result.rows[0]?.id
      }
    } catch (error) {
      console.error("Error al insertar publicación:", error)
      return {
        success: false,
        message: `Error al insertar publicación: ${error instanceof Error ? error.message : "Error desconocido"}`,
        error
      }
    }
  }
}
