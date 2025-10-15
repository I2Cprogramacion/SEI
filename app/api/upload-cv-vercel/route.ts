import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'edge' // Requerido para Vercel Blob

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO UPLOAD CV (VERCEL BLOB) ===");
    
    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log("Archivo recibido:", file ? file.name : "No hay archivo");

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "El archivo debe ser un PDF" }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 10MB" }, { status: 400 })
    }

    // Sanitizar nombre del archivo
    const timestamp = Date.now()
    const originalName = file.name.replace(/\.[^/.]+$/, "")
    const sanitizedName = originalName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 50)
    
    const fileName = `cvs/${sanitizedName}_${timestamp}.pdf`

    // Subir a Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public', // Acceso público para que sea visible
      addRandomSuffix: false, // No agregar sufijo random
    })

    console.log("✅ CV subido a Vercel Blob:", blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
    })

  } catch (error) {
    console.error("❌ Error al subir CV:", error)
    return NextResponse.json(
      { 
        error: "Error al procesar el archivo",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


