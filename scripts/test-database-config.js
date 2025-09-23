const { getDatabase, currentDatabaseConfig } = require('../lib/database-config.ts');

async function testDatabaseConfig() {
  try {
    console.log('🔍 Configuración actual de la base de datos:');
    console.log(JSON.stringify(currentDatabaseConfig, null, 2));
    
    console.log('\n🔗 Obteniendo instancia de base de datos...');
    const db = await getDatabase();
    console.log('✅ Base de datos obtenida:', db.constructor.name);
    
    console.log('\n🔍 Inicializando base de datos...');
    await db.inicializar();
    console.log('✅ Base de datos inicializada');
    
    console.log('\n🔍 Probando verificación de credenciales...');
    const result = await db.verificarCredenciales('admin@sei.com.mx', 'admin123');
    console.log('Resultado:', result);
    
    console.log('\n🔍 Obteniendo todos los investigadores...');
    const investigadores = await db.obtenerInvestigadores();
    console.log(`Total de investigadores: ${investigadores.length}`);
    if (investigadores.length > 0) {
      console.log('Primer investigador:', investigadores[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDatabaseConfig();
