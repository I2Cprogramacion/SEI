require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🧪 Probando ambos endpoints de publicaciones...\n');
    
    // Test 1: Endpoint con clerk_user_id
    const testClerkId = 'user_35AQiDMrJ0C9pjc1gaYBo75MYvC'; // Alejandro
    
    console.log(`1️⃣ GET /api/publicaciones?clerk_user_id=${testClerkId}`);
    console.log('   (Dashboard - Usuario logueado)\n');
    
    const pubsResult = await sql`
      SELECT p.id, p.titulo, p.autor, p.institucion, p.editorial, p.año_creacion AS año, p.doi,
             p.resumen, p.palabras_clave, p.categoria, p.tipo, p.acceso, p.volumen, p.numero, p.paginas, p.archivo_url,
             p.fecha_creacion, p.clerk_user_id,
             i.nombre_completo AS uploader_nombre
      FROM publicaciones p
      LEFT JOIN investigadores i ON i.clerk_user_id = p.clerk_user_id
      WHERE p.clerk_user_id = ${testClerkId}
      ORDER BY p.fecha_creacion DESC LIMIT 200
    `;
    
    console.log(`   Resultado: ${pubsResult.rows.length} publicaciones encontradas`);
    pubsResult.rows.forEach(p => {
      console.log(`   - ${p.titulo}`);
      console.log(`     Autor: ${p.autor}`);
      console.log(`     Uploader: ${p.uploader_nombre || 'NULL'}`);
    });
    
    // Test 2: Endpoint por slug
    console.log('\n2️⃣ GET /api/investigadores/[slug]/publicaciones');
    console.log('   (Perfil público)\n');
    
    const slugTest = 'alejandro-ocon';
    
    const invResult = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores 
      WHERE slug = ${slugTest} OR 
            LOWER(REPLACE(REPLACE(nombre_completo, ' ', '-'), '.', '')) = ${slugTest}
    `;
    
    if (invResult.rows.length > 0) {
      const inv = invResult.rows[0];
      console.log(`   Investigador: ${inv.nombre_completo}`);
      console.log(`   Clerk ID: ${inv.clerk_user_id}\n`);
      
      const pubsByClerkId = await sql`
        SELECT id, titulo, autor, año_creacion
        FROM publicaciones 
        WHERE clerk_user_id = ${inv.clerk_user_id}
        ORDER BY año_creacion DESC
        LIMIT 50
      `;
      
      console.log(`   Resultado: ${pubsByClerkId.rows.length} publicaciones`);
      pubsByClerkId.rows.forEach(p => {
        console.log(`   - ${p.titulo} (${p.año_creacion || 'sin año'})`);
      });
    } else {
      console.log(`   ❌ Investigador con slug "${slugTest}" no encontrado`);
      console.log('   Probando con nombre parcial...\n');
      
      const invByName = await sql`
        SELECT id, nombre_completo, correo, clerk_user_id, slug
        FROM investigadores 
        WHERE LOWER(nombre_completo) LIKE ${'%alejandro%'}
      `;
      
      console.log(`   Encontrados ${invByName.rows.length} investigadores:`);
      invByName.rows.forEach(i => {
        console.log(`   - ${i.nombre_completo}`);
        console.log(`     Slug: ${i.slug || 'NULL'}`);
        console.log(`     Clerk: ${i.clerk_user_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  process.exit(0);
})();
