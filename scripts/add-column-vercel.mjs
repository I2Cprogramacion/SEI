/**
 * Script para agregar la columna ultima_actividad usando @vercel/postgres
 * Ejecutar con: node scripts/add-column-vercel.js
 */

import { sql } from '@vercel/postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function addLastActiveColumn() {
  try {
    console.log('🔄 Conectando a la base de datos (Vercel Postgres)...')
    
    // Verificar estructura actual
    const checkColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'investigadores'
      ORDER BY ordinal_position
    `
    
    console.log('📋 Total de columnas:', checkColumns.rows.length)
    
    const hasColumn = checkColumns.rows.some(col => col.column_name === 'ultima_actividad')
    console.log('¿Tiene columna ultima_actividad?', hasColumn)

    if (!hasColumn) {
      // Agregar columna si no existe
      console.log('\n⏳ Agregando columna ultima_actividad...')
      await sql`
        ALTER TABLE investigadores 
        ADD COLUMN ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `
      console.log('✅ Columna ultima_actividad agregada exitosamente')

      // Actualizar valores existentes
      await sql`
        UPDATE investigadores 
        SET ultima_actividad = fecha_registro 
        WHERE ultima_actividad IS NULL
      `
      console.log('✅ Valores existentes actualizados')

      // Crear índice para mejor rendimiento
      await sql`
        CREATE INDEX IF NOT EXISTS idx_investigadores_ultima_actividad 
        ON investigadores(ultima_actividad DESC)
      `
      console.log('✅ Índice creado para mejor rendimiento')
    } else {
      console.log('✅ La columna ultima_actividad ya existe')
      
      // Verificar que tiene índice
      const checkIndex = await sql`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'investigadores' 
          AND indexname = 'idx_investigadores_ultima_actividad'
      `
      
      if (checkIndex.rows.length === 0) {
        await sql`
          CREATE INDEX idx_investigadores_ultima_actividad 
          ON investigadores(ultima_actividad DESC)
        `
        console.log('✅ Índice creado')
      } else {
        console.log('✅ Índice ya existe')
      }
    }

    console.log('\n✅ Migración completada exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  }
}

addLastActiveColumn()
