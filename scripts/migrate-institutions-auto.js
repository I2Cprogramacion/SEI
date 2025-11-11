/**
 * Script para migrar automáticamente la tabla institutions
 * Verifica y crea las columnas necesarias si no existen
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL no está configurada en .env.local');
  console.error('Por favor, asegúrate de tener DATABASE_URL configurada en tu archivo .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateInstitutions() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migración de tabla institutions...');
    
    // Verificar que la tabla existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'institutions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla institutions no existe. Creándola...');
      // Crear tabla básica si no existe
      await client.query(`
        CREATE TABLE IF NOT EXISTS institutions (
          id VARCHAR(255) PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ Tabla institutions creada');
    }
    
    // Lista de columnas a agregar
    const columns = [
      { name: 'siglas', type: 'VARCHAR(50)' },
      { name: 'tipo_otro_especificar', type: 'VARCHAR(255)' },
      { name: 'año_fundacion', type: 'INTEGER' },
      { name: 'descripcion', type: 'TEXT' },
      { name: 'imagen_url', type: 'TEXT' },
      { name: 'tipo_persona', type: 'VARCHAR(10)' },
      { name: 'rfc', type: 'VARCHAR(13)' },
      { name: 'razon_social', type: 'TEXT' },
      { name: 'regimen_fiscal', type: 'VARCHAR(255)' },
      { name: 'actividad_economica', type: 'TEXT' },
      { name: 'curp', type: 'VARCHAR(18)' },
      { name: 'nombre_completo', type: 'VARCHAR(255)' },
      { name: 'numero_escritura', type: 'VARCHAR(100)' },
      { name: 'fecha_constitucion', type: 'DATE' },
      { name: 'notario_publico', type: 'VARCHAR(255)' },
      { name: 'numero_notaria', type: 'VARCHAR(50)' },
      { name: 'registro_publico', type: 'VARCHAR(100)' },
      { name: 'objeto_social', type: 'TEXT' },
      { name: 'domicilio_fiscal', type: 'JSONB' },
      { name: 'representante_legal', type: 'JSONB' },
      { name: 'contacto_institucional', type: 'JSONB' },
      { name: 'areas_investigacion', type: 'JSONB' },
      { name: 'capacidad_investigacion', type: 'TEXT' },
      { name: 'documentos', type: 'JSONB' },
      { name: 'activo', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'estado', type: 'VARCHAR(50) DEFAULT \'PENDIENTE\'' },
      { name: 'sitio_web', type: 'VARCHAR(500)' },
      { name: 'ubicacion', type: 'VARCHAR(255)' },
      { name: 'tipo', type: 'VARCHAR(255)' }
    ];
    
    console.log('📋 Verificando y creando columnas...');
    
    for (const col of columns) {
      // Verificar si la columna existe
      const colCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'institutions' 
          AND column_name = $1
        );
      `, [col.name]);
      
      if (!colCheck.rows[0].exists) {
        console.log(`  ➕ Agregando columna: ${col.name}`);
        await client.query(`
          ALTER TABLE institutions 
          ADD COLUMN ${col.name} ${col.type};
        `);
        console.log(`  ✅ Columna ${col.name} creada`);
      } else {
        console.log(`  ✓ Columna ${col.name} ya existe`);
      }
    }
    
    // Crear índices
    console.log('📊 Creando índices...');
    const indexes = [
      { name: 'idx_institutions_rfc', column: 'rfc' },
      { name: 'idx_institutions_tipo', column: 'tipo' },
      { name: 'idx_institutions_estado', column: 'estado' },
      { name: 'idx_institutions_activo', column: 'activo' }
    ];
    
    for (const idx of indexes) {
      try {
        await client.query(`
          CREATE INDEX IF NOT EXISTS ${idx.name} ON institutions(${idx.column});
        `);
        console.log(`  ✅ Índice ${idx.name} creado`);
      } catch (error) {
        console.log(`  ⚠️  Índice ${idx.name} ya existe o hubo un error: ${error.message}`);
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    
    // Verificar estructura final
    const finalCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'institutions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura final de la tabla:');
    finalCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración
migrateInstitutions()
  .then(() => {
    console.log('\n🎉 Migración finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });

