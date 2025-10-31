"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, Trash2, FileText, AlertCircle } from "lucide-react"

interface GestionarCvDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cvUrlActual?: string
  onCvUpdated: (newUrl: string | null) => void
}

export function GestionarCvDialog({
  open,
  onOpenChange,
  cvUrlActual,
  onCvUpdated,
}: GestionarCvDialogProps) {
  const { userId } = useAuth()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Archivo inválido",
        description: "Solo se permiten archivos PDF",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El CV no debe superar los 10MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !userId) return

    setIsUploading(true)

    try {
      // Usar FormData para subir el archivo
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Subir a Vercel Blob a través del API
      const uploadResponse = await fetch('/api/upload-cv-vercel', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el archivo')
      }

      const { url } = await uploadResponse.json()

      // Actualizar en la base de datos
      const response = await fetch("/api/investigadores/update-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv_url: url,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar CV en la base de datos")
      }

      toast({
        title: "¡CV actualizado!",
        description: "Tu CV ha sido actualizado exitosamente",
      })

      onCvUpdated(url)
      onOpenChange(false)
      setSelectedFile(null)
    } catch (error) {
      console.error("Error al subir CV:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el CV. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!cvUrlActual || !userId) return

    setIsDeleting(true)

    try {
      // Actualizar en la base de datos (establecer a null)
      const response = await fetch("/api/investigadores/update-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv_url: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al eliminar CV de la base de datos")
      }

      toast({
        title: "✅ CV eliminado",
        description: "Tu CV ha sido eliminado exitosamente",
      })

      // Cerrar ambos diálogos
      setShowDeleteDialog(false)
      onCvUpdated(null)
      
      // Esperar un momento antes de cerrar el diálogo principal
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (error) {
      console.error("Error al eliminar CV:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el CV. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Perfil Único del Registro
          </DialogTitle>
          <DialogDescription>
            Tu Perfil Único fue procesado automáticamente durante el registro. Aquí puedes verlo o actualizarlo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* CV Actual */}
          {cvUrlActual && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-10 w-10 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-900 mb-1">Perfil Único del registro</p>
                    <p className="text-sm text-blue-700">
                      Documento procesado automáticamente durante tu registro
                    </p>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(cvUrlActual, "_blank", "noopener,noreferrer")
                    }}
                    className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver documento
                  </Button>
                  
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        disabled={isDeleting}
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-[425px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900">
                          ¿Eliminar CV?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                          Esta acción no se puede deshacer. El CV será eliminado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel 
                          className="mt-0"
                          onClick={() => setShowDeleteDialog(false)}
                        >
                          Cancelar
                        </AlertDialogCancel>
                        <Button
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Eliminando...
                            </>
                          ) : (
                            "Eliminar"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}

          {/* Subir nuevo CV */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {cvUrlActual ? "Reemplazar CV" : "Subir CV"}
            </h3>
            
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gradient-to-r file:from-blue-600 file:to-blue-700
                    file:text-white
                    hover:file:from-blue-700 hover:file:to-blue-800
                    file:cursor-pointer
                    cursor-pointer
                    border border-gray-300 rounded-lg p-2"
                  disabled={isUploading}
                />
              </label>
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-500" />
              <div>
                <p className="font-semibold text-gray-700 mb-1">Requisitos:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Formato PDF únicamente</li>
                  <li>Tamaño máximo: 10MB</li>
                  {cvUrlActual && <li>El CV anterior será reemplazado</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setSelectedFile(null)
            }}
            disabled={isUploading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {selectedFile ? (cvUrlActual ? "Reemplazar CV" : "Subir CV") : "Selecciona un archivo"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
