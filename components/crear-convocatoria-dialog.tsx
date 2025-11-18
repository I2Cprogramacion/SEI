"use client"

import { useState, useEffect } from "react"
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

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/verificar')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.esAdmin || false)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error al verificar admin:', error)
        setIsAdmin(false)
      } finally {
        setIsCheckingAdmin(false)
      }
    }

    checkAdmin()
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

  // Si no es admin, no mostrar el botón
  if (isCheckingAdmin) {
    return null
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 text-white hover:bg-blue-800">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Convocatoria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
      </DialogContent>
    </Dialog>
  )
}

