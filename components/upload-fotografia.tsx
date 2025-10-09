"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface UploadFotografiaProps {
  value?: string
  onChange: (url: string) => void
  nombreCompleto?: string
}

export function UploadFotografia({ value, onChange, nombreCompleto }: UploadFotografiaProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida (JPG, PNG, etc.)")
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError(`La imagen es demasiado grande. Tamaño máximo: 5MB`)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Crear preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Subir a Cloudinary
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-fotografia", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al subir la imagen")
      }

      // Actualizar con la URL de Cloudinary
      onChange(result.url)
      setPreview(result.url)
    } catch (error) {
      console.error("Error al subir imagen:", error)
      setError(error instanceof Error ? error.message : "Error al subir la imagen")
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getInitials = () => {
    if (!nombreCompleto) return "IN"
    return nombreCompleto
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="fotografia" className="text-blue-900 font-medium flex items-center gap-2">
        <User className="h-4 w-4" />
        Fotografía de Perfil
      </Label>

      <div className="flex items-center gap-6">
        {/* Preview de la imagen */}
        <div className="relative">
          <Avatar className="h-24 w-24 ring-2 ring-blue-100">
            {preview ? (
              <AvatarImage src={preview} alt="Fotografía de perfil" />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>
          {preview && !isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              aria-label="Eliminar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Botón de upload */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            id="fotografia"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {preview ? "Cambiar fotografía" : "Subir fotografía"}
              </>
            )}
          </Button>
          <p className="text-xs text-blue-600">
            Formatos: JPG, PNG. Tamaño máximo: 5MB
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

