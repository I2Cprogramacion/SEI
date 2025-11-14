"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { Loader2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EditarPublicacionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicacionId: number
  onPublicacionUpdated: () => void
}

interface Publicacion {
  id: number
  titulo: string
  autor: string
  institucion?: string
  revista?: string
  año_creacion?: number
  volumen?: string
  numero?: string
  paginas?: string
  doi?: string
  resumen?: string
  palabras_clave?: string
  categoria?: string
  tipo?: string
  acceso?: string
  archivo_url?: string
}

export function EditarPublicacionDialog({
  open,
  onOpenChange,
  publicacionId,
  onPublicacionUpdated,
}: EditarPublicacionDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState<Partial<Publicacion>>({})

  // Cargar datos de la publicación
  useEffect(() => {
    if (open && publicacionId) {
      loadPublicacion()
    }
  }, [open, publicacionId])

  const loadPublicacion = async () => {
    try {
      setLoadingData(true)
      const response = await fetch(`/api/publicaciones/${publicacionId}`)
      
      if (!response.ok) {
        throw new Error("Error al cargar la publicación")
      }
      
      const data = await response.json()
      // El endpoint devuelve { publicacion: {...} }
      const publicacion = data.publicacion || data
      
      // Convertir palabras_clave de string a string si viene como array
      if (Array.isArray(publicacion.palabras_clave)) {
        publicacion.palabras_clave = publicacion.palabras_clave.join(', ')
      }
      
      setFormData(publicacion)
      console.log('📝 Datos cargados para editar:', publicacion)
    } catch (error) {
      console.error("Error loading publicacion:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la publicación",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/publicaciones/${publicacionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la publicación")
      }

      toast({
        title: "¡Éxito!",
        description: "Publicación actualizada correctamente",
      })

      onPublicacionUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating publicacion:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la publicación",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof Publicacion,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Publicación</DialogTitle>
          <DialogDescription>
            Actualiza la información de tu publicación
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo || ""}
                onChange={(e) => handleChange("titulo", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autor">Autores *</Label>
              <Input
                id="autor"
                value={formData.autor || ""}
                onChange={(e) => handleChange("autor", e.target.value)}
                placeholder="Separados por comas"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revista">Revista</Label>
                <Input
                  id="revista"
                  value={formData.revista || ""}
                  onChange={(e) => handleChange("revista", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="año_creacion">Año</Label>
                <Input
                  id="año_creacion"
                  type="number"
                  value={formData.año_creacion || ""}
                  onChange={(e) =>
                    handleChange("año_creacion", parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volumen">Volumen</Label>
                <Input
                  id="volumen"
                  value={formData.volumen || ""}
                  onChange={(e) => handleChange("volumen", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero || ""}
                  onChange={(e) => handleChange("numero", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paginas">Páginas</Label>
                <Input
                  id="paginas"
                  value={formData.paginas || ""}
                  onChange={(e) => handleChange("paginas", e.target.value)}
                  placeholder="ej: 1-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                value={formData.doi || ""}
                onChange={(e) => handleChange("doi", e.target.value)}
                placeholder="10.xxxx/xxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumen">Resumen</Label>
              <Textarea
                id="resumen"
                value={formData.resumen || ""}
                onChange={(e) => handleChange("resumen", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="palabras_clave">Palabras Clave</Label>
              <Input
                id="palabras_clave"
                value={formData.palabras_clave || ""}
                onChange={(e) => handleChange("palabras_clave", e.target.value)}
                placeholder="Separadas por comas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoria || ""}
                  onValueChange={(value) => handleChange("categoria", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Artículo">Artículo</SelectItem>
                    <SelectItem value="Libro">Libro</SelectItem>
                    <SelectItem value="Capítulo">Capítulo</SelectItem>
                    <SelectItem value="Conferencia">Conferencia</SelectItem>
                    <SelectItem value="Tesis">Tesis</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acceso">Acceso</Label>
                <Select
                  value={formData.acceso || ""}
                  onValueChange={(value) => handleChange("acceso", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de acceso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abierto">Abierto</SelectItem>
                    <SelectItem value="Restringido">Restringido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archivo_url">URL del Archivo</Label>
              <Input
                id="archivo_url"
                value={formData.archivo_url || ""}
                onChange={(e) => handleChange("archivo_url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institucion">Institución</Label>
              <Input
                id="institucion"
                value={formData.institucion || ""}
                onChange={(e) => handleChange("institucion", e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
