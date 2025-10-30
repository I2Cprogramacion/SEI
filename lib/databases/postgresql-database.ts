import { DatabaseInterface, DatabaseConfig } from "../database-interface"
import bcrypt from "bcryptjs"

export class PostgreSQLDatabase implements DatabaseInterface {
  private client: any = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async consultarInvestigadoresIncompletos(): Promise<any[]> {
    try {
      if (!this.client) {
        await this.conectar();
      }
      const result = await this.client.query(`
        SELECT id, no_cvu, curp, nombre_completo, rfc, correo, clerk_user_id, nacionalidad, fecha_nacimiento, institucion
        FROM investigadores
        WHERE curp = 'NO DETECTADO' OR curp = '' OR curp IS NULL
      `);
      return result.rows;
    } catch (error) {
      return [];
    }
  }
  // ...existing code...

  async conectar(): Promise<void> {
    try {
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
    } catch (error) {
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
      try {
        await this.client.query(`
          ALTER TABLE investigadores 
          ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255)
        `)
      } catch (alterError) {
      }
      
      // Agregar nuevos campos
      try {
        await this.client.query(`
          ALTER TABLE investigadores 
          ADD COLUMN IF NOT EXISTS genero VARCHAR(50),
          ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(20) DEFAULT 'INVESTIGADOR',
          ADD COLUMN IF NOT EXISTS nivel_investigador VARCHAR(100),
          ADD COLUMN IF NOT EXISTS nivel_tecnologo VARCHAR(100),
          ADD COLUMN IF NOT EXISTS municipio VARCHAR(100)
        `)
        console.log('✅ Columnas genero, tipo_perfil, nivel_investigador, nivel_tecnologo y municipio agregadas/verificadas')
      } catch (alterError) {
        console.log('⚠️ Error al agregar columnas nuevas (posiblemente ya existen):', alterError)
      }
    } catch (error) {
      throw error
    }
  }

  async ejecutarMigracion(sql: string): Promise<void> {
    if (!this.client) {
      throw new Error('Base de datos no conectada')
    }
    try {
      await this.client.query(sql)
    } catch (error) {
      throw error
    }
  }

  async guardarInvestigador(datos: any) {
    try {
      if (!this.client) {
        await this.conectar()
      }

      console.log("💾 ========== GUARDANDO INVESTIGADOR ==========")
      console.log("Datos recibidos:", JSON.stringify(datos, null, 2))

      // Verificar duplicados por CURP (solo si tiene valor)
      const curp = datos.curp?.trim() || null
      if (curp) {
        const existenteCurp = await this.client.query(
          'SELECT id FROM investigadores WHERE curp = $1',
          [curp]
        )
        if (existenteCurp.rows.length > 0) {
          console.log("❌ CURP ya existe:", curp)
          return {
            success: false,
            message: `⚠️ El CURP ${curp} ya existe en el sistema.`,
          }
        }
      }

      // MAPEO COMPLETO: datos recibidos → columnas de BD
      // Solo incluimos campos que existen en la tabla investigadores
      const camposBD: Record<string, any> = {}

      // Campos obligatorios
      camposBD.nombre_completo = datos.nombre_completo?.trim() || 
        `${datos.nombres || ''} ${datos.apellidos || ''}`.trim() || 
        'Sin Nombre'

      // Campos de identificación
      if (datos.user_id) camposBD.user_id = datos.user_id
      if (datos.clerk_user_id) camposBD.clerk_user_id = datos.clerk_user_id
      if (datos.slug) camposBD.slug = datos.slug
      if (datos.nombres) camposBD.nombres = datos.nombres
      if (datos.apellidos) camposBD.apellidos = datos.apellidos
      if (curp) camposBD.curp = curp
      if (datos.rfc) camposBD.rfc = datos.rfc
      if (datos.no_cvu) camposBD.no_cvu = datos.no_cvu
      if (datos.correo) camposBD.correo = datos.correo
      if (datos.telefono) camposBD.telefono = datos.telefono
      if (datos.fotografia_url) camposBD.fotografia_url = datos.fotografia_url
      
      // Campos demográficos
      camposBD.nacionalidad = datos.nacionalidad || 'Mexicana'
      if (datos.fecha_nacimiento) camposBD.fecha_nacimiento = datos.fecha_nacimiento
      if (datos.genero) camposBD.genero = datos.genero
      if (datos.municipio) camposBD.municipio = datos.municipio
      if (datos.estado_nacimiento) camposBD.estado_nacimiento = datos.estado_nacimiento
      if (datos.entidad_federativa) camposBD.entidad_federativa = datos.entidad_federativa
      
      // Institución
      if (datos.institucion_id) camposBD.institucion_id = datos.institucion_id
      if (datos.institucion) camposBD.institucion = datos.institucion
      if (datos.departamento) camposBD.departamento = datos.departamento
      if (datos.ubicacion) camposBD.ubicacion = datos.ubicacion
      if (datos.sitio_web) camposBD.sitio_web = datos.sitio_web
      
      // Sistema
      if (datos.origen) camposBD.origen = datos.origen
      if (datos.archivo_procesado) camposBD.archivo_procesado = datos.archivo_procesado
      if (datos.fecha_registro) camposBD.fecha_registro = datos.fecha_registro
      camposBD.es_admin = datos.es_admin !== undefined ? datos.es_admin : false
      camposBD.activo = datos.activo !== undefined ? datos.activo : true
      
      // Académico y profesional
      if (datos.ultimo_grado_estudios) camposBD.ultimo_grado_estudios = datos.ultimo_grado_estudios
      if (datos.grado_maximo_estudios) camposBD.grado_maximo_estudios = datos.grado_maximo_estudios
      if (datos.empleo_actual) camposBD.empleo_actual = datos.empleo_actual
      if (datos.linea_investigacion) camposBD.linea_investigacion = datos.linea_investigacion
      if (datos.area_investigacion) camposBD.area_investigacion = datos.area_investigacion
      if (datos.disciplina) camposBD.disciplina = datos.disciplina
      if (datos.especialidad) camposBD.especialidad = datos.especialidad
      if (datos.orcid) camposBD.orcid = datos.orcid
      if (datos.nivel) camposBD.nivel = datos.nivel
      if (datos.nivel_investigador) camposBD.nivel_investigador = datos.nivel_investigador
      if (datos.nivel_actual_id) camposBD.nivel_actual_id = datos.nivel_actual_id
      if (datos.fecha_asignacion_nivel) camposBD.fecha_asignacion_nivel = datos.fecha_asignacion_nivel
      if (datos.puntaje_total !== undefined) camposBD.puntaje_total = datos.puntaje_total
      if (datos.estado_evaluacion) camposBD.estado_evaluacion = datos.estado_evaluacion
      
      // Producción académica
      if (datos.articulos) camposBD.articulos = datos.articulos
      if (datos.libros) camposBD.libros = datos.libros
      if (datos.capitulos_libros) camposBD.capitulos_libros = datos.capitulos_libros
      if (datos.proyectos_investigacion) camposBD.proyectos_investigacion = datos.proyectos_investigacion
      if (datos.proyectos_vinculacion) camposBD.proyectos_vinculacion = datos.proyectos_vinculacion
      if (datos.experiencia_docente) camposBD.experiencia_docente = datos.experiencia_docente
      if (datos.experiencia_laboral) camposBD.experiencia_laboral = datos.experiencia_laboral
      if (datos.premios_distinciones) camposBD.premios_distinciones = datos.premios_distinciones
      if (datos.idiomas) camposBD.idiomas = datos.idiomas
      if (datos.colaboracion_internacional) camposBD.colaboracion_internacional = datos.colaboracion_internacional
      if (datos.colaboracion_nacional) camposBD.colaboracion_nacional = datos.colaboracion_nacional
      if (datos.sni) camposBD.sni = datos.sni
      if (datos.anio_sni) camposBD.anio_sni = datos.anio_sni
      if (datos.cv_url) camposBD.cv_url = datos.cv_url
      
      // Tipo de perfil y nivel tecnólogo
      camposBD.tipo_perfil = datos.tipo_perfil || 'INVESTIGADOR'
      if (datos.nivel_tecnologo_id) camposBD.nivel_tecnologo_id = datos.nivel_tecnologo_id
      if (datos.nivel_tecnologo) camposBD.nivel_tecnologo = datos.nivel_tecnologo

      // Construir arrays de campos y valores (SIN el ID, se genera automáticamente)
      const campos: string[] = []
      const valores: any[] = []
      
      for (const [campo, valor] of Object.entries(camposBD)) {
        if (valor !== null && valor !== undefined) {
          campos.push(campo)
          valores.push(valor)
        }
      }

      console.log("📋 Campos a insertar:", campos)
      console.log("📋 Total de campos:", campos.length)

      // Generar placeholders ($1, $2, $3, ...)
      const placeholders = campos.map((_, index) => `$${index + 1}`).join(", ")

      // Construir la consulta SQL (el ID se genera automáticamente)
      const query = `
        INSERT INTO investigadores (${campos.join(", ")}) 
        VALUES (${placeholders}) 
        RETURNING id, nombre_completo, correo, clerk_user_id
      `

      console.log("🔧 Ejecutando INSERT...")

      // Ejecutar la consulta
      const result = await this.client.query(query, valores)

      console.log("✅ REGISTRO EXITOSO:")
      console.log("   - ID:", result.rows[0].id)
      console.log("   - Nombre:", result.rows[0].nombre_completo)
      console.log("   - Correo:", result.rows[0].correo)
      console.log("   - Clerk User ID:", result.rows[0].clerk_user_id)
      console.log("===============================================")

      return {
        success: true,
        message: `Registro exitoso para ${result.rows[0].nombre_completo}`,
        id: result.rows[0].id,
      }
    } catch (error: any) {
      console.error("❌ ========== ERROR AL GUARDAR ==========")
      console.error("Error completo:", error)
      console.error("Código de error:", error.code)
      console.error("Detalle:", error.detail)
      console.error("Constraint:", error.constraint)
      console.error("========================================")

      // Manejo de errores específicos de PostgreSQL
      if (error.code === '23505') {
        // Unique violation
        const constraint = error.constraint || 'desconocido'
        let campo = 'dato'
        if (constraint.includes('curp')) campo = 'CURP'
        else if (constraint.includes('correo')) campo = 'correo'
        else if (constraint.includes('clerk')) campo = 'usuario'
        
        return {
          success: false,
          message: `Ya existe un registro con ese ${campo}.`,
        }
      }
      
      if (error.code === '23502') {
        // Not null violation
        return {
          success: false,
          message: `Falta un campo obligatorio: ${error.column || 'desconocido'}`,
        }
      }

      if (error.code === '42703') {
        // Undefined column
        return {
          success: false,
          message: `Error de configuración: columna no existe - ${error.message}`,
        }
      }

      return {
        success: false,
        message: `Error al guardar: ${error.message}`,
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
      return null
    }
  }

  async verificarCredenciales(email: string, password: string) {
    try {
      if (!this.client) {
        await this.conectar()
      }
      const result = await this.client.query(
        'SELECT * FROM investigadores WHERE clerk_user_id = $1 OR correo = $2',
        [email, email]
      )
      const usuario = result.rows[0]
        if (!usuario) {
          return {
            success: false,
            message: "Usuario no encontrado"
          }
        }
        const hash = usuario.password;
        if (!hash || typeof hash !== 'string') {
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
      const query = `SELECT id, nombre_completo as nombre, nombre_completo as nombreCompleto, correo as email, clerk_user_id, COALESCE(institucion, empleo_actual) as institucion, COALESCE(area, area_investigacion) as area, slug, fotografia_url, area_investigacion, linea_investigacion, empleo_actual, nombres, apellidos FROM investigadores WHERE (LOWER(nombre_completo) LIKE $1 OR LOWER(nombres) LIKE $1 OR LOWER(apellidos) LIKE $1 OR LOWER(correo) LIKE $1 OR LOWER(clerk_user_id) LIKE $1 OR LOWER(institucion) LIKE $1 OR LOWER(empleo_actual) LIKE $1 OR LOWER(area) LIKE $1 OR LOWER(area_investigacion) LIKE $1 OR LOWER(linea_investigacion) LIKE $1) AND nombre_completo IS NOT NULL ORDER BY nombre_completo ASC LIMIT $2`;
      const result = await this.client.query(query, [terminoBusqueda, limite])
      return result.rows
    } catch (error) {
      return []
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      if (!this.client) {
        await this.conectar()
      }
      const result = await this.client.query(sql, params)
      return result.rows
    } catch (error: any) {
      throw error
    }
  }

  async obtenerProyectos(): Promise<any[]> {
    try {
      return []
    } catch (error) {
      return []
    }
  }

  async obtenerPublicaciones(): Promise<any[]> {
    try {
      const result = await this.client.query("SELECT * FROM publicaciones ORDER BY fecha_creacion DESC")
      return result.rows
    } catch (error) {
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
      return {
        success: false,
        message: `Error al insertar publicación: ${error instanceof Error ? error.message : "Error desconocido"}`,
        error
      }
    }
  }
}
