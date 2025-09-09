// Script para verificar y crear la tabla investigadores en Neon PostgreSQL
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

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
        
        // Crear la tabla investigadores
        await sql`
          CREATE TABLE investigadores (
            id SERIAL PRIMARY KEY,
            nombre_completo VARCHAR(255) NOT NULL,
            curp VARCHAR(18),
            rfc VARCHAR(13),
            no_cvu VARCHAR(50),
            correo VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            ultimo_grado_estudios VARCHAR(100),
            empleo_actual VARCHAR(255),
            linea_investigacion TEXT,
            nacionalidad VARCHAR(50) DEFAULT 'Mexicana',
            fecha_nacimiento DATE,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            origen VARCHAR(50),
            archivo_procesado VARCHAR(255),
            password VARCHAR(255)
          )
        `;
        
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
