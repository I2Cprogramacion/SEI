import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se encontró el archivo" }, { status: 400 })
    }

    // Validar que sea un PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo es demasiado grande. Tamaño máximo: 10MB" }, { status: 400 })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileName = `cv-${timestamp}-${file.name}`

    // Subir a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log("✅ Archivo subido a Vercel Blob:", blob.url)

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Error al subir archivo a Vercel Blob:", error)
    return NextResponse.json({
      error: `Error al subir el archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
