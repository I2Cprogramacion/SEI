const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('=== DIAGNOSTICO DE CAMPOS ===');
  
  // 1. Ver areas unicas
  const areas = await sql`
    SELECT DISTINCT area_investigacion, COUNT(*) as total 
    FROM investigadores 
    WHERE area_investigacion IS NOT NULL AND area_investigacion != ''
    GROUP BY area_investigacion
    ORDER BY total DESC
  `;
  console.log('\n AREAS DE INVESTIGACION:');
  areas.forEach(a => console.log(`  - ${a.area_investigacion}: ${a.total} investigadores`));
  
  // 2. Ver lineas de investigacion por area
  const lineas = await sql`
    SELECT 
      area_investigacion,
      linea_investigacion,
      COUNT(*) as total
    FROM investigadores 
    WHERE area_investigacion IS NOT NULL 
      AND area_investigacion != ''
      AND linea_investigacion IS NOT NULL 
      AND linea_investigacion != ''
    GROUP BY area_investigacion, linea_investigacion
    ORDER BY area_investigacion, total DESC
    LIMIT 50
  `;
  console.log('\n LINEAS DE INVESTIGACION POR AREA:');
  let currentArea = '';
  lineas.forEach(l => {
    if (l.area_investigacion !== currentArea) {
      currentArea = l.area_investigacion;
      console.log(`\n  AREA: ${currentArea}:`);
    }
    console.log(`    - ${l.linea_investigacion} (${l.total})`);
  });
  
  // 3. Verificar columnas disponibles
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'investigadores'
    AND column_name IN ('area_investigacion', 'linea_investigacion', 'area', 'disciplina', 'especialidad')
  `;
  console.log('\n COLUMNAS RELEVANTES:');
  columns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
  
  // 4. Probar slug conversion
  console.log('\n PRUEBA DE CONVERSION SLUG:');
  for (const area of areas.slice(0, 3)) {
    const slug = area.area_investigacion
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    console.log(`  "${area.area_investigacion}" => "${slug}"`);
  }
}

diagnose().catch(console.error);

