const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// Función para generar slug (igual que en el backend)
function generarSlug(nombreCompleto) {
  return nombreCompleto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

console.log('🔍 Investigadores y sus slugs:');
console.log('================================\n');

db.all(`
  SELECT id, nombre_completo
  FROM investigadores 
  ORDER BY fecha_registro DESC
`, (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }

  rows.forEach((inv, index) => {
    const slug = generarSlug(inv.nombre_completo);
    console.log(`${index + 1}. ${inv.nombre_completo}`);
    console.log(`   📋 ID: ${inv.id}`);
    console.log(`   🔗 Slug: ${slug}`);
    console.log(`   🌐 URL: http://localhost:3000/investigadores/${slug}`);
    console.log('');
  });

  db.close();
});
