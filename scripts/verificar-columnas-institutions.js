/**
 * Script para verificar qué columnas faltan en la tabla institutions
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL no está configurada en .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Columnas requeridas según el código
const requiredColumns = [
  'id', 'nombre', 'siglas', 'tipo', 'tipo_otro_especificar', 'año_fundacion', 
  'sitio_web', 'imagen_url', 'descripcion', 'tipo_persona', 'rfc', 'razon_social', 
  'regimen_fiscal', 'actividad_economica', 'curp', 'nombre_completo',
  'numero_escritura', 'fecha_constitucion', 'notario_publico', 'numero_notaria',
  'registro_publico', 'objeto_social', 'domicilio_fiscal', 'representante_legal',
  'contacto_institucional', 'areas_investigacion', 'capacidad_investigacion',
  'documentos', 'ubicacion', 'activo', 'estado', 'created_at', 'updated_at'
];

async function verifyColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando columnas de la tabla institutions...\n');
    
    // Verificar que la tabla existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'institutions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ La tabla institutions NO existe');
      console.log('\n💡 Solución: Ejecuta el script de migración SQL en Neon Console');
      console.log('   Archivo: scripts/migrate-institutions-table.sql\n');
      process.exit(1);
    }
    
    console.log('✅ La tabla institutions existe\n');
    
    // Obtener columnas existentes
    const existingColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'institutions'
      ORDER BY ordinal_position;
    `);
    
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    
    console.log(`📊 Columnas existentes (${existingColumnNames.length}):`);
    existingColumns.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name} (${row.data_type})`);
    });
    
    console.log(`\n📋 Columnas requeridas (${requiredColumns.length}):`);
    requiredColumns.forEach(col => {
      const exists = existingColumnNames.includes(col);
      console.log(`   ${exists ? '✓' : '✗'} ${col}`);
    });
    
    // Encontrar columnas faltantes
    const missingColumns = requiredColumns.filter(col => !existingColumnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`\n❌ Columnas faltantes (${missingColumns.length}):`);
      missingColumns.forEach(col => {
        console.log(`   - ${col}`);
      });
      
      console.log('\n💡 Solución: Ejecuta el script de migración SQL en Neon Console');
      console.log('   Archivo: scripts/migrate-institutions-table.sql');
      console.log('\n   O ejecuta: npm run migrate:institutions\n');
      process.exit(1);
    } else {
      console.log('\n✅ Todas las columnas requeridas existen');
      console.log('✅ La tabla está lista para usar\n');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar columnas:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar verificación
verifyColumns()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });

