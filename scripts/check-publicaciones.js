require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔍 Verificando tabla publicaciones...\n');
    
    // Contar total
    const count = await sql`SELECT COUNT(*) as total FROM publicaciones`;
    console.log('📊 Total publicaciones:', count.rows[0]?.total || 0);
    
    // Muestra de datos
    const sample = await sql`SELECT id, titulo, autor, clerk_user_id, fecha_creacion FROM publicaciones LIMIT 5`;
    console.log('\n📝 Muestra de publicaciones:');
    sample.rows.forEach(pub => {
      console.log(`  - ID: ${pub.id}`);
      console.log(`    Título: ${pub.titulo}`);
      console.log(`    Autor: ${pub.autor}`);
      console.log(`    Clerk User ID: ${pub.clerk_user_id || 'N/A'}`);
      console.log(`    Fecha: ${pub.fecha_creacion}`);
      console.log('');
    });
    
    // Verificar relación con investigadores
    const withClerkId = await sql`SELECT COUNT(*) as total FROM publicaciones WHERE clerk_user_id IS NOT NULL`;
    console.log(`✅ Publicaciones con clerk_user_id: ${withClerkId.rows[0]?.total || 0}`);
    
    const withoutClerkId = await sql`SELECT COUNT(*) as total FROM publicaciones WHERE clerk_user_id IS NULL`;
    console.log(`⚠️  Publicaciones sin clerk_user_id: ${withoutClerkId.rows[0]?.total || 0}`);
    
    // Verificar investigadores
    console.log('\n👥 Investigadores con clerk_user_id:');
    const invs = await sql`SELECT id, nombre_completo, clerk_user_id FROM investigadores WHERE clerk_user_id IS NOT NULL LIMIT 5`;
    invs.rows.forEach(i => {
      console.log(`  - ${i.nombre_completo}: ${i.clerk_user_id}`);
    });
    
    // Verificar JOIN
    console.log('\n🔗 Probando JOIN entre publicaciones e investigadores:');
    const joined = await sql`
      SELECT p.id, p.titulo, p.clerk_user_id, i.nombre_completo AS uploader_nombre
      FROM publicaciones p
      LEFT JOIN investigadores i ON i.clerk_user_id = p.clerk_user_id
      LIMIT 5
    `;
    joined.rows.forEach(r => {
      console.log(`  - ${r.titulo}`);
      console.log(`    Clerk ID: ${r.clerk_user_id}`);
      console.log(`    Uploader: ${r.uploader_nombre || 'NULL'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
})();
