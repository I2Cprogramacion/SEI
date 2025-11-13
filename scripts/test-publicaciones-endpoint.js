require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🧪 Probando consulta del endpoint GET /api/publicaciones\n');
    
    // Simular la consulta que hace el endpoint cuando se pasa clerk_user_id
    const testClerkId = 'user_35AGvb3bXffV9bcrv10YaohCtF7'; // Daron Tarín
    
    const result = await sql`
      SELECT p.id, p.titulo, p.autor, p.institucion, p.editorial, p.año_creacion AS año, p.doi,
             p.resumen, p.palabras_clave, p.categoria, p.tipo, p.acceso, p.volumen, p.numero, p.paginas, p.archivo_url,
             p.fecha_creacion, p.clerk_user_id,
             i.nombre_completo AS uploader_nombre
      FROM publicaciones p
      LEFT JOIN investigadores i ON i.clerk_user_id = p.clerk_user_id
      WHERE p.clerk_user_id = ${testClerkId}
      ORDER BY p.fecha_creacion DESC LIMIT 200
    `;
    
    console.log(`📊 Resultados para clerk_user_id="${testClerkId}":`);
    console.log(`   Total encontrado: ${result.rows.length}`);
    
    result.rows.forEach(pub => {
      console.log(`\n   - ${pub.titulo}`);
      console.log(`     Autor: ${pub.autor}`);
      console.log(`     Uploader: ${pub.uploader_nombre || 'N/A'}`);
    });
    
    // Ahora probar consulta por slug (perfil público)
    console.log('\n\n🧪 Probando consulta del endpoint /api/investigadores/[slug]/publicaciones\n');
    
    const slugTest = 'daron-tarin-gonzalez-trzjVp';
    
    const invResult = await sql`
      SELECT id, nombre_completo, correo, clerk_user_id
      FROM investigadores 
      WHERE slug = ${slugTest}
    `;
    
    if (invResult.rows.length > 0) {
      const inv = invResult.rows[0];
      console.log(`✅ Investigador encontrado: ${inv.nombre_completo}`);
      console.log(`   Clerk ID: ${inv.clerk_user_id || 'N/A'}`);
      
      const pubResult = await sql`
        SELECT id, titulo, autor, año_creacion
        FROM publicaciones 
        WHERE clerk_user_id = ${inv.clerk_user_id}
        ORDER BY año_creacion DESC
        LIMIT 50
      `;
      
      console.log(`\n📊 Publicaciones del investigador: ${pubResult.rows.length}`);
      pubResult.rows.forEach(pub => {
        console.log(`   - ${pub.titulo} (${pub.año_creacion || 'sin año'})`);
      });
    } else {
      console.log(`❌ Investigador con slug "${slugTest}" no encontrado`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  process.exit(0);
})();
