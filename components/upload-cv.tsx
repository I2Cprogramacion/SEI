"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, FileText, CheckCircle, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadCvProps {
  value?: string
  onChange: (url: string) => void
  nombreCompleto?: string
  showPreview?: boolean
}

export function UploadCv({ value, onChange, nombreCompleto, showPreview = true }: UploadCvProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(value || null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== INICIO UPLOAD CV ===")
    const file = e.target.files?.[0]
    console.log("1. Archivo seleccionado:", file ? file.name : "NINGUNO")
    
    if (!file) {
      console.log("No hay archivo, abortando")
      return
    }

    // Validar tipo de archivo
    console.log("2. Tipo de archivo:", file.type)
    if (file.type !== "application/pdf") {
      console.log("No es PDF")
      setError("Por favor selecciona un archivo PDF valido")
      return
    }

    // Validar tamaño (maximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    console.log("3. Tamano del archivo:", (file.size / 1024 / 1024).toFixed(2), "MB")
    if (file.size > maxSize) {
      console.log("Archivo muy grande")
      setError(`El archivo es demasiado grande. Tamano maximo: 10MB`)
      return
    }

    console.log("Validaciones pasadas")
    setError(null)
    setIsUploading(true)
    setFileName(file.name)
    setUploadMessage("Subiendo archivo...")

    try {
      // Subir a Vercel Blob (funciona en la nube)
      const formData = new FormData()
      formData.append("file", file)
      console.log("4. FormData creado")

      setUploadMessage("Subiendo archivo a Vercel Blob...")
      console.log("5. Enviando request a /api/upload-cv-vercel...")
      
      const response = await fetch("/api/upload-cv-vercel", {
        method: "POST",
        body: formData,
      })

      console.log("6. Response recibida - Status:", response.status)
      const result = await response.json()
      console.log("7. Result:", result)

      if (!response.ok) {
        console.log("Response no OK:", result.error)
        throw new Error(result.error || "Error al subir el archivo")
      }

      console.log("Archivo subido exitosamente")
      console.log("8. URL del CV:", result.url)
      setUploadMessage("Archivo subido. Actualizando base de datos...")
      
      // Actualizar con la URL de Vercel Blob
      console.log("9. Llamando onChange con URL...")
      onChange(result.url)
      setCvUrl(result.url)
      
      setUploadMessage("CV actualizado exitosamente! Recargando pagina...")
      console.log("Proceso completado")
    } catch (error) {
      console.error("ERROR EN UPLOAD CV:", error)
      console.error("Detalles:", error)
      setError(error instanceof Error ? error.message : "Error al subir el archivo")
      setCvUrl(null)
      setFileName(null)
      setUploadMessage("")
    } finally {
      setIsUploading(false)
      console.log("=== FIN UPLOAD CV ===")
    }
  }

  const handleRemove = () => {
    setCvUrl(null)
    setFileName(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleViewPdf = () => {
    if (cvUrl) {
      window.open(cvUrl, "_blank")
    }
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="cv-upload" className="text-blue-900 font-medium flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Curriculum Vitae (PDF)
      </Label>

      {/* Preview del archivo */}
      {showPreview && cvUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {fileName || "Curriculum Vitae"}
                </p>
                <p className="text-xs text-blue-600">PDF subido exitosamente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleViewPdf}
                className="text-blue-700 hover:bg-blue-100"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!isUploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Boton de upload */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          id="cv-upload"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo CV...
            </>
          ) : cvUrl ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Cambiar CV
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir CV (Opcional)
            </>
          )}
        </Button>
        <p className="text-xs text-blue-600">
          Formato: PDF. Tamano maximo: 10MB. Este archivo estara visible en tu perfil publico.
        </p>
      </div>

      {isUploading && uploadMessage && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-700">
            {uploadMessage}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {cvUrl && !error && !isUploading && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            CV cargado correctamente. Los visitantes de tu perfil podran visualizarlo.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
