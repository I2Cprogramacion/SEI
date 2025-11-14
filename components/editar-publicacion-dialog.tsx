"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Plus, X } from "lucide-react"
import { toast } from "sonner"

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
  issn?: string
  isbn?: string
  url?: string
  resumen?: string
  abstract?: string
  palabras_clave?: string
  categoria?: string
  tipo?: string
  acceso?: string
  idioma?: string
  revista_indexada?: string
  archivo_url?: string
  enlace_externo?: string
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
  const [palabraClave, setPalabraClave] = useState("")
  const [palabrasClave, setPalabrasClave] = useState<string[]>([])
  const [formData, setFormData] = useState<Partial<Publicacion>>({})

  // Categorías y tipos (mismo que en crear)
  const categorias = [
    "Ciencias Naturales",
    "Ingeniería y Tecnología",
    "Ciencias Médicas y de la Salud",
    "Ciencias Sociales",
    "Humanidades y Artes",
    "Ciencias Agrícolas",
    "Ciencias Exactas",
    "Multidisciplinario",
    "Otro"
  ]

  const tipos = [
    "Artículo de investigación",
    "Artículo de revisión",
    "Artículo corto",
    "Nota técnica",
    "Carta al editor",
    "Editorial",
    "Libro",
    "Capítulo de libro",
    "Memoria de conferencia",
    "Tesis",
    "Reporte técnico",
    "Otro"
  ]

  const accesos = ["Abierto", "Restringido", "Híbrido"]
  const idiomas = ["Español", "Inglés", "Francés", "Alemán", "Portugués", "Italiano", "Otro"]
  const indices = ["Scopus", "Web of Science", "SciELO", "DOAJ", "PubMed", "IEEE Xplore", "Google Scholar", "Latindex", "Redalyc", "No indexada", "Otro"]

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
      
      // Convertir palabras_clave a array si viene como string
      let palabrasClaveArray: string[] = []
      if (publicacion.palabras_clave) {
        if (Array.isArray(publicacion.palabras_clave)) {
          palabrasClaveArray = publicacion.palabras_clave
        } else if (typeof publicacion.palabras_clave === 'string') {
          palabrasClaveArray = publicacion.palabras_clave.split(',').map((p: string) => p.trim()).filter(Boolean)
        }
      }
      
      setPalabrasClave(palabrasClaveArray)
      setFormData(publicacion)
      console.log('📝 Datos cargados para editar:', publicacion)
      console.log('📝 Palabras clave:', palabrasClaveArray)
    } catch (error) {
      console.error("Error loading publicacion:", error)
      toast.error("Error", {
        description: "No se pudo cargar la publicación"
      })
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar datos para enviar
      const updateData = {
        ...formData,
        palabras_clave: palabrasClave.join(', '), // Convertir array a string
        año_creacion: formData.año_creacion ? parseInt(String(formData.año_creacion)) : undefined
      }

      const response = await fetch(`/api/publicaciones/${publicacionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la publicación")
      }

      toast.success("¡Éxito!", {
        description: "Publicación actualizada correctamente"
      })

      onPublicacionUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating publicacion:", error)
      toast.error("Error", {
        description: "No se pudo actualizar la publicación"
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

  const handleAddPalabraClave = () => {
    if (palabraClave.trim() && !palabrasClave.includes(palabraClave.trim())) {
      setPalabrasClave([...palabrasClave, palabraClave.trim()])
      setPalabraClave("")
    }
  }

  const handleRemovePalabraClave = (palabra: string) => {
    setPalabrasClave(palabrasClave.filter(p => p !== palabra))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-900 text-xl">Editar Publicación</DialogTitle>
          <DialogDescription>
            Actualiza la información de tu publicación
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Información Básica</h3>
              
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo || ""}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select value={formData.categoria || ""} onValueChange={(value) => handleChange("categoria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Publicación *</Label>
                  <Select value={formData.tipo || ""} onValueChange={(value) => handleChange("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Autores */}
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

            {/* Revista e Institución */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revista">Revista o Editorial *</Label>
                <Input
                  id="revista"
                  value={formData.revista || ""}
                  onChange={(e) => handleChange("revista", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institucion">Institución *</Label>
                <Input
                  id="institucion"
                  value={formData.institucion || ""}
                  onChange={(e) => handleChange("institucion", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Detalles de Publicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Detalles de Publicación</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="año_creacion">Año *</Label>
                  <Input
                    id="año_creacion"
                    type="number"
                    value={formData.año_creacion || ""}
                    onChange={(e) => handleChange("año_creacion", parseInt(e.target.value))}
                    required
                  />
                </div>

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
                    placeholder="1-10"
                  />
                </div>
              </div>
            </div>

            {/* Identificadores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Identificadores y Enlaces</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doi">DOI</Label>
                  <Input
                    id="doi"
                    value={formData.doi || ""}
                    onChange={(e) => handleChange("doi", e.target.value)}
                    placeholder="10.1234/example"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issn">ISSN</Label>
                  <Input
                    id="issn"
                    value={formData.issn || ""}
                    onChange={(e) => handleChange("issn", e.target.value)}
                    placeholder="1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn || ""}
                    onChange={(e) => handleChange("isbn", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url || ""}
                    onChange={(e) => handleChange("url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Resumen</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resumen">Resumen *</Label>
                  <Textarea
                    id="resumen"
                    value={formData.resumen || ""}
                    onChange={(e) => handleChange("resumen", e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract (Opcional)</Label>
                  <Textarea
                    id="abstract"
                    value={formData.abstract || ""}
                    onChange={(e) => handleChange("abstract", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Palabras Clave */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-900">Palabras Clave</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar palabra clave..."
                  value={palabraClave}
                  onChange={(e) => setPalabraClave(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddPalabraClave()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddPalabraClave}
                  variant="outline"
                  disabled={!palabraClave.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {palabrasClave.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-md">
                  {palabrasClave.map((palabra, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {palabra}
                      <button
                        type="button"
                        onClick={() => handleRemovePalabraClave(palabra)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Configuración Adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Configuración Adicional</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acceso">Tipo de Acceso</Label>
                  <Select value={formData.acceso || "Abierto"} onValueChange={(value) => handleChange("acceso", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accesos.map((acc) => (
                        <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select value={formData.idioma || "Español"} onValueChange={(value) => handleChange("idioma", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {idiomas.map((idioma) => (
                        <SelectItem key={idioma} value={idioma}>{idioma}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revista_indexada">Indexación</Label>
                  <Select value={formData.revista_indexada || ""} onValueChange={(value) => handleChange("revista_indexada", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {indices.map((indice) => (
                        <SelectItem key={indice} value={indice}>{indice}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Enlaces a archivos */}
            {(formData.archivo_url || formData.enlace_externo) && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900">
                  {formData.archivo_url && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Archivo adjunto:</span>
                      <a href={formData.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        {formData.archivo_url}
                      </a>
                    </div>
                  )}
                  {formData.enlace_externo && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">Enlace externo:</span>
                      <a href={formData.enlace_externo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        {formData.enlace_externo}
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
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
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
