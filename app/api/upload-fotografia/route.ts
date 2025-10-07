import { NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary-config"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
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
            if (error) reject(error)
            else resolve(result)
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
    console.error("Error al subir imagen a Cloudinary:", error)
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    )
  }
}

