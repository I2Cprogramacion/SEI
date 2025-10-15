/**
 * Script para crear un trigger que genera slugs automáticamente
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function crearTriggerSlug() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔄 Creando función y trigger para slugs automáticos...\n')
    
    // Crear función para generar slug
    await pool.query(`
      CREATE OR REPLACE FUNCTION generar_slug_investigador()
      RETURNS TRIGGER AS $$
      DECLARE
        base_slug TEXT;
        nuevo_slug TEXT;
        slug_existe INT;
      BEGIN
        -- Solo generar slug si no existe uno
        IF NEW.slug IS NULL OR NEW.slug = '' THEN
          -- Generar slug base desde nombre_completo
          base_slug := lower(trim(NEW.nombre_completo));
          base_slug := translate(base_slug, 
            'áéíóúàèìòùäëïöüâêîôûñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑÇ',
            'aeiouaeiouaeiouaeiounceeiouaeiouaeiouaeiounce'
          );
          base_slug := regexp_replace(base_slug, '[^a-z0-9\\s-]', '', 'g');
          base_slug := regexp_replace(base_slug, '\\s+', '-', 'g');
          base_slug := regexp_replace(base_slug, '-+', '-', 'g');
          
          -- Verificar si el slug ya existe
          nuevo_slug := base_slug;
          SELECT COUNT(*) INTO slug_existe 
          FROM investigadores 
          WHERE slug = nuevo_slug AND id != COALESCE(NEW.id, -1);
          
          -- Si existe, agregar el ID
          IF slug_existe > 0 THEN
            nuevo_slug := base_slug || '-' || NEW.id;
          END IF;
          
          NEW.slug := nuevo_slug;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)
    
    console.log('✅ Función generar_slug_investigador() creada')

    // Eliminar trigger si existe
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_generar_slug ON investigadores;
    `)

    // Crear trigger para INSERT y UPDATE
    await pool.query(`
      CREATE TRIGGER trigger_generar_slug
      BEFORE INSERT OR UPDATE OF nombre_completo
      ON investigadores
      FOR EACH ROW
      EXECUTE FUNCTION generar_slug_investigador();
    `)
    
    console.log('✅ Trigger creado exitosamente')
    
    console.log('\n📋 Comportamiento:')
    console.log('   • Cada vez que se inserte un investigador, se genera su slug automáticamente')
    console.log('   • Si se actualiza el nombre, se actualiza el slug')
    console.log('   • Si el slug ya existe, se agrega el ID al final')
    
    console.log('\n✅ Sistema de slugs automático configurado')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

crearTriggerSlug()
