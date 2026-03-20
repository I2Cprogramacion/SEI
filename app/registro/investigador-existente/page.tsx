"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  name: string
  size: number
  type: string
  url?: string
}

export default function InvestigadorExistenteRegistroPage() {
  const [dictamenFile, setDictamenFile] = useState<UploadedFile | null>(null)
  const [publicacionesFile, setPublicacionesFile] = useState<UploadedFile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const handleFileChange = (file: File | null, type: "dictamen" | "publicaciones") => {
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo es muy grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      return
    }

    const uploadedFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
    }

    if (type === "dictamen") {
      setDictamenFile(uploadedFile)
    } else {
      setPublicacionesFile(uploadedFile)
    }

    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!dictamenFile && !publicacionesFile) {
      setError("Debes subir al menos un documento")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Aquí iría la lógica de upload a la BD
      // Por ahora es un placeholder
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setDictamenFile(null)
      setPublicacionesFile(null)
    } catch (err) {
      setError("Error al subir los archivos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/registro" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            ← Volver a opciones
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Actualiza tu Perfil
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Como miembro del SEI, puedes subir tu Dictamen SNII y tu Perfil Único (Publicaciones)
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-400">¡Archivos subidos exitosamente!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Tus documentos han sido procesados y agregados a tu perfil.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Form */}
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white">
                <FileText className="h-5 w-5" />
                Subir Documentos
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sube tus documentos académicos para actualizar tu registro
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Dictamen Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Dictamen SNII (PDF, máximo 5MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null, "dictamen")}
                      className="hidden"
                      id="dictamen-input"
                      disabled={isLoading}
                    />
                    <label htmlFor="dictamen-input" className="cursor-pointer block">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Haz clic para seleccionar o arrastra tu archivo
                      </p>
                    </label>
                  </div>
                  {dictamenFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300">{dictamenFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Publicaciones Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Perfil Único / Publicaciones (PDF, máximo 5MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null, "publicaciones")}
                      className="hidden"
                      id="publicaciones-input"
                      disabled={isLoading}
                    />
                    <label htmlFor="publicaciones-input" className="cursor-pointer block">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Haz clic para seleccionar o arrastra tu archivo
                      </p>
                    </label>
                  </div>
                  {publicacionesFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300">{publicacionesFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading || (!dictamenFile && !publicacionesFile)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Documentos
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      setDictamenFile(null)
                      setPublicacionesFile(null)
                      setSuccess(false)
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-400">Información importante</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <p>• Los archivos PDF se procesarán automáticamente</p>
              <p>• Máximo tamaño: 5MB por archivo</p>
              <p>• Puedes subir uno o ambos documentos</p>
              <p>• Se requiere verificación de correo electrónico</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
