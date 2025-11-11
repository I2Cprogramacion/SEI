import { NextRequest, NextResponse } from "next/server"
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary-config"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "El servicio de imágenes no está configurado. Contacta al administrador." },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "La imagen excede el tamaño máximo de 5MB" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "sei/instituciones",
            resource_type: "image",
            transformation: [
              { width: 1200, height: 675, crop: "fill", gravity: "auto" },
              { quality: "auto", fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          }
        )
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    })
  } catch (error) {
    console.error("❌ Error al subir imagen de institución:", error)
    return NextResponse.json(
      {
        error: "No se pudo procesar la imagen",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

