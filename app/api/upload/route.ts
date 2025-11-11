import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Solo se permiten PDF, DOC, DOCX, JPG y PNG' 
      }, { status: 400 })
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. Máximo 10MB' 
      }, { status: 400 })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    // Sanitizar nombre del archivo
    const sanitizedName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales
      .substring(0, 50) // Limitar longitud
    
    const fileName = `instituciones/documentos/${timestamp}_${sanitizedName}.${fileExtension}`

    // Subir a Vercel Blob
    console.log('📤 Subiendo archivo a Vercel Blob:', fileName)
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    })

    console.log('✅ Archivo subido a Vercel Blob:', blob.url)

    // Retornar información del archivo con URL pública de Vercel Blob
    return NextResponse.json({
      success: true,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: blob.url // URL pública de Vercel Blob
    })

  } catch (error) {
    console.error('❌ Error al subir archivo a Vercel Blob:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al subir el archivo',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
