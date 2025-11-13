require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔍 Analizando publicaciones y sus creadores...\n');
    
    const pubs = await sql`
      SELECT id, titulo, autor, clerk_user_id, fecha_creacion
      FROM publicaciones
      ORDER BY id
    `;
    
    console.log(`📊 Total publicaciones: ${pubs.rows.length}\n`);
    
    for (const pub of pubs.rows) {
      console.log(`📄 ID ${pub.id}: ${pub.titulo}`);
      console.log(`   Autores (colaboradores): ${pub.autor}`);
      console.log(`   Subido por (clerk_id): ${pub.clerk_user_id}`);
      
      // Buscar investigador
      const inv = await sql`
        SELECT nombre_completo, correo
        FROM investigadores
        WHERE clerk_user_id = ${pub.clerk_user_id}
      `;
      
      if (inv.rows.length > 0) {
        console.log(`   ✅ Creador encontrado: ${inv.rows[0].nombre_completo} (${inv.rows[0].correo})`);
      } else {
        console.log(`   ❌ Creador NO encontrado en tabla investigadores`);
        console.log(`      (necesita crear/actualizar perfil con este clerk_id)`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
})();
