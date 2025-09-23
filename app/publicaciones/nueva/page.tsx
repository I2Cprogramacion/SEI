"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Upload, FileText, Calendar, User, Building, Globe, Plus } from "lucide-react"
import Link from "next/link"

interface FormData {
  titulo: string
  autor: string
  institucion: string
  editorial: string
  añoCreacion: string
  doi: string
  resumen: string
  palabrasClave: string[]
  categoria: string
  tipo: string
  acceso: string
  volumen: string
  numero: string
  paginas: string
  archivo: File | null
}

export default function NuevaPublicacionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nuevaPalabra, setNuevaPalabra] = useState("")

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    autor: "",
    institucion: "",
    editorial: "",
    añoCreacion: new Date().getFullYear().toString(),
    doi: "",
    resumen: "",
    palabrasClave: [],
    categoria: "",
    tipo: "",
    acceso: "",
    volumen: "",
    numero: "",
    paginas: "",
    archivo: null
  })

  const categorias = [
    "Ciencias Naturales",
    "Ingeniería y Tecnología",
    "Ciencias Médicas",
    "Ciencias Sociales",
    "Humanidades",
    "Ciencias Agrícolas",
    "Ciencias Exactas",
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
    "Conferencia",
    "Otro"
  ]

  const accesos = [
    "Abierto",
    "Restringido",
    "Híbrido"
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        archivo: file
      }))
    }
  }

  const agregarPalabraClave = () => {
    if (nuevaPalabra.trim() && !formData.palabrasClave.includes(nuevaPalabra.trim())) {
      setFormData(prev => ({
        ...prev,
        palabrasClave: [...prev.palabrasClave, nuevaPalabra.trim()]
      }))
      setNuevaPalabra("")
    }
  }

  const removerPalabraClave = (palabra: string) => {
    setFormData(prev => ({
      ...prev,
      palabrasClave: prev.palabrasClave.filter(p => p !== palabra)
    }))
  }

  const validarFormulario = () => {
    const camposRequeridos = ['titulo', 'autor', 'institucion', 'editorial', 'añoCreacion', 'categoria', 'tipo']
    
    for (const campo of camposRequeridos) {
      if (!formData[campo as keyof FormData]) {
        setError(`El campo ${campo} es requerido`)
        return false
      }
    }

    if (formData.añoCreacion && (parseInt(formData.añoCreacion) < 1900 || parseInt(formData.añoCreacion) > new Date().getFullYear() + 1)) {
      setError("El año debe estar entre 1900 y " + (new Date().getFullYear() + 1))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validarFormulario()) {
      return
    }

    setLoading(true)

    try {
      let archivoUrl = null
      let archivoNombre = null

      // Si hay archivo, subirlo primero
      if (formData.archivo) {
        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('file', formData.archivo)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || 'Error al subir el archivo')
        }

        const uploadResult = await uploadResponse.json()
        archivoUrl = uploadResult.url
        archivoNombre = uploadResult.originalName
        setUploading(false)
      }

      // Preparar datos para enviar a la API
      const publicacionData = {
        titulo: formData.titulo,
        autor: formData.autor,
        institucion: formData.institucion,
        editorial: formData.editorial,
        añoCreacion: parseInt(formData.añoCreacion),
        doi: formData.doi || null,
        resumen: formData.resumen || null,
        palabrasClave: formData.palabrasClave,
        categoria: formData.categoria,
        tipo: formData.tipo,
        acceso: formData.acceso || null,
        volumen: formData.volumen || null,
        numero: formData.numero || null,
        paginas: formData.paginas || null,
        archivo: archivoNombre,
        archivoUrl: archivoUrl
      }

      // Enviar a la API
      const response = await fetch('/api/publicaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publicacionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la publicación')
      }

      const result = await response.json()
      console.log("Publicación creada:", result.publicacion)
      
      setSuccess(true)
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/publicaciones')
      }, 2000)

    } catch (error) {
      console.error('Error creating publication:', error)
      setError(error instanceof Error ? error.message : 'Error al crear la publicación')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-white border-green-200 max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">¡Publicación creada exitosamente!</h2>
            <p className="text-green-600 mb-6">
              Tu publicación ha sido registrada en la plataforma y estará disponible para otros investigadores.
            </p>
            <Button asChild className="bg-green-700 text-white hover:bg-green-800">
              <Link href="/publicaciones">Ver todas las publicaciones</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-blue-600 hover:text-blue-800">
              <Link href="/publicaciones">
                ← Volver a publicaciones
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-blue-900">Crear Nueva Publicación</h1>
          <p className="text-blue-600">
            Completa la información de tu publicación científica para compartirla con la comunidad investigadora.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-blue-700">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Título de la publicación"
                    className="border-blue-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autor" className="text-blue-700">Autor Principal *</Label>
                  <Input
                    id="autor"
                    value={formData.autor}
                    onChange={(e) => handleInputChange('autor', e.target.value)}
                    placeholder="Nombre completo del autor"
                    className="border-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institucion" className="text-blue-700">Institución *</Label>
                  <Input
                    id="institucion"
                    value={formData.institucion}
                    onChange={(e) => handleInputChange('institucion', e.target.value)}
                    placeholder="Institución de afiliación"
                    className="border-blue-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editorial" className="text-blue-700">Editorial/Revista *</Label>
                  <Input
                    id="editorial"
                    value={formData.editorial}
                    onChange={(e) => handleInputChange('editorial', e.target.value)}
                    placeholder="Nombre de la editorial o revista"
                    className="border-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="añoCreacion" className="text-blue-700">Año de Publicación *</Label>
                  <Input
                    id="añoCreacion"
                    type="number"
                    value={formData.añoCreacion}
                    onChange={(e) => handleInputChange('añoCreacion', e.target.value)}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="border-blue-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-blue-700">Categoría *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-blue-700">Tipo de Publicación *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resumen" className="text-blue-700">Resumen</Label>
                <Textarea
                  id="resumen"
                  value={formData.resumen}
                  onChange={(e) => handleInputChange('resumen', e.target.value)}
                  placeholder="Resumen o abstract de la publicación"
                  className="border-blue-200 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doi" className="text-blue-700">DOI (Digital Object Identifier)</Label>
                <Input
                  id="doi"
                  value={formData.doi}
                  onChange={(e) => handleInputChange('doi', e.target.value)}
                  placeholder="10.xxxx/xxxxx"
                  className="border-blue-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volumen" className="text-blue-700">Volumen</Label>
                  <Input
                    id="volumen"
                    value={formData.volumen}
                    onChange={(e) => handleInputChange('volumen', e.target.value)}
                    placeholder="Vol."
                    className="border-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-blue-700">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="No."
                    className="border-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paginas" className="text-blue-700">Páginas</Label>
                  <Input
                    id="paginas"
                    value={formData.paginas}
                    onChange={(e) => handleInputChange('paginas', e.target.value)}
                    placeholder="pp. 1-10"
                    className="border-blue-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acceso" className="text-blue-700">Tipo de Acceso</Label>
                <Select value={formData.acceso} onValueChange={(value) => handleInputChange('acceso', value)}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Selecciona el tipo de acceso" />
                  </SelectTrigger>
                  <SelectContent>
                    {accesos.map((acceso) => (
                      <SelectItem key={acceso} value={acceso}>
                        {acceso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Palabras clave */}
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Palabras Clave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={nuevaPalabra}
                  onChange={(e) => setNuevaPalabra(e.target.value)}
                  placeholder="Agregar palabra clave"
                  className="border-blue-200"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarPalabraClave())}
                />
                <Button
                  type="button"
                  onClick={agregarPalabraClave}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.palabrasClave.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.palabrasClave.map((palabra, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                      {palabra}
                      <button
                        type="button"
                        onClick={() => removerPalabraClave(palabra)}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Archivo adjunto */}
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Archivo Adjunto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-blue-700">Subir archivo (PDF, DOC, DOCX)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar archivo
                  </Button>
                  {formData.archivo && (
                    <span className="text-sm text-blue-600">
                      {formData.archivo.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-500">
                  Máximo 10MB. Formatos permitidos: PDF, DOC, DOCX
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Errores y botones */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/publicaciones')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading ? 'Subiendo archivo...' : 'Creando publicación...'}
                </>
              ) : (
                'Crear Publicación'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
