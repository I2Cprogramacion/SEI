"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

interface InstitucionFormData {
  nombre: string
  siglas: string
  tipo: string
  ubicacion: string
  descripcion: string
  fundacion: string
  sitioWeb: string
  telefono: string
  email: string
  areas: string[]
}

export default function NuevaInstitucionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [formData, setFormData] = useState<InstitucionFormData>({
    nombre: "",
    siglas: "",
    tipo: "",
    ubicacion: "",
    descripcion: "",
    fundacion: "",
    sitioWeb: "",
    telefono: "",
    email: "",
    areas: []
  })

  const [newArea, setNewArea] = useState("")

  const tiposInstitucion = [
    "Universidad Pública",
    "Universidad Privada",
    "Instituto Tecnológico",
    "Centro de Investigación",
    "Instituto de Investigación",
    "Colegio de Estudios Superiores",
    "Escuela Superior",
    "Facultad",
    "Departamento",
    "Laboratorio",
    "Otro"
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!supportedTypes.includes(file.type)) {
        setError("Por favor selecciona una imagen válida (JPG, PNG, GIF, WebP)")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen debe ser menor a 5MB")
        return
      }

      setSelectedFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewImage(null)
  }

  const addArea = () => {
    if (newArea.trim() && !formData.areas.includes(newArea.trim())) {
      setFormData((prev) => ({
        ...prev,
        areas: [...prev.areas, newArea.trim()]
      }))
      setNewArea("")
    }
  }

  const removeArea = (areaToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      areas: prev.areas.filter(area => area !== areaToRemove)
    }))
  }

  const validateForm = () => {
    const requiredFields = [
      { field: "nombre", label: "Nombre de la institución" },
      { field: "siglas", label: "Siglas" },
      { field: "tipo", label: "Tipo de institución" },
      { field: "ubicacion", label: "Ubicación" },
      { field: "descripcion", label: "Descripción" },
      { field: "fundacion", label: "Año de fundación" },
      { field: "email", label: "Correo electrónico" }
    ]

    const emptyFields = requiredFields.filter((field) => !formData[field.field as keyof InstitucionFormData]?.toString().trim())
    return emptyFields
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const emptyFields = validateForm()
    if (emptyFields.length > 0) {
      setError(`Por favor completa los siguientes campos: ${emptyFields.map(f => f.label).join(", ")}`)
      return
    }

    // Validar email
    if (formData.email && !formData.email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido")
      return
    }

    // Validar año de fundación
    const currentYear = new Date().getFullYear()
    const fundacionYear = parseInt(formData.fundacion)
    if (fundacionYear < 1800 || fundacionYear > currentYear) {
      setError("Por favor ingresa un año de fundación válido")
      return
    }

    try {
      setIsLoading(true)

      // Crear FormData para enviar archivo si existe
      const submitData = new FormData()
      
      // Agregar datos del formulario
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'areas') {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      // Agregar archivo si existe
      if (selectedFile) {
        submitData.append('imagen', selectedFile)
      }

      const response = await fetch("/api/instituciones", {
        method: "POST",
        body: submitData,
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Error al crear la institución")
      }

      setSuccess("Institución creada exitosamente")
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/instituciones")
      }, 2000)

    } catch (error) {
      console.error("Error al crear institución:", error)
      setError(error instanceof Error ? error.message : "Error al crear la institución")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormComplete = validateForm().length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container max-w-4xl mx-auto py-6 md:py-12 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50">
              <Link href="/instituciones">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Instituciones
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              <Building className="h-8 w-8" />
              Agregar Nueva Institución
            </h1>
            <p className="text-blue-600">
              Completa la información de la nueva institución de investigación
            </p>
          </div>

          {/* Formulario */}
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Información de la Institución</CardTitle>
              <CardDescription className="text-blue-600">
                Todos los campos marcados con * son obligatorios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-blue-900 font-medium">
                      Nombre de la Institución *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Universidad Autónoma de Chihuahua"
                      className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siglas" className="text-blue-900 font-medium">
                      Siglas *
                    </Label>
                    <Input
                      id="siglas"
                      name="siglas"
                      value={formData.siglas}
                      onChange={handleChange}
                      placeholder="UACH"
                      className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipo" className="text-blue-900 font-medium">
                      Tipo de Institución *
                    </Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                      <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposInstitucion.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundacion" className="text-blue-900 font-medium">
                      Año de Fundación *
                    </Label>
                    <Input
                      id="fundacion"
                      name="fundacion"
                      type="number"
                      value={formData.fundacion}
                      onChange={handleChange}
                      placeholder="1954"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion" className="text-blue-900 font-medium">
                    Ubicación *
                  </Label>
                  <Input
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Chihuahua, Chihuahua, México"
                    className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-blue-900 font-medium">
                    Descripción *
                  </Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe la misión, visión y características principales de la institución..."
                    className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 min-h-[100px]"
                    required
                  />
                </div>

                {/* Información de contacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">Información de Contacto</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-blue-900 font-medium">
                        Correo Electrónico *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contacto@institucion.edu.mx"
                        className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-blue-900 font-medium">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+52 614 123 4567"
                        className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sitioWeb" className="text-blue-900 font-medium">
                      Sitio Web
                    </Label>
                    <Input
                      id="sitioWeb"
                      name="sitioWeb"
                      value={formData.sitioWeb}
                      onChange={handleChange}
                      placeholder="https://www.institucion.edu.mx"
                      className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                    />
                  </div>
                </div>

                {/* Áreas de investigación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">Áreas de Investigación</h3>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="Agregar área de investigación"
                      className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                    />
                    <Button type="button" onClick={addArea} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      Agregar
                    </Button>
                  </div>

                  {formData.areas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.areas.map((area, index) => (
                        <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {area}
                          <button
                            type="button"
                            onClick={() => removeArea(area)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Imagen */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">Imagen de la Institución</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="imagen"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Label htmlFor="imagen" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-700">
                          <Upload className="h-4 w-4" />
                          Seleccionar Imagen
                        </div>
                      </Label>
                      {selectedFile && (
                        <Button type="button" onClick={removeImage} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          <X className="h-4 w-4 mr-1" />
                          Quitar
                        </Button>
                      )}
                    </div>

                    {previewImage && (
                      <div className="relative w-48 h-32 border border-blue-200 rounded-lg overflow-hidden">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensajes de error y éxito */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Botones */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={!isFormComplete || isLoading}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-8"
                  >
                    {isLoading ? "Creando..." : "Crear Institución"}
                  </Button>
                  <Button type="button" variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Link href="/instituciones">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

