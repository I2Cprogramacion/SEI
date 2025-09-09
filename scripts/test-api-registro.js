// Script para probar la API de registro de investigadores
require('dotenv').config({ path: '.env.local' });

async function testAPIRegistro() {
  try {
    console.log('🌐 Probando API de registro...');
    
    // Datos de prueba para la API
    const datosRegistro = {
      nombre_completo: 'Dra. María López Rodríguez',
      curp: 'LORM850515MDFXXX02',
      rfc: 'LORM850515XXX',
      no_cvu: '67890',
      correo: 'maria.lopez@test.com',
      telefono: '5559876543',
      ultimo_grado_estudios: 'Maestría',
      empleo_actual: 'Investigadora',
      linea_investigacion: 'Biología Molecular',
      nacionalidad: 'Mexicana',
      fecha_nacimiento: '1985-05-15',
      password: 'password123'
    };
    
    console.log('📝 Enviando datos a la API de registro...');
    console.log('📊 Datos a enviar:', JSON.stringify(datosRegistro, null, 2));
    
    // Hacer la petición POST a la API
    const response = await fetch('http://localhost:3001/api/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosRegistro)
    });
    
    const responseData = await response.json();
    
    console.log('\n📡 Respuesta de la API:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${responseData.success}`);
    console.log(`   Message: ${responseData.message}`);
    
    if (responseData.id) {
      console.log(`   ID: ${responseData.id}`);
    }
    
    if (responseData.error) {
      console.log(`   Error: ${responseData.error}`);
    }
    
    if (response.ok) {
      console.log('✅ Registro exitoso a través de la API');
    } else {
      console.log('❌ Error en el registro a través de la API');
    }
    
    // Verificar que se guardó en la base de datos
    console.log('\n🔍 Verificando en la base de datos...');
    
    // Aquí podrías hacer una consulta directa a la base de datos
    // para verificar que los datos se guardaron correctamente
    
  } catch (error) {
    console.error('❌ Error probando la API:', error.message);
    console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  }
}

testAPIRegistro();
