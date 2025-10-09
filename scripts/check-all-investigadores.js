// Ver TODOS los datos de TODOS los investigadores
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('ERROR:', err.message);
    return;
  }
  
  db.all('SELECT * FROM investigadores', (err, rows) => {
    if (err) {
      console.error('ERROR:', err.message);
      db.close();
      return;
    }
    
    console.log('\n📊 DATOS COMPLETOS DE INVESTIGADORES\n');
    console.log('='.repeat(70));
    
    rows.forEach((inv, index) => {
      console.log(`\n${index + 1}. ${inv.nombre_completo || 'SIN NOMBRE'} (ID: ${inv.id})`);
      console.log('   DATOS BÁSICOS:');
      console.log(`     correo: ${inv.correo || 'N/A'}`);
      console.log(`     curp: ${inv.curp || 'N/A'}`);
      console.log(`     rfc: ${inv.rfc || 'N/A'}`);
      console.log(`     telefono: ${inv.telefono || 'N/A'}`);
      console.log('   ACADÉMICO:');
      console.log(`     institucion: ${inv.institucion || 'N/A'}`);
      console.log(`     area: ${inv.area || 'N/A'}`);
      console.log(`     area_investigacion: ${inv.area_investigacion || 'N/A'}`);
      console.log(`     linea_investigacion: ${inv.linea_investigacion || 'N/A'}`);
      console.log(`     grado_maximo_estudios: ${inv.grado_maximo_estudios || 'N/A'}`);
      console.log(`     ultimo_grado_estudios: ${inv.ultimo_grado_estudios || 'N/A'}`);
      console.log(`     nivel: ${inv.nivel || 'N/A'}`);
      console.log('   OTROS:');
      console.log(`     fotografia_url: ${inv.fotografia_url ? 'SÍ' : 'NO'}`);
      console.log(`     estado_nacimiento: ${inv.estado_nacimiento || 'N/A'}`);
      console.log(`     entidad_federativa: ${inv.entidad_federativa || 'N/A'}`);
      console.log(`     fecha_registro: ${inv.fecha_registro || 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(70));
    db.close();
  });
});

