"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, FileText, Loader2, Plus, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CrearConvocatoriaDialogProps {
  onConvocatoriaCreada?: () => void
}

export function CrearConvocatoriaDialog({ onConvocatoriaCreada }: CrearConvocatoriaDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const { toast } = useToast()

  // Ref para prevenir múltiples ejecuciones
  const hasCheckedRef = useRef(false)

  // Verificar si el usuario es admin
  useEffect(() => {
    // Prevenir múltiples ejecuciones
    if (hasCheckedRef.current) {
      console.log('⚠️ [checkAdmin] Ya se verificó, evitando ejecución duplicada')
      return
    }

    let isMounted = true
    hasCheckedRef.current = true

    const checkAdmin = async () => {
      try {
        console.log('🔍 Verificando si el usuario es admin...')
        const response = await fetch('/api/admin/verificar', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        console.log('📡 Respuesta de /api/admin/verificar:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Error al verificar admin:', {
            status: response.status,
            error: errorData
          })
          if (isMounted) {
            setIsAdmin(false)
            setIsCheckingAdmin(false)
          }
          return
        }

        const data = await response.json().catch(() => ({}))
        console.log('📦 Datos recibidos de la API:', data)
        
        const esAdminFlag = Boolean(data?.esAdmin ?? data?.es_admin)
        console.log('✅ Resultado de verificación admin:', esAdminFlag)

        if (isMounted) {
          setIsAdmin(esAdminFlag)
          setIsCheckingAdmin(false)
        }
      } catch (error) {
        console.error('❌ Error al verificar admin:', error)
        if (isMounted) {
          setIsAdmin(false)
          setIsCheckingAdmin(false)
        }
      }
    }

    checkAdmin()

    return () => {
      isMounted = false
    }
  }, [])

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaCierre: "",
    categoria: "",
    categoriaOtra: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo no debe superar los 10MB",
          variant: "destructive",
        })
        return
      }
      setPdfFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titulo || !formData.fechaInicio || !formData.fechaCierre) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive",
      })
      return
    }

    if (formData.categoria === "Otros" && !formData.categoriaOtra.trim()) {
      toast({
        title: "Error",
        description: "Por favor especifica la categoría",
        variant: "destructive",
      })
      return
    }

    if (new Date(formData.fechaCierre) < new Date(formData.fechaInicio)) {
      toast({
        title: "Error",
        description: "La fecha de cierre debe ser posterior a la fecha de inicio",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Subir PDF si existe
      let pdfUrl = ""
      if (pdfFile) {
        const pdfFormData = new FormData()
        pdfFormData.append("file", pdfFile)

        const uploadResponse = await fetch("/api/convocatorias/upload", {
          method: "POST",
          body: pdfFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al subir el PDF")
        }

        const uploadData = await uploadResponse.json()
        pdfUrl = uploadData.url
      }

      // Crear convocatoria
      const categoriaFinal = formData.categoria === "Otros" ? formData.categoriaOtra : formData.categoria
      
      const response = await fetch("/api/convocatorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categoria: categoriaFinal,
          pdfUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al crear la convocatoria")
      }

      toast({
        title: "¡Éxito!",
        description: "Convocatoria creada correctamente",
      })

      // Resetear formulario
      setFormData({
        titulo: "",
        descripcion: "",
        fechaInicio: "",
        fechaCierre: "",
        categoria: "",
        categoriaOtra: "",
      })
      setPdfFile(null)

      setOpen(false)

      // Llamar callback para refrescar la lista
      if (onConvocatoriaCreada) {
        onConvocatoriaCreada()
      }
    } catch (error) {
      console.error("Error al crear convocatoria:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la convocatoria",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-blue-700 text-white hover:bg-blue-800"
          disabled={isCheckingAdmin}
        >
          {isCheckingAdmin ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Convocatoria
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isCheckingAdmin ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-red-100 p-4 mb-4">
              <svg
                className="h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <DialogTitle className="text-center mb-2">Acceso Denegado</DialogTitle>
            <DialogDescription className="text-center text-base">
              No tiene acceso para crear convocatorias. Solo los administradores pueden crear nuevas convocatorias.
            </DialogDescription>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Crear Nueva Convocatoria</DialogTitle>
              <DialogDescription>
                Completa los datos de la convocatoria y adjunta el archivo PDF con las bases
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                placeholder="Nombre de la convocatoria"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Investigación Básica">Investigación Básica</SelectItem>
                  <SelectItem value="Investigación Aplicada">Investigación Aplicada</SelectItem>
                  <SelectItem value="Desarrollo Tecnológico">Desarrollo Tecnológico</SelectItem>
                  <SelectItem value="Innovación">Innovación</SelectItem>
                  <SelectItem value="Becas">Becas</SelectItem>
                  <SelectItem value="Estancias">Estancias</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.categoria === "Otros" && (
              <div className="space-y-2">
                <Label htmlFor="categoriaOtra">
                  Especifica la categoría <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="categoriaOtra"
                  placeholder="Escribe la categoría"
                  value={formData.categoriaOtra}
                  onChange={(e) => handleInputChange("categoriaOtra", e.target.value)}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaCierre">
                  Fecha de Cierre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fechaCierre"
                  type="date"
                  value={formData.fechaCierre}
                  onChange={(e) => handleInputChange("fechaCierre", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción breve de la convocatoria"
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf">Archivo PDF (Bases de la convocatoria)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {pdfFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span className="truncate max-w-[150px]">{pdfFile.name}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Tamaño máximo: 10MB</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-700 text-white hover:bg-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Convocatoria
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

