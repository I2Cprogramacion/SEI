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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
})();
