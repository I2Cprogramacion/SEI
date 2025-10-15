// Script para verificar un usuario específico
const sqlite3 = require('sqlite3').verbose();

console.log('\n🔍 BUSCANDO USUARIO: prueba@imagen.com\n');
console.log('='.repeat(70));

const db = new sqlite3.Database('database.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('\n❌ ERROR:', err.message);
    return;
  }
  
  // Buscar por email similar
  db.all("SELECT * FROM investigadores WHERE correo LIKE '%imagen%' OR correo LIKE '%prueba%'", (err, rows) => {
    if (err) {
      console.error('\n❌ ERROR:', err.message);
      db.close();
      return;
    }
    
    console.log(`\n📊 USUARIOS ENCONTRADOS: ${rows.length}\n`);
    
    rows.forEach((inv, index) => {
      console.log(`${index + 1}. ${inv.nombre_completo || 'SIN NOMBRE'} (ID: ${inv.id})`);
      console.log(`   ✉️ Email: ${inv.correo}`);
      console.log(`   👤 Nombre completo: ${inv.nombre_completo}`);
      console.log(`   🏢 Institución: ${inv.institucion || 'Sin institución'}`);
      console.log(`   📚 Área: ${inv.area || 'Sin área'}`);
      console.log(`   📚 Área investigación: ${inv.area_investigacion || 'Sin área investigación'}`);
      console.log(`   🎓 Grado máximo: ${inv.grado_maximo_estudios || 'N/A'}`);
      console.log(`   🎓 Último grado: ${inv.ultimo_grado_estudios || 'N/A'}`);
      console.log(`   📸 Fotografía URL: ${inv.fotografia_url || 'Sin foto'}`);
      console.log(`   🔗 Línea investigación: ${inv.linea_investigacion || 'N/A'}`);
      console.log(`   📅 Fecha registro: ${inv.fecha_registro}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    db.close();
  });
});







