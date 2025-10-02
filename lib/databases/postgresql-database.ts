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
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 10000 
      })

      // Manejar eventos de error y desconexión
      this.client.on('error', (err: unknown) => {
        console.error('Error en conexión PostgreSQL:', err)
      })

      this.client.on('end', () => {
        console.log('Conexión PostgreSQL cerrada')
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
        ultimo_grado_estudios VARCHAR(255),
        empleo_actual VARCHAR(255),
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
        origen VARCHAR(50),
        archivo_procesado TEXT,
        password TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    try {
      await this.client.query(createTableQuery)
      console.log('Tabla investigadores creada o ya existente en PostgreSQL')
      // Asegurar columnas críticas en esquemas existentes
      const requiredColumns: Array<{ name: string; type: string }> = [
        { name: 'nombre_completo', type: 'VARCHAR(255)' },
        { name: 'curp', type: 'VARCHAR(18)' },
        { name: 'rfc', type: 'VARCHAR(13)' },
        { name: 'correo', type: 'VARCHAR(255)' },
        { name: 'telefono', type: 'VARCHAR(20)' },
        { name: 'no_cvu', type: 'VARCHAR(20)' },
        { name: 'orcid', type: 'VARCHAR(20)' },
        { name: 'nivel', type: 'VARCHAR(50)' },
        { name: 'area', type: 'VARCHAR(255)' },
        { name: 'institucion', type: 'VARCHAR(255)' },
        { name: 'nacionalidad', type: 'VARCHAR(100)' },
        { name: 'fecha_nacimiento', type: 'DATE' },
        { name: 'grado_maximo_estudios', type: 'VARCHAR(100)' },
        { name: 'ultimo_grado_estudios', type: 'VARCHAR(255)' },
        { name: 'empleo_actual', type: 'VARCHAR(255)' },
        { name: 'titulo_tesis', type: 'TEXT' },
        { name: 'anio_grado', type: 'INTEGER' },
        { name: 'pais_grado', type: 'VARCHAR(100)' },
        { name: 'disciplina', type: 'VARCHAR(255)' },
        { name: 'especialidad', type: 'VARCHAR(255)' },
        { name: 'linea_investigacion', type: 'TEXT' },
        { name: 'sni', type: 'VARCHAR(10)' },
        { name: 'anio_sni', type: 'INTEGER' },
        { name: 'cv_conacyt', type: 'TEXT' },
        { name: 'experiencia_docente', type: 'TEXT' },
        { name: 'experiencia_laboral', type: 'TEXT' },
        { name: 'proyectos_investigacion', type: 'TEXT' },
        { name: 'proyectos_vinculacion', type: 'TEXT' },
        { name: 'patentes', type: 'TEXT' },
        { name: 'productos_cientificos', type: 'TEXT' },
        { name: 'productos_tecnologicos', type: 'TEXT' },
        { name: 'productos_humanisticos', type: 'TEXT' },
        { name: 'libros', type: 'TEXT' },
        { name: 'capitulos_libros', type: 'TEXT' },
        { name: 'articulos', type: 'TEXT' },
        { name: 'revistas_indexadas', type: 'TEXT' },
        { name: 'revistas_no_indexadas', type: 'TEXT' },
        { name: 'memorias', type: 'TEXT' },
        { name: 'ponencias', type: 'TEXT' },
        { name: 'formacion_recursos', type: 'TEXT' },
        { name: 'direccion_tesis', type: 'TEXT' },
        { name: 'direccion_posgrados', type: 'TEXT' },
        { name: 'evaluador_proyectos', type: 'TEXT' },
        { name: 'miembro_comites', type: 'TEXT' },
        { name: 'editor_revistas', type: 'TEXT' },
        { name: 'premios_distinciones', type: 'TEXT' },
        { name: 'estancias_academicas', type: 'TEXT' },
        { name: 'idiomas', type: 'TEXT' },
        { name: 'asociaciones_cientificas', type: 'TEXT' },
        { name: 'gestion_academica', type: 'TEXT' },
        { name: 'gestion_institucional', type: 'TEXT' },
        { name: 'colaboracion_internacional', type: 'TEXT' },
        { name: 'colaboracion_nacional', type: 'TEXT' },
        { name: 'divulgacion_cientifica', type: 'TEXT' },
        { name: 'otros_logros', type: 'TEXT' },
        { name: 'vinculacion_sector_productivo', type: 'TEXT' },
        { name: 'vinculacion_sector_social', type: 'TEXT' },
        { name: 'vinculacion_sector_publico', type: 'TEXT' },
        { name: 'participacion_politicas_publicas', type: 'TEXT' },
        { name: 'impacto_social', type: 'TEXT' },
        { name: 'propuesta_linea_trabajo', type: 'TEXT' },
        { name: 'documentacion_completa', type: 'TEXT' },
        { name: 'observaciones', type: 'TEXT' },
        { name: 'genero', type: 'VARCHAR(20)' },
        { name: 'estado_nacimiento', type: 'VARCHAR(100)' },
        { name: 'municipio', type: 'VARCHAR(100)' },
        { name: 'domicilio', type: 'TEXT' },
        { name: 'cp', type: 'VARCHAR(10)' },
        { name: 'entidad_federativa', type: 'VARCHAR(100)' },
        { name: 'cv_ligado_orcid', type: 'TEXT' },
        { name: 'orcid_verificado', type: 'BOOLEAN' },
        { name: 'fecha_registro', type: 'TIMESTAMP' },
        { name: 'origen', type: 'VARCHAR(50)' },
        { name: 'archivo_procesado', type: 'TEXT' },
        { name: 'password', type: 'TEXT' },
        { name: 'is_admin', type: 'BOOLEAN DEFAULT FALSE' }
      ]

      // Ejecutar ALTER TABLE por cada columna requerida
      for (const col of requiredColumns) {
        try {
          await this.client.query(
            `ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
          )
        } catch (e) {
          console.warn(`No se pudo asegurar la columna ${col.name}:`, e)
        }
      }

      // Migrar columnas heredadas en camelCase a snake_case y evitar NOT NULL legacy
      const legacyMigration = `
        DO $$
        BEGIN
          -- nombreCompleto -> nombre_completo
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "nombreCompleto" TO nombre_completo;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET nombre_completo = COALESCE(nombre_completo, "nombreCompleto");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "nombreCompleto";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              -- intentar con minúsculas no-quoted (nombrecompleto)
              ALTER TABLE investigadores RENAME COLUMN nombrecompleto TO nombre_completo;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

          -- noCvu -> no_cvu
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "noCvu" TO no_cvu;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET no_cvu = COALESCE(no_cvu, "noCvu");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "noCvu";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              ALTER TABLE investigadores RENAME COLUMN nocvu TO no_cvu;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

          -- ultimoGradoEstudios -> ultimo_grado_estudios
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "ultimoGradoEstudios" TO ultimo_grado_estudios;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET ultimo_grado_estudios = COALESCE(ultimo_grado_estudios, "ultimoGradoEstudios");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "ultimoGradoEstudios";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              ALTER TABLE investigadores RENAME COLUMN ultimogradoestudios TO ultimo_grado_estudios;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

          -- empleoActual -> empleo_actual
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "empleoActual" TO empleo_actual;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET empleo_actual = COALESCE(empleo_actual, "empleoActual");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "empleoActual";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              ALTER TABLE investigadores RENAME COLUMN empleoactual TO empleo_actual;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

          -- lineaInvestigacion -> linea_investigacion
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "lineaInvestigacion" TO linea_investigacion;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET linea_investigacion = COALESCE(linea_investigacion, "lineaInvestigacion");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "lineaInvestigacion";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              ALTER TABLE investigadores RENAME COLUMN lineainvestigacion TO linea_investigacion;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

          -- fechaNacimiento -> fecha_nacimiento
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "fechaNacimiento" TO fecha_nacimiento;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET fecha_nacimiento = COALESCE(fecha_nacimiento, "fechaNacimiento");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "fechaNacimiento";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              ALTER TABLE investigadores RENAME COLUMN fechanacimiento TO fecha_nacimiento;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

          -- fechaRegistro -> fecha_registro
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "fechaRegistro" TO fecha_registro;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET fecha_registro = COALESCE(fecha_registro, "fechaRegistro");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "fechaRegistro";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              ALTER TABLE investigadores RENAME COLUMN fecharegistro TO fecha_registro;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

          -- archivoProcesado -> archivo_procesado
          BEGIN
            ALTER TABLE investigadores RENAME COLUMN "archivoProcesado" TO archivo_procesado;
          EXCEPTION WHEN duplicate_column THEN
            BEGIN
              UPDATE investigadores SET archivo_procesado = COALESCE(archivo_procesado, "archivoProcesado");
              ALTER TABLE investigadores DROP COLUMN IF EXISTS "archivoProcesado";
            EXCEPTION WHEN undefined_column THEN NULL; END;
          WHEN undefined_column THEN
            BEGIN
              ALTER TABLE investigadores RENAME COLUMN archivoprocesado TO archivo_procesado;
            EXCEPTION WHEN undefined_column THEN NULL; END;
          END;

        END $$ LANGUAGE plpgsql;
      `

      try {
        await this.client.query(legacyMigration)
      } catch (e) {
        console.warn('No se pudieron migrar columnas heredadas (puede no ser necesario):', e)
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
      // Verificar conexión y reconectar si es necesario
      if (!this.client) {
        await this.conectar()
      } else {
        // Verificar si la conexión sigue activa
        try {
          await this.client.query('SELECT 1')
        } catch (error) {
          console.log('Conexión perdida, reconectando...')
          await this.conectar()
        }
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
          isAdmin: usuario.is_admin === true || usuario.is_admin === 1 || usuario.is_admin === '1'
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

  async obtenerProyectos() {
    try {
      if (!this.client) {
        await this.conectar()
      }
      
      // Obtener investigadores que tengan proyectos
      const result = await this.client.query(`
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
      
      for (const investigador of result.rows) {
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
      
      return proyectos
    } catch (error) {
      console.error('Error al obtener proyectos de PostgreSQL:', error)
      return []
    }
  }

  async insertarPublicacion(datos: any) {
    try {
      if (!this.client) {
        await this.conectar()
      }

      // Crear tabla de publicaciones si no existe
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS publicaciones (
          id SERIAL PRIMARY KEY,
          titulo VARCHAR(500) NOT NULL,
          autor VARCHAR(255) NOT NULL,
          institucion VARCHAR(255) NOT NULL,
          editorial VARCHAR(255) NOT NULL,
          año_creacion INTEGER NOT NULL,
          doi VARCHAR(255),
          resumen TEXT,
          palabras_clave TEXT,
          categoria VARCHAR(100) NOT NULL,
          tipo VARCHAR(100) NOT NULL,
          acceso VARCHAR(50),
          volumen VARCHAR(50),
          numero VARCHAR(50),
          paginas VARCHAR(50),
          archivo VARCHAR(500),
          archivo_url VARCHAR(500),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Insertar la publicación
      const result = await this.client.query(`
        INSERT INTO publicaciones (
          titulo, autor, institucion, editorial, año_creacion, doi, resumen,
          palabras_clave, categoria, tipo, acceso, volumen, numero, paginas,
          archivo, archivo_url, fecha_creacion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
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
        id: result.rows[0].id
      }

    } catch (error) {
      console.error("Error al insertar publicación en PostgreSQL:", error)
      return {
        success: false,
        message: "Error al crear la publicación",
        error: error
      }
    }
  }

  async obtenerPublicaciones() {
    try {
      if (!this.client) {
        await this.conectar()
      }

      // Verificar si la tabla existe
      const tableExists = await this.client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'publicaciones'
        )
      `)

      if (!tableExists.rows[0].exists) {
        return []
      }

      // Obtener todas las publicaciones
      const result = await this.client.query(`
        SELECT * FROM publicaciones 
        ORDER BY fecha_creacion DESC
      `)

      return result.rows.map((pub: any) => ({
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
      console.error("Error al obtener publicaciones de PostgreSQL:", error)
      return []
    }
  }
}
