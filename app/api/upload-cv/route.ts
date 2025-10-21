import { NextRequest, NextResponse } from "next/server"
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary-config"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO UPLOAD CV ===");
    
    // Verificar que Cloudinary esté configurado
    if (!isCloudinaryConfigured()) {
      console.error("❌ Cloudinary no está configurado correctamente");
      return NextResponse.json(
        { error: "El servicio de upload de archivos no está configurado. Contacta al administrador." },
        { status: 503 }
      )
    }
    
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

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Usar el nombre original del archivo (sanitizado)
    const timestamp = Date.now()
    const originalName = file.name.replace(/\.[^/.]+$/, "") // Remover extensión
    const sanitizedName = originalName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-zA-Z0-9_-]/g, "_")  // Reemplazar caracteres especiales
      .substring(0, 50) // Limitar longitud
    const publicId = `${sanitizedName}_${timestamp}`

    // Subir a Cloudinary
    console.log("Iniciando upload a Cloudinary...");
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "investigadores-cvs",
            resource_type: "raw", // Para PDFs usamos "raw" en lugar de "image"
            public_id: publicId,
            format: "pdf",
            access_mode: "public", // IMPORTANTE: Hacer el archivo público
            type: "upload",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Error en Cloudinary:", error);
              reject(error)
            } else {
              console.log("✅ Upload exitoso:", result?.secure_url);
              resolve(result)
            }
          }
        )
        .end(buffer)
    })

    // Generar URL firmada que funciona sin restricciones de privacidad
    const signedUrl = cloudinary.url(result.public_id, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 años
    });

    return NextResponse.json({
      success: true,
      url: signedUrl, // Usar URL firmada en lugar de secure_url
      publicId: result.public_id,
      fileName: file.name,
    })
  } catch (error) {
    console.error("❌ Error al subir CV a Cloudinary:", error)
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

