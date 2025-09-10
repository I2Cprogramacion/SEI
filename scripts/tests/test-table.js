// Script para verificar y crear la tabla investigadores en Neon PostgreSQL
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function testTable() {
  try {
    console.log('🔍 Verificando tabla investigadores...');
    
    // Verificar si la tabla existe
    try {
      const result = await sql`SELECT COUNT(*) FROM investigadores`;
      console.log('✅ Tabla investigadores existe');
      console.log(`📊 Número de registros: ${result.rows[0].count}`);
    } catch (error) {
      if (error.message.includes('relation "investigadores" does not exist')) {
        console.log('⚠️ Tabla investigadores no existe, creándola...');
        
        // Crear la tabla investigadores con la estructura proporcionada
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
        `;
        await sql(createTableQuery);
        console.log('✅ Tabla investigadores creada exitosamente');
        
        // Crear índices para mejorar el rendimiento
        await sql`CREATE INDEX idx_investigadores_curp ON investigadores(curp)`;
        await sql`CREATE INDEX idx_investigadores_correo ON investigadores(correo)`;
        await sql`CREATE INDEX idx_investigadores_nombre ON investigadores(nombre_completo)`;
        
        console.log('✅ Índices creados');
        
      } else {
        throw error;
      }
    }
    
    // Mostrar estructura de la tabla
    const structure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'investigadores'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Estructura de la tabla investigadores:');
    structure.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTable();
