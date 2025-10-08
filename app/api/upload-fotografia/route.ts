import { NextRequest, NextResponse } from "next/server"
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary-config"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO UPLOAD FOTOGRAFÍA ===");
    
    // Verificar que Cloudinary esté configurado
    if (!isCloudinaryConfigured()) {
      console.error("❌ Cloudinary no está configurado correctamente");
      return NextResponse.json(
        { error: "El servicio de upload de imágenes no está configurado. Contacta al administrador." },
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
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "La imagen excede el tamaño máximo de 5MB" }, { status: 400 })
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Cloudinary
    console.log("Iniciando upload a Cloudinary...");
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "investigadores-fotografias",
            resource_type: "image",
            transformation: [
              { width: 500, height: 500, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" }
            ],
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

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error("❌ Error al subir imagen a Cloudinary:", error)
    console.error("Detalles del error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: "Error al procesar la imagen",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

