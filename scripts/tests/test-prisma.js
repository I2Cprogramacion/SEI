// Script para probar Prisma con la base de datos
require('dotenv').config({ path: '.env.local' });

async function testPrisma() {
  try {
    console.log('🧪 Probando Prisma con Neon PostgreSQL...');
    
    // Importar Prisma Client
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Probar conexión
    console.log('🔌 Probando conexión...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Contar registros en cada tabla
    console.log('\n📊 Contando registros en las tablas:');
    
    const userCount = await prisma.user.count();
    console.log(`   Users: ${userCount}`);
    
    const roleCount = await prisma.role.count();
    console.log(`   Roles: ${roleCount}`);
    
    const profileCount = await prisma.profile.count();
    console.log(`   Profiles: ${profileCount}`);
    
    const institutionCount = await prisma.institution.count();
    console.log(`   Institutions: ${institutionCount}`);
    
    const investigadorCount = await prisma.investigador.count();
    console.log(`   Investigadores: ${investigadorCount}`);
    
    // Crear un rol de prueba si no existe
    if (roleCount === 0) {
      console.log('\n📝 Creando rol de prueba...');
      const role = await prisma.role.create({
        data: {
          name: 'investigador',
          description: 'Rol para investigadores registrados'
        }
      });
      console.log(`✅ Rol creado: ${role.name} (ID: ${role.id})`);
    }
    
    // Crear un usuario de prueba si no existe
    if (userCount === 0) {
      console.log('\n📝 Creando usuario de prueba...');
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'password123',
          roleId: (await prisma.role.findFirst()).id
        }
      });
      console.log(`✅ Usuario creado: ${user.email} (ID: ${user.id})`);
    }
    
    // Crear un perfil de prueba si no existe
    if (profileCount === 0) {
      console.log('\n📝 Creando perfil de prueba...');
      const profile = await prisma.profile.create({
        data: {
          userId: (await prisma.user.findFirst()).id,
          nombreCompleto: 'Dr. Test User',
          nacionalidad: 'Mexicana'
        }
      });
      console.log(`✅ Perfil creado: ${profile.nombreCompleto} (ID: ${profile.id})`);
    }
    
    console.log('\n🎉 ¡Prisma está funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error probando Prisma:', error.message);
  } finally {
    if (typeof prisma !== 'undefined') {
      await prisma.$disconnect();
    }
  }
}

testPrisma();
