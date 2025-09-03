import { DatabaseInterface, DatabaseConfig } from "../database-interface"

// NOTA: Esta es una implementación de ejemplo
// Para usar PostgreSQL, necesitarás instalar: npm install pg @types/pg
export class PostgreSQLDatabase implements DatabaseInterface {
  private client: any = null
  private config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
  }

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
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    try {
      await this.client.query(createTableQuery)
      console.log('Tabla investigadores creada o ya existente en PostgreSQL')
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

      console.log('Guardando investigador en PostgreSQL:', datos)

      const curp = datos.curp?.trim() || ""
      const nombre = datos.nombre_completo?.trim() || ""
      const correo = datos.correo?.trim() || ""

      // Verificar duplicados por CURP si está disponible
      if (curp && curp !== "") {
        const existenteCurp = await this.client.query(
          'SELECT * FROM investigadores WHERE curp = $1',
          [curp]
        )
        if (existenteCurp.rows.length > 0) {
          console.log(`CURP duplicado encontrado: ${curp}`)
          return {
            success: false,
            message: `❌ El CURP ${curp} ya está registrado.`,
            id: existenteCurp.rows[0].id,
          }
        }
      }

      // Verificar duplicados por correo electrónico
      if (correo && correo !== "") {
        const existenteCorreo = await this.client.query(
          'SELECT * FROM investigadores WHERE correo = $1',
          [correo]
        )
        if (existenteCorreo.rows.length > 0) {
          console.log(`Correo duplicado encontrado: ${correo}`)
          return {
            success: false,
            message: `❌ El correo electrónico ${correo} ya está registrado.`,
            id: existenteCorreo.rows[0].id,
          }
        }
      }

      // Verificar duplicados por nombre si no hay CURP
      if (!curp || curp === "") {
        const existenteNombre = await this.client.query(
          'SELECT * FROM investigadores WHERE nombre_completo = $1',
          [nombre]
        )
        if (existenteNombre.rows.length > 0) {
          console.log(`Nombre duplicado encontrado: ${nombre}`)
          return {
            success: false,
            message: `⚠️ El nombre ${nombre} ya está registrado. Verifica si es un duplicado.`,
            id: existenteNombre.rows[0].id,
          }
        }
      }

      // Preparar los campos y valores para la inserción
      const campos = Object.keys(datos).filter((campo) => datos[campo] !== undefined)
      const placeholders = campos.map((_, index) => `$${index + 1}`).join(", ")
      const valores = campos.map((campo) => datos[campo])

      // Construir la consulta SQL
      const query = `
        INSERT INTO investigadores (${campos.join(", ")})
        VALUES (${placeholders})
        RETURNING id
      `

      console.log('Query SQL:', query)
      console.log('Valores:', valores)

      // Ejecutar la consulta
      const result = await this.client.query(query, valores)
      console.log('Resultado de la inserción:', result)

      return {
        success: true,
        message: `✅ Registro exitoso para ${nombre}`,
        id: result.rows[0].id,
      }
    } catch (error) {
      console.error('Error al guardar investigador en PostgreSQL:', error)
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
        return {
          success: false,
          message: "Usuario no encontrado"
        }
      }

      // Por ahora, verificamos solo que el usuario exista
      // En una implementación real, deberías verificar la contraseña hasheada
      
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
}
