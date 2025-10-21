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
      const uploadResponse = await fetch('/api/upload-cv', {
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
        title: "CV eliminado",
        description: "Tu CV ha sido eliminado exitosamente",
      })

      onCvUpdated(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al eliminar CV:", error)
      toast({
        title: "Error",
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
            Gestionar Curriculum Vitae
          </DialogTitle>
          <DialogDescription>
            Actualiza o elimina tu CV en formato PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* CV Actual */}
          {cvUrlActual && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">CV actual</p>
                    <a
                      href={cvUrlActual}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ver documento
                    </a>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar CV?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El CV será eliminado permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-700 hover:bg-red-800"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {/* Subir nuevo CV */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-900">
              {cvUrlActual ? "Reemplazar CV" : "Subir CV"}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
                disabled={isUploading}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-gray-400">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Requisitos:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Formato PDF únicamente</li>
                  <li>Tamaño máximo: 10MB</li>
                  <li>El CV anterior será reemplazado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setSelectedFile(null)
            }}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {cvUrlActual ? "Reemplazar CV" : "Subir CV"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
