const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Investigadores registrados:');
console.log('================================');

db.all(`
  SELECT 
    id,
    nombre_completo,
    curp,
    rfc,
    correo,
    telefono,
    ultimo_grado_estudios,
    empleo_actual,
    linea_investigacion,
    area_investigacion,
    fotografia_url,
    nacionalidad,
    fecha_nacimiento,
    fecha_registro,
    origen
  FROM investigadores 
  ORDER BY fecha_registro DESC
`, (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }

  if (rows.length === 0) {
    console.log('📭 No hay investigadores registrados');
    return;
  }

  rows.forEach((investigador, index) => {
    console.log(`\n👤 Investigador #${index + 1}:`);
    console.log(`   ID: ${investigador.id}`);
    console.log(`   Nombre: ${investigador.nombre_completo}`);
    console.log(`   CURP: ${investigador.curp}`);
    console.log(`   RFC: ${investigador.rfc}`);
    console.log(`   Email: ${investigador.correo}`);
    console.log(`   Teléfono: ${investigador.telefono}`);
    console.log(`   Grado: ${investigador.ultimo_grado_estudios}`);
    console.log(`   Empleo: ${investigador.empleo_actual}`);
    console.log(`   Línea: ${investigador.linea_investigacion}`);
    console.log(`   Área: ${investigador.area_investigacion}`);
    console.log(`   Nacionalidad: ${investigador.nacionalidad}`);
    console.log(`   Fecha Nacimiento: ${investigador.fecha_nacimiento}`);
    console.log(`   Fecha Registro: ${investigador.fecha_registro}`);
    console.log(`   Origen: ${investigador.origen}`);
    console.log(`   📸 Foto: ${investigador.fotografia_url ? '✅ Subida a Cloudinary' : '❌ Sin foto'}`);
    if (investigador.fotografia_url) {
      console.log(`   🔗 URL: ${investigador.fotografia_url}`);
    }
    console.log('   ' + '─'.repeat(50));
  });

  console.log(`\n📊 Total de investigadores: ${rows.length}`);
  db.close();
});
