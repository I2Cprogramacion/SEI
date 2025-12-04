"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, Plus, Loader2 } from "lucide-react"

// Interface para el formulario de investigador
interface InvestigadorForm {
  // Información personal
  nombre: string
  apellidos: string
  email: string
  telefono: string
  fechaNacimiento: string
  nacionalidad: string
  curp: string
  rfc: string

  // Información académica
  titulo: string
  institucion: string
  departamento: string
  ubicacion: string
  sitioWeb: string

  // Información profesional
  biografia: string
  areasEspecializacion: string[]

  // Formación académica
  educacion: Array<{
    grado: string
    institucion: string
    año: number
  }>

  // Experiencia profesional
  experiencia: Array<{
    puesto: string
    institucion: string
    añoInicio: number
    añoFin?: number
  }>
}

export default function NuevoPerfilPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const [extractedData, setExtractedData] = useState<Partial<InvestigadorForm> | null>(null)

  const [formData, setFormData] = useState<InvestigadorForm>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    nacionalidad: "Mexicana",
    curp: "",
    rfc: "",
    titulo: "",
    institucion: "",
    departamento: "",
    ubicacion: "",
    sitioWeb: "",
    biografia: "",
    areasEspecializacion: [],
    educacion: [{ grado: "", institucion: "", año: new Date().getFullYear() }],
    experiencia: [{ puesto: "", institucion: "", añoInicio: new Date().getFullYear() }],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newArea, setNewArea] = useState("")

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  // Manejar carga de PDF
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setErrors({ pdf: "Por favor selecciona un archivo PDF válido" })
      return
    }

    setPdfFile(file)
    setIsProcessingPdf(true)
    setErrors({})

    try {
      // TODO: Implementar procesamiento OCR real
      const formData = new FormData()
      formData.append("pdf", file)

      // const response = await fetch("/api/ocr", {
      //   method: "POST",
      //   body: formData,
      // })

      // if (!response.ok) {
      //   throw new Error("Error al procesar el PDF")
      // }

      // const data = await response.json()
      // setExtractedData(data)

      // Por ahora, simulamos datos extraídos
      setTimeout(() => {
        setExtractedData({
          nombre: "María",
          apellidos: "Rodríguez García",
          email: "maria.rodriguez@universidad.edu",
          telefono: "614-123-4567",
          curp: "ROGM800101MCHDRR05",
          rfc: "ROGM800101AB9",
          titulo: "Dra. en Neurociencia",
          institucion: "Universidad Autónoma de Chihuahua",
          departamento: "Facultad de Medicina",
          ubicacion: "Chihuahua, Chihuahua",
        })
        setIsProcessingPdf(false)
      }, 3000)
    } catch (error) {
      console.error("Error processing PDF:", error)
      setErrors({ pdf: "Error al procesar el PDF. Intenta nuevamente." })
      setIsProcessingPdf(false)
    }
  }

  // Aplicar datos extraídos
  const applyExtractedData = () => {
    if (extractedData) {
      setFormData((prev) => ({ ...prev, ...extractedData }))
      setExtractedData(null)
      setCurrentStep(2)
    }
  }

  // Agregar área de especialización
  const addArea = () => {
    if (newArea.trim() && !formData.areasEspecializacion.includes(newArea.trim())) {
      setFormData((prev) => ({
        ...prev,
        areasEspecializacion: [...prev.areasEspecializacion, newArea.trim()],
      }))
      setNewArea("")
    }
  }

  // Remover área de especialización
  const removeArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      areasEspecializacion: prev.areasEspecializacion.filter((_, i) => i !== index),
    }))
  }

  // Agregar educación
  const addEducacion = () => {
    setFormData((prev) => ({
      ...prev,
      educacion: [...prev.educacion, { grado: "", institucion: "", año: new Date().getFullYear() }],
    }))
  }

  // Remover educación
  const removeEducacion = (index: number) => {
    if (formData.educacion.length > 1) {
      setFormData((prev) => ({
        ...prev,
        educacion: prev.educacion.filter((_, i) => i !== index),
      }))
    }
  }

  // Agregar experiencia
  const addExperiencia = () => {
    setFormData((prev) => ({
      ...prev,
      experiencia: [...prev.experiencia, { puesto: "", institucion: "", añoInicio: new Date().getFullYear() }],
    }))
  }

  // Remover experiencia
  const removeExperiencia = (index: number) => {
    if (formData.experiencia.length > 1) {
      setFormData((prev) => ({
        ...prev,
        experiencia: prev.experiencia.filter((_, i) => i !== index),
      }))
    }
  }

  // Validar paso actual
  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.nombre) newErrors.nombre = "El nombre es requerido"
        if (!formData.apellidos) newErrors.apellidos = "Los apellidos son requeridos"
        if (!formData.email) newErrors.email = "El email es requerido"
        if (!formData.curp) newErrors.curp = "El CURP es requerido"
        if (!formData.rfc) newErrors.rfc = "El RFC es requerido"
        break
      case 2:
        if (!formData.titulo) newErrors.titulo = "El título es requerido"
        if (!formData.institucion) newErrors.institucion = "La institución es requerida"
        if (!formData.ubicacion) newErrors.ubicacion = "La ubicación es requerida"
        break
      case 3:
        if (!formData.biografia) newErrors.biografia = "La biografía es requerida"
        if (formData.areasEspecializacion.length === 0) {
          newErrors.areas = "Debe agregar al menos un área de especialización"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Siguiente paso
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  // Paso anterior
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)

    try {
      // TODO: Implementar envío real
      // const response = await fetch("/api/investigadores", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // })

      // if (!response.ok) {
      //   throw new Error("Error al crear el perfil")
      // }

      // Simular envío exitoso
      setTimeout(() => {
        router.push("/registro/exito")
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrors({ submit: "Error al crear el perfil. Intenta nuevamente." })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-blue-900">Crear Nuevo Perfil de Investigador</h1>
          <p className="text-blue-600">Completa la información para crear tu perfil en la plataforma SEI</p>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-blue-600">
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
        </div>

        {/* Paso 1: Carga de PDF o información personal */}
        {currentStep === 1 && (
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Información Personal</CardTitle>
              <CardDescription className="text-blue-600">
                Puedes cargar tu Perfil Único (PU) en PDF para extraer automáticamente los datos, o llenar el formulario
                manualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Carga de PDF */}
              {!extractedData && (
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-blue-400" />
                    <div>
                      <h3 className="font-medium text-blue-900">Cargar Perfil Único (PU)</h3>
                      <p className="text-sm text-blue-600">
                        Sube tu archivo PDF para extraer automáticamente los datos
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                        id="pdf-upload"
                        disabled={isProcessingPdf}
                      />
                      <label htmlFor="pdf-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                          disabled={isProcessingPdf}
                          asChild
                        >
                          <span>
                            {isProcessingPdf ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Procesando PDF...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                Seleccionar PDF
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                    {pdfFile && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <FileText className="h-4 w-4" />
                        <span>{pdfFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Datos extraídos del PDF */}
              {extractedData && (
                <Alert className="border-green-200 bg-green-50">
                  <FileText className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    <div className="space-y-2">
                      <p className="font-medium">Datos extraídos del PDF:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>
                          <strong>Nombre:</strong> {extractedData.nombre} {extractedData.apellidos}
                        </p>
                        <p>
                          <strong>Email:</strong> {extractedData.email}
                        </p>
                        <p>
                          <strong>CURP:</strong> {extractedData.curp}
                        </p>
                        <p>
                          <strong>RFC:</strong> {extractedData.rfc}
                        </p>
                        <p>
                          <strong>Institución:</strong> {extractedData.institucion}
                        </p>
                        <p>
                          <strong>Ubicación:</strong> {extractedData.ubicacion}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={applyExtractedData} className="bg-green-700 text-white hover:bg-green-800">
                          Usar estos datos
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setExtractedData(null)}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          Llenar manualmente
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {errors.pdf && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{errors.pdf}</AlertDescription>
                </Alert>
              )}

              {/* Formulario manual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre(s) *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    className={errors.nombre ? "border-red-300" : ""}
                  />
                  {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData((prev) => ({ ...prev, apellidos: e.target.value }))}
                    className={errors.apellidos ? "border-red-300" : ""}
                  />
                  {errors.apellidos && <p className="text-sm text-red-600">{errors.apellidos}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? "border-red-300" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    inputMode="numeric"
                    value={formData.telefono}
                    onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fechaNacimiento: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <Select
                    value={formData.nacionalidad}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, nacionalidad: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mexicana">Mexicana</SelectItem>
                      <SelectItem value="Extranjera">Extranjera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="curp">CURP *</Label>
                  <Input
                    id="curp"
                    value={formData.curp}
                    onChange={(e) => setFormData((prev) => ({ ...prev, curp: e.target.value.toUpperCase() }))}
                    className={errors.curp ? "border-red-300" : ""}
                    maxLength={18}
                  />
                  {errors.curp && <p className="text-sm text-red-600">{errors.curp}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC *</Label>
                  <Input
                    id="rfc"
                    value={formData.rfc}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
                    className={errors.rfc ? "border-red-300" : ""}
                    maxLength={13}
                  />
                  {errors.rfc && <p className="text-sm text-red-600">{errors.rfc}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Información académica */}
        {currentStep === 2 && (
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Información Académica</CardTitle>
              <CardDescription className="text-blue-600">
                Proporciona información sobre tu posición académica actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título Académico *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Dr. en Neurociencia, M.C. en Física, etc."
                    value={formData.titulo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                    className={errors.titulo ? "border-red-300" : ""}
                  />
                  {errors.titulo && <p className="text-sm text-red-600">{errors.titulo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institucion">Institución *</Label>
                  <Input
                    id="institucion"
                    value={formData.institucion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, institucion: e.target.value }))}
                    className={errors.institucion ? "border-red-300" : ""}
                  />
                  {errors.institucion && <p className="text-sm text-red-600">{errors.institucion}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento/Facultad</Label>
                  <Input
                    id="departamento"
                    value={formData.departamento}
                    onChange={(e) => setFormData((prev) => ({ ...prev, departamento: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación *</Label>
                  <Input
                    id="ubicacion"
                    placeholder="Ciudad, Estado"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ubicacion: e.target.value }))}
                    className={errors.ubicacion ? "border-red-300" : ""}
                  />
                  {errors.ubicacion && <p className="text-sm text-red-600">{errors.ubicacion}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sitioWeb">Sitio Web Personal</Label>
                  <Input
                    id="sitioWeb"
                    type="url"
                    placeholder="https://..."
                    value={formData.sitioWeb}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sitioWeb: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 3: Información profesional */}
        {currentStep === 3 && (
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Información Profesional</CardTitle>
              <CardDescription className="text-blue-600">
                Describe tu experiencia y áreas de especialización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="biografia">Biografía Profesional *</Label>
                <Textarea
                  id="biografia"
                  placeholder="Describe tu trayectoria académica, investigación actual y logros principales..."
                  value={formData.biografia}
                  onChange={(e) => setFormData((prev) => ({ ...prev, biografia: e.target.value }))}
                  className={`min-h-32 ${errors.biografia ? "border-red-300" : ""}`}
                />
                {errors.biografia && <p className="text-sm text-red-600">{errors.biografia}</p>}
              </div>

              <div className="space-y-4">
                <Label>Áreas de Especialización *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar área de especialización"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addArea())}
                  />
                  <Button
                    type="button"
                    onClick={addArea}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.areas && <p className="text-sm text-red-600">{errors.areas}</p>}
                <div className="flex flex-wrap gap-2">
                  {formData.areasEspecializacion.map((area, index) => (
                    <Badge key={index} className="bg-blue-700 text-white">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeArea(index)}
                        className="ml-2 hover:bg-blue-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 4: Formación y experiencia */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Formación académica */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Formación Académica</CardTitle>
                <CardDescription className="text-blue-600">
                  Agrega tu formación académica (grados, diplomas, certificaciones)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.educacion.map((edu, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-blue-100 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label>Grado/Título</Label>
                      <Input
                        placeholder="Ej: Doctorado en..."
                        value={edu.grado}
                        onChange={(e) => {
                          const newEducacion = [...formData.educacion]
                          newEducacion[index].grado = e.target.value
                          setFormData((prev) => ({ ...prev, educacion: newEducacion }))
                        }}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Institución</Label>
                      <Input
                        value={edu.institucion}
                        onChange={(e) => {
                          const newEducacion = [...formData.educacion]
                          newEducacion[index].institucion = e.target.value
                          setFormData((prev) => ({ ...prev, educacion: newEducacion }))
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Año</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          value={edu.año || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            const newEducacion = [...formData.educacion]
                            // Permitir valores vacíos o números válidos
                            if (value === '' || (!isNaN(Number(value)) && Number(value) >= 1950 && Number(value) <= new Date().getFullYear())) {
                              newEducacion[index].año = value === '' ? undefined : Number.parseInt(value)
                              setFormData((prev) => ({ ...prev, educacion: newEducacion }))
                            }
                          }}
                        />
                        {formData.educacion.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeEducacion(index)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEducacion}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar formación
                </Button>
              </CardContent>
            </Card>

            {/* Experiencia profesional */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Experiencia Profesional</CardTitle>
                <CardDescription className="text-blue-600">
                  Agrega tu experiencia profesional y académica relevante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.experiencia.map((exp, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-blue-100 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label>Puesto</Label>
                      <Input
                        placeholder="Ej: Investigador Senior"
                        value={exp.puesto}
                        onChange={(e) => {
                          const newExperiencia = [...formData.experiencia]
                          newExperiencia[index].puesto = e.target.value
                          setFormData((prev) => ({ ...prev, experiencia: newExperiencia }))
                        }}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Institución</Label>
                      <Input
                        value={exp.institucion}
                        onChange={(e) => {
                          const newExperiencia = [...formData.experiencia]
                          newExperiencia[index].institucion = e.target.value
                          setFormData((prev) => ({ ...prev, experiencia: newExperiencia }))
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Año Inicio</Label>
                      <Input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        value={exp.añoInicio || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          const newExperiencia = [...formData.experiencia]
                          // Permitir valores vacíos o números válidos
                          if (value === '' || (!isNaN(Number(value)) && Number(value) >= 1950 && Number(value) <= new Date().getFullYear())) {
                            newExperiencia[index].añoInicio = value === '' ? undefined : Number.parseInt(value)
                            setFormData((prev) => ({ ...prev, experiencia: newExperiencia }))
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Año Fin</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          placeholder="Actual"
                          value={exp.añoFin || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            const newExperiencia = [...formData.experiencia]
                            // Permitir valores vacíos o números válidos
                            if (value === '' || (!isNaN(Number(value)) && Number(value) >= 1950 && Number(value) <= new Date().getFullYear())) {
                              newExperiencia[index].añoFin = value === '' ? undefined : Number.parseInt(value)
                              setFormData((prev) => ({ ...prev, experiencia: newExperiencia }))
                            }
                          }}
                        />
                        {formData.experiencia.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeExperiencia(index)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExperiencia}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar experiencia
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error de envío */}
        {errors.submit && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{errors.submit}</AlertDescription>
          </Alert>
        )}

        {/* Navegación */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
          >
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep} className="bg-blue-700 text-white hover:bg-blue-800">
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-700 text-white hover:bg-blue-800">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando perfil...
                </>
              ) : (
                "Crear Perfil"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
