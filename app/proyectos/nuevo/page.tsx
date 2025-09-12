"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Plus, X, FileText, Calendar, User, Building } from "lucide-react"

// Interfaces
interface ProyectoFormData {
  titulo: string
  descripcion: string
  resumen: string
  categoria: string
  estado: string
  fechaInicio: string
  fechaFin?: string
  institucion: string
  autor: string
  palabrasClave: string[]
  archivo?: File
  archivoUrl?: string
}

interface ErrorMessage {
  field: string
  message: string
}

export default function NuevoProyectoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ErrorMessage[]>([])
  const [palabraClave, setPalabraClave] = useState("")
  
  const [formData, setFormData] = useState<ProyectoFormData>({
    titulo: "",
    descripcion: "",
    resumen: "",
    categoria: "",
    estado: "Activo",
    fechaInicio: "",
    fechaFin: "",
    institucion: "",
    autor: "",
    palabrasClave: [],
    archivo: undefined,
    archivoUrl: ""
  })

  // Categorías disponibles
  const categorias = [
    "Agricultura",
    "Arquitectura", 
    "Ciencias Sociales",
    "Energía",
    "Medio Ambiente",
    "Medicina",
    "Tecnología",
    "Educación",
    "Economía",
    "Ingeniería"
  ]

  // Estados de proyecto
  const estados = [
    "Activo",
    "Completado", 
    "En revisión",
    "Pausado",
    "Cancelado"
  ]

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ProyectoFormData, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar errores del campo modificado
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  // Agregar palabra clave
  const handleAddPalabraClave = () => {
    if (palabraClave.trim() && !formData.palabrasClave.includes(palabraClave.trim())) {
      setFormData(prev => ({
        ...prev,
        palabrasClave: [...prev.palabrasClave, palabraClave.trim()]
      }))
      setPalabraClave("")
    }
  }

  // Remover palabra clave
  const handleRemovePalabraClave = (palabra: string) => {
    setFormData(prev => ({
      ...prev,
      palabrasClave: prev.palabrasClave.filter(p => p !== palabra)
    }))
  }

  // Manejar archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        archivo: file
      }))
    }
  }

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: ErrorMessage[] = []

    if (!formData.titulo.trim()) {
      newErrors.push({ field: "titulo", message: "El título es obligatorio" })
    }

    if (!formData.descripcion.trim()) {
      newErrors.push({ field: "descripcion", message: "La descripción es obligatoria" })
    }

    if (!formData.resumen.trim()) {
      newErrors.push({ field: "resumen", message: "El resumen es obligatorio" })
    }

    if (!formData.categoria) {
      newErrors.push({ field: "categoria", message: "La categoría es obligatoria" })
    }

    if (!formData.fechaInicio) {
      newErrors.push({ field: "fechaInicio", message: "La fecha de inicio es obligatoria" })
    }

    if (!formData.institucion.trim()) {
      newErrors.push({ field: "institucion", message: "La institución es obligatoria" })
    }

    if (!formData.autor.trim()) {
      newErrors.push({ field: "autor", message: "El autor es obligatorio" })
    }

    if (formData.palabrasClave.length === 0) {
      newErrors.push({ field: "palabrasClave", message: "Al menos una palabra clave es obligatoria" })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      let archivoUrl = null
      let archivoNombre = null

      // Si hay archivo, subirlo primero
      if (formData.archivo) {
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
      }

      // Preparar datos para enviar a la API
      const proyectoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        resumen: formData.resumen,
        categoria: formData.categoria,
        estado: formData.estado,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || null,
        institucion: formData.institucion,
        autor: formData.autor,
        palabrasClave: formData.palabrasClave,
        archivo: archivoNombre,
        archivoUrl: archivoUrl
      }

      // Enviar a la API
      const response = await fetch('/api/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proyectoData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir el proyecto')
      }

      const result = await response.json()
      console.log("Proyecto creado:", result.proyecto)
      
      // Mostrar éxito
      alert("¡Proyecto subido exitosamente!")
      
      // Redirigir a la página de proyectos
      router.push("/proyectos")
      
    } catch (error) {
      console.error("Error al subir proyecto:", error)
      setErrors([{ 
        field: "general", 
        message: error instanceof Error ? error.message : "Error al subir el proyecto. Inténtalo de nuevo." 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-blue-900">Subir Nuevo Proyecto</h1>
          <p className="text-blue-600">
            Comparte tu investigación con la comunidad académica de Chihuahua
          </p>
        </div>

        {/* Errores generales */}
        {errors.some(error => error.field === "general") && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {errors.find(error => error.field === "general")?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario */}
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Información del Proyecto
            </CardTitle>
            <CardDescription>
              Completa todos los campos obligatorios para subir tu proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información Básica
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-blue-900">
                      Título del Proyecto *
                    </Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: Desarrollo de Sistemas Fotovoltaicos..."
                      value={formData.titulo}
                      onChange={(e) => handleInputChange("titulo", e.target.value)}
                      className={errors.some(e => e.field === "titulo") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "titulo") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "titulo")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria" className="text-blue-900">
                      Categoría *
                    </Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                      <SelectTrigger className={errors.some(e => e.field === "categoria") ? "border-red-300" : ""}>
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
                    {errors.some(e => e.field === "categoria") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "categoria")?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-blue-900">
                    Descripción Detallada *
                  </Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe en detalle tu proyecto de investigación..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    className={`min-h-[120px] ${errors.some(e => e.field === "descripcion") ? "border-red-300" : ""}`}
                  />
                  {errors.some(e => e.field === "descripcion") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "descripcion")?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumen" className="text-blue-900">
                    Resumen Ejecutivo *
                  </Label>
                  <Textarea
                    id="resumen"
                    placeholder="Resumen breve del proyecto (máximo 500 caracteres)..."
                    value={formData.resumen}
                    onChange={(e) => handleInputChange("resumen", e.target.value)}
                    className={`min-h-[80px] ${errors.some(e => e.field === "resumen") ? "border-red-300" : ""}`}
                    maxLength={500}
                  />
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Resumen para mostrar en la lista de proyectos</span>
                    <span>{formData.resumen.length}/500</span>
                  </div>
                  {errors.some(e => e.field === "resumen") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "resumen")?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Información del autor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información del Autor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="autor" className="text-blue-900">
                      Nombre Completo del Autor *
                    </Label>
                    <Input
                      id="autor"
                      placeholder="Dr. Juan Pérez González"
                      value={formData.autor}
                      onChange={(e) => handleInputChange("autor", e.target.value)}
                      className={errors.some(e => e.field === "autor") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "autor") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "autor")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institucion" className="text-blue-900">
                      Institución *
                    </Label>
                    <Input
                      id="institucion"
                      placeholder="Universidad Autónoma de Chihuahua"
                      value={formData.institucion}
                      onChange={(e) => handleInputChange("institucion", e.target.value)}
                      className={errors.some(e => e.field === "institucion") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "institucion") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "institucion")?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fechas y estado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fechas y Estado
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio" className="text-blue-900">
                      Fecha de Inicio *
                    </Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                      className={errors.some(e => e.field === "fechaInicio") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "fechaInicio") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "fechaInicio")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin" className="text-blue-900">
                      Fecha de Fin (Opcional)
                    </Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => handleInputChange("fechaFin", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-blue-900">
                      Estado del Proyecto
                    </Label>
                    <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Palabras clave */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900">Palabras Clave</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="palabrasClave" className="text-blue-900">
                      Agregar Palabras Clave *
                    </Label>
                    <p className="text-sm text-blue-600 mb-2">
                      Escribe una palabra clave y presiona Enter o haz clic en el botón + para agregarla
                    </p>
                    <div className="flex gap-2">
                      <Input
                        id="palabrasClave"
                        placeholder="Ej: Energía solar, Desarrollo rural, Sostenibilidad..."
                        value={palabraClave}
                        onChange={(e) => setPalabraClave(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddPalabraClave()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddPalabraClave} 
                        variant="outline"
                        className="px-3"
                        disabled={!palabraClave.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {errors.some(e => e.field === "palabrasClave") && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "palabrasClave")?.message}
                      </p>
                    </div>
                  )}

                  {/* Mostrar palabras clave agregadas */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Palabras Clave ({formData.palabrasClave.length})
                      </span>
                      {formData.palabrasClave.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, palabrasClave: [] }))}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Limpiar todas
                        </Button>
                      )}
                    </div>
                    
                    {formData.palabrasClave.length > 0 ? (
                      <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md min-h-[50px]">
                        {formData.palabrasClave.map((palabra, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 px-2 py-1"
                          >
                            {palabra}
                            <button
                              type="button"
                              onClick={() => handleRemovePalabraClave(palabra)}
                              className="ml-1 hover:text-red-600 transition-colors"
                              title={`Eliminar "${palabra}"`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md min-h-[50px] flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          No hay palabras clave agregadas. Agrega al menos una.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Archivo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Documento del Proyecto (Opcional)
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="archivo" className="text-blue-900">
                    Subir Documento
                  </Label>
                  <Input
                    id="archivo"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-blue-600">
                    Formatos permitidos: PDF, DOC, DOCX (máximo 10MB)
                  </p>
                  {formData.archivo && (
                    <p className="text-sm text-green-600">
                      ✓ Archivo seleccionado: {formData.archivo.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6 border-t border-blue-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/proyectos")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-700 text-white hover:bg-blue-800"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Proyecto
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
