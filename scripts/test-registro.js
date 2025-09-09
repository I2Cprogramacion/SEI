// Script para probar el registro de usuarios en Neon PostgreSQL
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function testRegistro() {
  try {
    console.log('🧪 Probando registro de usuarios...');
    
    // Datos de prueba
    const usuarioTest = {
      nombre_completo: 'Dr. Juan Pérez García',
      curp: 'PERG800101HDFXXX01',
      rfc: 'PERG800101XXX',
      no_cvu: '12345',
      correo: 'juan.perez@test.com',
      telefono: '5551234567',
      ultimo_grado_estudios: 'Doctorado',
      empleo_actual: 'Investigador Senior',
      linea_investigacion: 'Inteligencia Artificial',
      nacionalidad: 'Mexicana',
      fecha_nacimiento: '1980-01-01',
      fecha_registro: new Date().toISOString(),
      origen: 'test',
      archivo_procesado: 'test.pdf'
    };
    
    console.log('📝 Insertando usuario de prueba...');
    
    // Insertar usuario de prueba
    const result = await sql`
      INSERT INTO investigadores (
        nombre_completo, curp, rfc, no_cvu, correo, telefono, 
        ultimo_grado_estudios, empleo_actual, linea_investigacion, 
        nacionalidad, fecha_nacimiento, fecha_registro, origen, archivo_procesado
      ) VALUES (
        ${usuarioTest.nombre_completo}, ${usuarioTest.curp}, ${usuarioTest.rfc}, 
        ${usuarioTest.no_cvu}, ${usuarioTest.correo}, ${usuarioTest.telefono},
        ${usuarioTest.ultimo_grado_estudios}, ${usuarioTest.empleo_actual}, 
        ${usuarioTest.linea_investigacion}, ${usuarioTest.nacionalidad},
        ${usuarioTest.fecha_nacimiento}, ${usuarioTest.fecha_registro},
        ${usuarioTest.origen}, ${usuarioTest.archivo_procesado}
      ) RETURNING id, nombre_completo, correo
    `;
    
    console.log('✅ Usuario registrado exitosamente:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Nombre: ${result.rows[0].nombre_completo}`);
    console.log(`   Correo: ${result.rows[0].correo}`);
    
    // Verificar que se guardó correctamente
    const usuarioGuardado = await sql`
      SELECT * FROM investigadores WHERE id = ${result.rows[0].id}
    `;
    
    console.log('\n📊 Datos guardados en la base de datos:');
    Object.entries(usuarioGuardado.rows[0]).forEach(([key, value]) => {
      if (value !== null) {
        console.log(`   ${key}: ${value}`);
      }
    });
    
    // Probar duplicados
    console.log('\n🔄 Probando validación de duplicados...');
    
    try {
      await sql`
        INSERT INTO investigadores (
          nombre_completo, curp, rfc, no_cvu, correo, telefono, 
          ultimo_grado_estudios, empleo_actual, linea_investigacion, 
          nacionalidad, fecha_nacimiento, fecha_registro, origen, archivo_procesado
        ) VALUES (
          'Dr. Juan Pérez García', 'PERG800101HDFXXX01', 'PERG800101XXX', 
          '12345', 'juan.perez@test.com', '5551234567',
          'Doctorado', 'Investigador Senior', 'Inteligencia Artificial', 
          'Mexicana', '1980-01-01', NOW(), 'test', 'test.pdf'
        )
      `;
      console.log('❌ Error: Se permitió un duplicado');
    } catch (error) {
      if (error.message.includes('duplicate key value')) {
        console.log('✅ Validación de duplicados funcionando correctamente');
      } else {
        console.log('⚠️ Error inesperado en validación de duplicados:', error.message);
      }
    }
    
    // Contar total de registros
    const total = await sql`SELECT COUNT(*) FROM investigadores`;
    console.log(`\n📈 Total de investigadores en la base de datos: ${total.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testRegistro();
