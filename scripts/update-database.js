const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Actualizando base de datos SQLite...');

// Lista de columnas que necesitamos agregar
const columnsToAdd = [
  'ultimo_grado_estudios TEXT',
  'area_investigacion TEXT', 
  'fotografia_url TEXT',
  'empleo_actual TEXT',
  'linea_investigacion TEXT',
  'nacionalidad TEXT',
  'fecha_nacimiento TEXT',
  'password TEXT',
  'fecha_registro TEXT',
  'origen TEXT',
  'archivo_procesado TEXT'
];

// Función para agregar columnas si no existen
function addColumnIfNotExists(columnDef) {
  return new Promise((resolve, reject) => {
    const [columnName] = columnDef.split(' ');
    
    // Verificar si la columna ya existe
    db.get(`PRAGMA table_info(investigadores)`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Verificar si la columna existe
      db.all(`PRAGMA table_info(investigadores)`, (err, columns) => {
        if (err) {
          reject(err);
          return;
        }
        
        const columnExists = columns.some(col => col.name === columnName);
        
        if (!columnExists) {
          console.log(`Agregando columna: ${columnName}`);
          db.run(`ALTER TABLE investigadores ADD COLUMN ${columnDef}`, (err) => {
            if (err) {
              console.error(`Error agregando ${columnName}:`, err.message);
              reject(err);
            } else {
              console.log(`✅ Columna ${columnName} agregada exitosamente`);
              resolve();
            }
          });
        } else {
          console.log(`✅ Columna ${columnName} ya existe`);
          resolve();
        }
      });
    });
  });
}

// Agregar todas las columnas
async function updateDatabase() {
  try {
    for (const column of columnsToAdd) {
      await addColumnIfNotExists(column);
    }
    console.log('✅ Base de datos actualizada exitosamente');
  } catch (error) {
    console.error('❌ Error actualizando base de datos:', error);
  } finally {
    db.close();
  }
}

updateDatabase();
