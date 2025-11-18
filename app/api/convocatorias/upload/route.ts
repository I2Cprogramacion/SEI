import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verificarAdmin } from "@/lib/auth/verificar-admin"

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminCheck = await verificarAdmin()
    
    if (!adminCheck.esAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para subir archivos de convocatorias. Solo los administradores pueden hacerlo." },
        { status: 403 }
      )
    }

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
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    // Sanitizar nombre del archivo
    const sanitizedName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales
      .substring(0, 50) // Limitar longitud
    
    const fileName = `convocatorias/bases/${timestamp}_${sanitizedName}`

    // Subir a Vercel Blob
    console.log('📤 Subiendo PDF de convocatoria a Vercel Blob:', fileName)
    const blob = await put(fileName, file, {
      access: "public",
      contentType: "application/pdf",
    })

    console.log("✅ PDF de convocatoria subido a Vercel Blob:", blob.url)

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Error al subir PDF de convocatoria a Vercel Blob:", error)
    return NextResponse.json({
      error: `Error al subir el archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}

