require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔄 Sincronizando clerk_user_id entre investigadores y usuarios Clerk...\n');
    
    // Obtener investigadores con correos
    const investigadores = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores
      WHERE correo IS NOT NULL
      ORDER BY fecha_registro DESC
    `;
    
    console.log(`📊 Total investigadores: ${investigadores.rows.length}\n`);
    
    // Obtener publicaciones únicas por clerk_user_id
    const publicaciones = await sql`
      SELECT DISTINCT clerk_user_id
      FROM publicaciones
      WHERE clerk_user_id IS NOT NULL
    `;
    
    const clerkIdsEnPublicaciones = new Set(publicaciones.rows.map(p => p.clerk_user_id));
    
    console.log('🔑 Clerk IDs encontrados en publicaciones:');
    clerkIdsEnPublicaciones.forEach(id => console.log(`  - ${id}`));
    
    console.log('\n📝 Analizando qué investigadores necesitan actualización...\n');
    
    let needsUpdate = [];
    
    for (const inv of investigadores.rows) {
      // Buscar si hay publicaciones de este investigador
      const pubs = await sql`
        SELECT COUNT(*) as count, clerk_user_id
        FROM publicaciones
        WHERE LOWER(autor) LIKE ${`%${inv.nombre_completo.toLowerCase()}%`}
        GROUP BY clerk_user_id
      `;
      
      if (pubs.rows.length > 0) {
        const pubClerkId = pubs.rows[0].clerk_user_id;
        if (inv.clerk_user_id !== pubClerkId) {
          needsUpdate.push({
            inv_id: inv.id,
            nombre: inv.nombre_completo,
            correo: inv.correo,
            clerk_id_viejo: inv.clerk_user_id,
            clerk_id_nuevo: pubClerkId,
            num_pubs: pubs.rows[0].count
          });
        }
      }
    }
    
    if (needsUpdate.length === 0) {
      console.log('✅ Todos los investigadores ya tienen el clerk_user_id correcto');
      process.exit(0);
      return;
    }
    
    console.log(`⚠️  ${needsUpdate.length} investigadores necesitan actualización:\n`);
    needsUpdate.forEach(u => {
      console.log(`  ${u.nombre}`);
      console.log(`    Correo: ${u.correo}`);
      console.log(`    Viejo: ${u.clerk_id_viejo || 'NULL'}`);
      console.log(`    Nuevo: ${u.clerk_id_nuevo}`);
      console.log(`    Publicaciones: ${u.num_pubs}`);
      console.log('');
    });
    
    console.log('🔧 Actualizando investigadores...\n');
    
    for (const u of needsUpdate) {
      await sql`
        UPDATE investigadores
        SET clerk_user_id = ${u.clerk_id_nuevo}
        WHERE id = ${u.inv_id}
      `;
      console.log(`✅ Actualizado: ${u.nombre}`);
    }
    
    console.log('\n✨ Sincronización completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  process.exit(0);
})();
