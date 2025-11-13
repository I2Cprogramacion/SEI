"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, FileText, CheckCircle, Eye, CloudUpload } from "lucide-react"
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

  const uploadFile = async (file: File) => {
    console.log("=== INICIO UPLOAD CV ===")
    console.log("1. Archivo seleccionado:", file.name)

    // Validar tipo de archivo
    console.log("2. Tipo de archivo:", file.type)
    if (file.type !== "application/pdf") {
      console.log("No es PDF")
      setError("Por favor selecciona un archivo PDF válido")
      return
    }

    // Validar tamaño (maximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    console.log("3. Tamaño del archivo:", (file.size / 1024 / 1024).toFixed(2), "MB")
    if (file.size > maxSize) {
      console.log("Archivo muy grande")
      setError(`El archivo es demasiado grande. Tamaño máximo: 10MB`)
      return
    }

    console.log("Validaciones pasadas")
    setError(null)
    setIsUploading(true)
    setFileName(file.name)
    setUploadMessage("Subiendo archivo...")

    try {
      // Subir a Vercel Blob
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
      
      setUploadMessage("CV actualizado exitosamente!")
      console.log("Proceso completado")
    } catch (error) {
      console.error("ERROR EN UPLOAD CV:", error)
      setError(error instanceof Error ? error.message : "Error al subir el archivo")
      setCvUrl(null)
      setFileName(null)
      setUploadMessage("")
    } finally {
      setIsUploading(false)
      console.log("=== FIN UPLOAD CV ===")
    }
  }

  // Configurar react-dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isUploading,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0])
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection) {
        const errorCode = rejection.errors[0]?.code
        if (errorCode === 'file-too-large') {
          setError('El archivo es demasiado grande. Tamaño máximo: 10MB')
        } else if (errorCode === 'file-invalid-type') {
          setError('Formato inválido. Solo se permiten archivos PDF')
        } else {
          setError('Error al procesar el archivo')
        }
      }
    }
  })

  const handleRemove = () => {
    setCvUrl(null)
    setFileName(null)
    onChange("")
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

      {/* Zona de Drag & Drop */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${!isDragActive && !isDragReject ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} id="cv-upload" />
        
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-blue-900">Subiendo CV...</p>
              <p className="text-xs text-blue-600">{uploadMessage}</p>
            </>
          ) : isDragActive && !isDragReject ? (
            <>
              <CloudUpload className="h-12 w-12 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Suelta el PDF aquí</p>
              <p className="text-xs text-blue-600">El archivo se subirá automáticamente</p>
            </>
          ) : isDragReject ? (
            <>
              <X className="h-12 w-12 text-red-600" />
              <p className="text-sm font-medium text-red-900">Archivo no válido</p>
              <p className="text-xs text-red-600">Solo se permiten archivos PDF de máximo 10MB</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {cvUrl ? 'Arrastra un nuevo PDF o haz clic para cambiar' : 'Arrastra un PDF aquí o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Formato: PDF • Tamaño máximo: 10MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-100 mt-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar archivo
              </Button>
            </>
          )}
        </div>
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
            CV cargado correctamente. Los visitantes de tu perfil podrán visualizarlo.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-gray-500">
        💡 <strong>Consejo:</strong> Puedes arrastrar y soltar el PDF directamente en la zona de carga o hacer clic para seleccionarlo.
      </p>
    </div>
  )
}
