"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { FormProgress } from "@/components/ui/form-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Plus, X, FileText, Calendar, User, Building, DollarSign, Users, Target, Lightbulb, TrendingUp, CheckCircle2 } from "lucide-react"
import { calculateSectionProgress } from "@/lib/form-utils"

// Interfaces
interface Colaborador {
  nombre: string
  institucion: string
  rol?: string
}

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
  presupuesto?: string
  financiamiento?: string
  objetivos: string[]
  metodologia?: string
  impacto?: string
  colaboradores: Colaborador[]
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
  const [objetivo, setObjetivo] = useState("")
  const [colaboradorNombre, setColaboradorNombre] = useState("")
  const [colaboradorInstitucion, setColaboradorInstitucion] = useState("")
  const [colaboradorRol, setColaboradorRol] = useState("")
  const [currentSection, setCurrentSection] = useState("basica")
  
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
    presupuesto: "",
    financiamiento: "",
    objetivos: [],
    metodologia: "",
    impacto: "",
    colaboradores: [],
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

  // Secciones de progreso
  const sections = [
    {
      id: "basica",
      title: "Información Básica",
      completed: calculateSectionProgress([
        { value: formData.titulo, required: true },
        { value: formData.categoria, required: true },
        { value: formData.descripcion, required: true },
        { value: formData.resumen, required: true }
      ]) === 100
    },
    {
      id: "autor",
      title: "Autor e Institución",
      completed: calculateSectionProgress([
        { value: formData.autor, required: true },
        { value: formData.institucion, required: true }
      ]) === 100
    },
    {
      id: "fechas",
      title: "Fechas y Estado",
      completed: calculateSectionProgress([
        { value: formData.fechaInicio, required: true }
      ]) === 100
    },
    {
      id: "detalles",
      title: "Detalles del Proyecto",
      completed: formData.palabrasClave.length > 0
    }
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

  // Agregar objetivo
  const handleAddObjetivo = () => {
    if (objetivo.trim() && !formData.objetivos.includes(objetivo.trim())) {
      setFormData(prev => ({
        ...prev,
        objetivos: [...prev.objetivos, objetivo.trim()]
      }))
      setObjetivo("")
    }
  }

  // Remover objetivo
  const handleRemoveObjetivo = (obj: string) => {
    setFormData(prev => ({
      ...prev,
      objetivos: prev.objetivos.filter(o => o !== obj)
    }))
  }

  // Agregar colaborador
  const handleAddColaborador = () => {
    if (colaboradorNombre.trim() && colaboradorInstitucion.trim()) {
      setFormData(prev => ({
        ...prev,
        colaboradores: [...prev.colaboradores, {
          nombre: colaboradorNombre.trim(),
          institucion: colaboradorInstitucion.trim(),
          rol: colaboradorRol.trim() || undefined
        }]
      }))
      setColaboradorNombre("")
      setColaboradorInstitucion("")
      setColaboradorRol("")
    }
  }

  // Remover colaborador
  const handleRemoveColaborador = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colaboradores: prev.colaboradores.filter((_, i) => i !== index)
    }))
  }

  // Manejar archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB en bytes
      if (file.size > maxSize) {
        setErrors(prev => [...prev, {
          field: "archivo",
          message: "El archivo es demasiado grande. El tamaño máximo es 10MB"
        }])
        event.target.value = "" // Limpiar input
        return
      }

      // Validar tipo de archivo
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        setErrors(prev => [...prev, {
          field: "archivo",
          message: "Formato de archivo no válido. Solo se permiten PDF, DOC y DOCX"
        }])
        event.target.value = "" // Limpiar input
        return
      }

      setFormData(prev => ({
        ...prev,
        archivo: file
      }))
      // Limpiar errores de archivo
      setErrors(prev => prev.filter(e => e.field !== "archivo"))
    }
  }

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: ErrorMessage[] = []

    // Validar título
    if (!formData.titulo.trim()) {
      newErrors.push({ field: "titulo", message: "El título es obligatorio" })
    } else if (formData.titulo.length < 10) {
      newErrors.push({ field: "titulo", message: "El título debe tener al menos 10 caracteres" })
    }

    // Validar descripción
    if (!formData.descripcion.trim()) {
      newErrors.push({ field: "descripcion", message: "La descripción es obligatoria" })
    } else if (formData.descripcion.length < 50) {
      newErrors.push({ field: "descripcion", message: "La descripción debe tener al menos 50 caracteres" })
    }

    // Validar resumen
    if (!formData.resumen.trim()) {
      newErrors.push({ field: "resumen", message: "El resumen es obligatorio" })
    } else if (formData.resumen.length < 20) {
      newErrors.push({ field: "resumen", message: "El resumen debe tener al menos 20 caracteres" })
    }

    // Validar categoría
    if (!formData.categoria) {
      newErrors.push({ field: "categoria", message: "La categoría es obligatoria" })
    }

    // Validar fechas
    if (!formData.fechaInicio) {
      newErrors.push({ field: "fechaInicio", message: "La fecha de inicio es obligatoria" })
    }

    if (formData.fechaFin && formData.fechaInicio) {
      const inicio = new Date(formData.fechaInicio)
      const fin = new Date(formData.fechaFin)
      if (fin < inicio) {
        newErrors.push({ field: "fechaFin", message: "La fecha de fin debe ser posterior a la fecha de inicio" })
      }
    }

    // Validar institución
    if (!formData.institucion.trim()) {
      newErrors.push({ field: "institucion", message: "La institución es obligatoria" })
    }

    // Validar autor
    if (!formData.autor.trim()) {
      newErrors.push({ field: "autor", message: "El autor es obligatorio" })
    }

    // Validar palabras clave
    if (formData.palabrasClave.length === 0) {
      newErrors.push({ field: "palabrasClave", message: "Al menos una palabra clave es obligatoria" })
    }

    // Validar presupuesto si está presente
    if (formData.presupuesto && formData.presupuesto.trim()) {
      const presupuestoNum = parseFloat(formData.presupuesto.replace(/[^0-9.-]+/g, ""))
      if (isNaN(presupuestoNum) || presupuestoNum < 0) {
        newErrors.push({ field: "presupuesto", message: "El presupuesto debe ser un número válido" })
      }
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
        toast.loading('Subiendo archivo...', { id: 'upload' })
        
        const formDataUpload = new FormData()
        formDataUpload.append('file', formData.archivo)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          toast.error('Error al subir el archivo', { 
            id: 'upload',
            description: uploadError.error || 'Verifica que el archivo sea válido' 
          })
          throw new Error(uploadError.error || 'Error al subir el archivo')
        }

        const uploadResult = await uploadResponse.json()
        archivoUrl = uploadResult.url
        archivoNombre = uploadResult.originalName
        toast.success('Archivo subido correctamente', { id: 'upload' })
      }

      // Preparar datos para enviar a la API
      toast.loading('Guardando proyecto...', { id: 'save' })
      
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
        presupuesto: formData.presupuesto || null,
        financiamiento: formData.financiamiento || null,
        objetivos: formData.objetivos,
        metodologia: formData.metodologia || null,
        impacto: formData.impacto || null,
        colaboradores: formData.colaboradores,
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
        toast.error('Error al guardar el proyecto', { 
          id: 'save',
          description: errorData.error || 'Inténtalo de nuevo más tarde' 
        })
        throw new Error(errorData.error || 'Error al subir el proyecto')
      }

      const result = await response.json()
      console.log("Proyecto creado:", result.proyecto)
      
      // Mostrar éxito
      toast.success('¡Proyecto subido exitosamente!', { 
        id: 'save',
        description: 'Tu proyecto ha sido publicado y estará visible para la comunidad' 
      })
      
      // Redirigir a la página de proyectos después de un breve delay
      setTimeout(() => {
        router.push("/proyectos")
      }, 1500)
      
    } catch (error) {
      console.error("Error al subir proyecto:", error)
      setErrors([{ 
        field: "general", 
        message: error instanceof Error ? error.message : "Error al subir el proyecto. Inténtalo de nuevo." 
      }])
      
      // También mostrar toast de error si no se mostró antes
      if (!formData.archivo) {
        toast.error('Error al subir el proyecto', {
          description: error instanceof Error ? error.message : 'Inténtalo de nuevo'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <AnimatedHeader 
          title="Subir Nuevo Proyecto"
          subtitle="Comparte tu investigación con la comunidad académica de Chihuahua"
        />

        {/* Errores generales */}
        {errors.some(error => error.field === "general") && (
          <Alert className="border-red-200 bg-red-50 animate-bounce-in">
            <AlertDescription className="text-red-700">
              {errors.find(error => error.field === "general")?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Layout con progreso lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Indicador de progreso */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FormProgress sections={sections} currentSection={currentSection} />
          </div>

          {/* Formulario */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <AnimatedCard className="bg-white border-blue-100" delay={100}>
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

              {/* Presupuesto y Financiamiento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Presupuesto y Financiamiento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="presupuesto" className="text-blue-900">
                      Presupuesto (Opcional)
                    </Label>
                    <Input
                      id="presupuesto"
                      placeholder="Ej: $500,000 MXN"
                      value={formData.presupuesto}
                      onChange={(e) => handleInputChange("presupuesto", e.target.value)}
                      className={errors.some(e => e.field === "presupuesto") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "presupuesto") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "presupuesto")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financiamiento" className="text-blue-900">
                      Fuente de Financiamiento (Opcional)
                    </Label>
                    <Input
                      id="financiamiento"
                      placeholder="Ej: CONACYT, Universidad, Sector Privado..."
                      value={formData.financiamiento}
                      onChange={(e) => handleInputChange("financiamiento", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivos del Proyecto
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="objetivos" className="text-blue-900">
                      Agregar Objetivos
                    </Label>
                    <p className="text-sm text-blue-600 mb-2">
                      Define los objetivos principales de tu proyecto
                    </p>
                    <div className="flex gap-2">
                      <Textarea
                        id="objetivos"
                        placeholder="Ej: Desarrollar un sistema de riego eficiente..."
                        value={objetivo}
                        onChange={(e) => setObjetivo(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleAddObjetivo()
                          }
                        }}
                        className="flex-1 min-h-[80px]"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddObjetivo} 
                        variant="outline"
                        className="px-3 self-end"
                        disabled={!objetivo.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.objetivos.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-900">
                        Objetivos ({formData.objetivos.length})
                      </span>
                      <div className="space-y-2 mt-2">
                        {formData.objetivos.map((obj, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
                          >
                            <span className="text-sm text-blue-900 flex-1">{index + 1}. {obj}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveObjetivo(obj)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Eliminar objetivo"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metodología */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Metodología e Impacto
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metodologia" className="text-blue-900">
                      Metodología (Opcional)
                    </Label>
                    <Textarea
                      id="metodologia"
                      placeholder="Describe la metodología que utilizarás en tu investigación..."
                      value={formData.metodologia}
                      onChange={(e) => handleInputChange("metodologia", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impacto" className="text-blue-900">
                      Impacto Esperado (Opcional)
                    </Label>
                    <Textarea
                      id="impacto"
                      placeholder="Describe el impacto esperado del proyecto en la sociedad, economía, ciencia..."
                      value={formData.impacto}
                      onChange={(e) => handleInputChange("impacto", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Colaboradores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Colaboradores del Proyecto
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="colaboradorNombre" className="text-blue-900">
                        Nombre del Colaborador
                      </Label>
                      <Input
                        id="colaboradorNombre"
                        placeholder="Dr. María González"
                        value={colaboradorNombre}
                        onChange={(e) => setColaboradorNombre(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="colaboradorInstitucion" className="text-blue-900">
                        Institución
                      </Label>
                      <Input
                        id="colaboradorInstitucion"
                        placeholder="UACH"
                        value={colaboradorInstitucion}
                        onChange={(e) => setColaboradorInstitucion(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="colaboradorRol" className="text-blue-900">
                        Rol (Opcional)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="colaboradorRol"
                          placeholder="Co-investigador"
                          value={colaboradorRol}
                          onChange={(e) => setColaboradorRol(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddColaborador} 
                          variant="outline"
                          className="px-3"
                          disabled={!colaboradorNombre.trim() || !colaboradorInstitucion.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {formData.colaboradores.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-900">
                        Colaboradores Agregados ({formData.colaboradores.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {formData.colaboradores.map((colab, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">{colab.nombre}</p>
                              <p className="text-xs text-blue-600">{colab.institucion}</p>
                              {colab.rol && (
                                <p className="text-xs text-blue-500 italic">{colab.rol}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveColaborador(index)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Eliminar colaborador"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <FileText className="h-4 w-4" />
                  Documento del Proyecto (Opcional)
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="archivo" className="text-blue-900">
                      Subir Documento
                    </Label>
                    <Input
                      id="archivo"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                        errors.some(e => e.field === "archivo") ? "border-red-300" : ""
                      }`}
                    />
                    <p className="text-sm text-blue-600">
                      Formatos permitidos: PDF, DOC, DOCX (máximo 10MB)
                    </p>
                    {errors.some(e => e.field === "archivo") && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700 text-sm">
                          {errors.find(e => e.field === "archivo")?.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Vista previa del archivo */}
                  {formData.archivo && !errors.some(e => e.field === "archivo") && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-green-700" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">
                            {formData.archivo.name}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Tamaño: {(formData.archivo.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Tipo: {formData.archivo.type || 'Desconocido'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, archivo: undefined }))
                            const fileInput = document.getElementById('archivo') as HTMLInputElement
                            if (fileInput) fileInput.value = ''
                          }}
                          className="flex-shrink-0 text-red-600 hover:text-red-700 transition-colors"
                          title="Eliminar archivo"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <span className="font-medium">✓</span>
                          Archivo listo para ser subido
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mensaje informativo si no hay archivo */}
                  {!formData.archivo && !errors.some(e => e.field === "archivo") && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            Agrega un documento de respaldo (opcional)
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Puedes adjuntar una propuesta, reporte preliminar o cualquier documento relacionado con tu proyecto.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6 border-t border-blue-100">
                <AnimatedButton
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/proyectos")}
                  disabled={loading}
                >
                  Cancelar
                </AnimatedButton>
                <AnimatedButton
                  type="submit"
                  className="bg-blue-700 text-white hover:bg-blue-800 animate-glow"
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
                </AnimatedButton>
              </div>
            </form>
          </CardContent>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  )
}
