require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔍 Investigando duplicados y relaciones...\n');
    
    // Ver quién tiene qué clerk_user_id
    const clerkId = 'user_35AQiDMrJ0C9pjc1gaYBo75MYvC';
    
    console.log(`Investigadores con clerk_user_id = ${clerkId}:`);
    const invs = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores
      WHERE clerk_user_id = ${clerkId}
    `;
    invs.rows.forEach(i => {
      console.log(`  - ${i.nombre_completo} (${i.correo})`);
    });
    
    console.log(`\nPublicaciones con clerk_user_id = ${clerkId}:`);
    const pubs = await sql`
      SELECT id, titulo, autor, clerk_user_id
      FROM publicaciones
      WHERE clerk_user_id = ${clerkId}
    `;
    pubs.rows.forEach(p => {
      console.log(`  - ${p.titulo}`);
      console.log(`    Autores: ${p.autor}`);
    });
    
    // Ver todos los investigadores y sus IDs
    console.log('\n📋 Todos los investigadores:');
    const todos = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores
      ORDER BY id
    `;
    todos.rows.forEach(i => {
      console.log(`  ID ${i.id}: ${i.nombre_completo}`);
      console.log(`    Email: ${i.correo}`);
      console.log(`    Clerk: ${i.clerk_user_id || 'NULL'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
})();
