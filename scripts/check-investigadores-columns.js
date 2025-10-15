// Script para ver las columnas exactas de la tabla investigadores
const sqlite3 = require('sqlite3').verbose();

console.log('\n🔍 VERIFICANDO COLUMNAS DE LA TABLA INVESTIGADORES\n');
console.log('='.repeat(70));

const db = new sqlite3.Database('database.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('\n❌ ERROR:', err.message);
    return;
  }
  
  // Obtener estructura de la tabla
  db.all('PRAGMA table_info(investigadores)', (err, columns) => {
    if (err) {
      console.error('\n❌ ERROR:', err.message);
      db.close();
      return;
    }
    
    console.log('\n📊 COLUMNAS DE LA TABLA INVESTIGADORES:\n');
    console.log(`Total de columnas: ${columns.length}\n`);
    
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name} (${col.type})`);
    });
    
    console.log('\n' + '='.repeat(70));
    
    // Ahora ver un registro de ejemplo
    db.get('SELECT * FROM investigadores WHERE id = 1', (err, row) => {
      if (err) {
        console.error('\n❌ ERROR:', err.message);
        db.close();
        return;
      }
      
      console.log('\n📋 EJEMPLO DE REGISTRO (ID: 1):\n');
      
      if (row) {
        const keys = Object.keys(row);
        keys.forEach(key => {
          const value = row[key];
          if (value) {
            console.log(`  ${key}: ${value.toString().substring(0, 50)}${value.toString().length > 50 ? '...' : ''}`);
          }
        });
      }
      
      console.log('\n' + '='.repeat(70));
      console.log('\n🎯 CAMPOS QUE DEBE MAPEAR EL API:\n');
      console.log('  nombre_completo → nombre');
      console.log('  correo → email');
      console.log('  fotografia_url → fotografiaUrl');
      console.log('  grado_maximo_estudios → ultimoGradoEstudios');
      console.log('  area_investigacion → areaInvestigacion');
      console.log('  linea_investigacion → lineaInvestigacion');
      console.log('\n' + '='.repeat(70));
      
      db.close();
    });
  });
});







