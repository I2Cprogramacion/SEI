// Script para diagnosticar por qué no se muestran los investigadores
const http = require('http');

console.log('\n🔍 DIAGNÓSTICO DE VISUALIZACIÓN DE INVESTIGADORES\n');
console.log('='.repeat(70));

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/investigadores',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      
      console.log('\n📋 ANÁLISIS DE DATOS DEL API:\n');
      
      if (jsonData.investigadores) {
        console.log(`Total de investigadores: ${jsonData.investigadores.length}\n`);
        
        jsonData.investigadores.forEach((inv, index) => {
          console.log(`${index + 1}. INVESTIGADOR ID: ${inv.id}`);
          console.log('   Campos recibidos del API:');
          console.log(`     - id: ${inv.id} ${inv.id ? '✓' : '✗'}`);
          console.log(`     - nombre: ${inv.nombre || 'undefined'} ${inv.nombre ? '✓' : '✗'}`);
          console.log(`     - email: ${inv.email || 'undefined'} ${inv.email ? '✓' : '✗'}`);
          console.log(`     - institucion: ${inv.institucion || 'undefined'}`);
          console.log(`     - area: ${inv.area || 'undefined'}`);
          console.log(`     - fotografiaUrl: ${inv.fotografiaUrl || 'undefined'}`);
          console.log(`     - ultimoGradoEstudios: ${inv.ultimoGradoEstudios || 'undefined'}`);
          console.log(`     - nivel: ${inv.nivel || 'undefined'}`);
          console.log(`     - slug: ${inv.slug || 'undefined'} ${inv.slug ? '✓' : '✗'}`);
          
          // Verificar si pasa el filtro básico
          const pasaFiltroBasico = inv.id && inv.nombre && inv.email;
          console.log(`   ¿Pasa filtro básico? ${pasaFiltroBasico ? '✅ SÍ' : '❌ NO'}`);
          
          console.log('');
        });
        
        console.log('='.repeat(70));
        console.log('\n📊 ESTRUCTURA ESPERADA POR EL FRONTEND:\n');
        console.log('   CAMPOS REQUERIDOS (interface Investigador):');
        console.log('     ✓ id: number');
        console.log('     ✓ nombre: string');
        console.log('     ✓ email: string');
        console.log('     ✓ slug: string');
        console.log('   CAMPOS OPCIONALES:');
        console.log('     - fotografiaUrl');
        console.log('     - ultimoGradoEstudios');
        console.log('     - institucion');
        console.log('     - area');
        console.log('     - estadoNacimiento / entidadFederativa');
        console.log('     - lineaInvestigacion');
        
        console.log('\n🔍 VERIFICANDO COINCIDENCIAS:\n');
        
        let allHaveBasicData = true;
        jsonData.investigadores.forEach(inv => {
          if (!inv.id || !inv.nombre || !inv.email) {
            console.log(`   ❌ ${inv.nombre || 'SIN NOMBRE'} - Faltan datos básicos`);
            allHaveBasicData = false;
          }
        });
        
        if (allHaveBasicData) {
          console.log('   ✅ Todos los investigadores tienen datos básicos (id, nombre, email)');
        }
        
        console.log('\n' + '='.repeat(70));
        
      } else {
        console.log('❌ No se encontró la propiedad "investigadores" en la respuesta');
      }
      
    } catch (error) {
      console.error('\n❌ ERROR:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR DE CONEXIÓN:', error.message);
});

req.end();

