import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO UPLOAD CV LOCAL ===");
    
    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log("Archivo recibido:", file ? file.name : "No hay archivo");

    if (!file) {
      console.log("❌ No se proporcionó archivo");
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

    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'cvs')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
      console.log("✅ Directorio de CVs creado:", uploadsDir);
    }

    // Usar el nombre original del archivo (sanitizado)
    const timestamp = Date.now()
    const originalName = file.name.replace(/\.[^/.]+$/, "") // Remover extensión
    const sanitizedName = originalName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-zA-Z0-9_-]/g, "_")  // Reemplazar caracteres especiales
      .substring(0, 50) // Limitar longitud
    
    const fileName = `${sanitizedName}_${timestamp}.pdf`
    const filePath = join(uploadsDir, fileName)

    // Convertir archivo a buffer y guardarlo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log("✅ CV guardado exitosamente:", fileName);

    // Retornar URL local del archivo
    const url = `/uploads/cvs/${fileName}`

    return NextResponse.json({
      success: true,
      url: url,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
    })

  } catch (error) {
    console.error("❌ Error al subir CV:", error)
    console.error("Detalles del error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: "Error al procesar el archivo",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


