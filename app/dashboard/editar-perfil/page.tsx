"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UploadFotografia } from "@/components/upload-fotografia"
import {
  Loader2,
  CheckCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Flag,
  Hash,
  CreditCard,
  Briefcase,
  AlertCircle,
  ArrowLeft,
  Save,
  Edit,
} from "lucide-react"

interface InvestigadorData {
  id: number
  nombre_completo: string
  curp: string
  rfc: string
  no_cvu: string
  correo: string
  telefono: string
  ultimo_grado_estudios: string
  empleo_actual: string
  linea_investigacion: string
  area_investigacion: string
  nacionalidad: string
  fecha_nacimiento: string
  fotografia_url?: string
  fecha_registro: string
  origen: string
}

interface FormData {
  nombre_completo: string
  curp: string
  rfc: string
  no_cvu: string
  telefono: string
  ultimo_grado_estudios: string
  empleo_actual: string
  linea_investigacion: string
  area_investigacion: string
  nacionalidad: string
  fecha_nacimiento: string
  fotografia_url?: string
}

export default function EditarPerfilPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [investigadorId, setInvestigadorId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    nombre_completo: "",
    curp: "",
    rfc: "",
    no_cvu: "",
    telefono: "",
    ultimo_grado_estudios: "",
    empleo_actual: "",
    linea_investigacion: "",
    area_investigacion: "",
    nacionalidad: "Mexicana",
    fecha_nacimiento: "",
    fotografia_url: "",
  })

  // Cargar datos del investigador
  useEffect(() => {
    const cargarDatos = async () => {
      if (!isLoaded || !user) return

      try {
        setIsLoading(true)
        const response = await fetch("/api/investigadores/perfil")
        
        if (!response.ok) {
          throw new Error("No se pudo cargar el perfil")
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          const data = result.data as InvestigadorData
          setInvestigadorId(data.id)
          setFormData({
            nombre_completo: data.nombre_completo || "",
            curp: data.curp || "",
            rfc: data.rfc || "",
            no_cvu: data.no_cvu || "",
            telefono: data.telefono || "",
            ultimo_grado_estudios: data.ultimo_grado_estudios || "",
            empleo_actual: data.empleo_actual || "",
            linea_investigacion: data.linea_investigacion || "",
            area_investigacion: data.area_investigacion || "",
            nacionalidad: data.nacionalidad || "Mexicana",
            fecha_nacimiento: data.fecha_nacimiento || "",
            fotografia_url: data.fotografia_url || "",
          })
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [isLoaded, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFotografiaUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      fotografia_url: url
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      // Validaciones básicas
      if (!formData.nombre_completo.trim()) {
        throw new Error("El nombre completo es obligatorio")
      }

      if (!formData.telefono.trim()) {
        throw new Error("El teléfono es obligatorio")
      }

      // Enviar actualización
      const response = await fetch("/api/investigadores/actualizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el perfil")
      }

      setSuccess(result.message || "✅ Perfil actualizado exitosamente")
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Error al guardar:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-blue-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/iniciar-sesion")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container max-w-4xl mx-auto py-6 md:py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="mb-4 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Edit className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Editar Perfil</h1>
            <p className="text-blue-600">Actualiza tu información de investigador</p>
          </div>
        </div>

        <Card className="bg-white border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">Información del Investigador</CardTitle>
            <CardDescription className="text-blue-600">
              Modifica los campos que desees actualizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fotografía */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2">
                  Fotografía de Perfil
                </h3>
                <UploadFotografia
                  value={formData.fotografia_url}
                  onChange={handleFotografiaUpload}
                  nombreCompleto={formData.nombre_completo}
                />
              </div>

              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_completo" className="text-blue-900 font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      placeholder="Nombre completo"
                      className="bg-white border-blue-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-blue-900 font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono *
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Teléfono"
                      className="bg-white border-blue-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento" className="text-blue-900 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nacionalidad" className="text-blue-900 font-medium flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Nacionalidad
                    </Label>
                    <Input
                      id="nacionalidad"
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                      placeholder="Nacionalidad"
                      className="bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Identificación Oficial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Identificación Oficial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="no_cvu" className="text-blue-900 font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      CVU/PU
                    </Label>
                    <Input
                      id="no_cvu"
                      name="no_cvu"
                      value={formData.no_cvu}
                      onChange={handleChange}
                      placeholder="CVU/PU"
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curp" className="text-blue-900 font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      CURP
                    </Label>
                    <Input
                      id="curp"
                      name="curp"
                      value={formData.curp}
                      onChange={handleChange}
                      placeholder="CURP"
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rfc" className="text-blue-900 font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      RFC
                    </Label>
                    <Input
                      id="rfc"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleChange}
                      placeholder="RFC"
                      className="bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Información Académica y Profesional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Información Académica y Profesional
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ultimo_grado_estudios" className="text-blue-900 font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Último Grado de Estudios
                    </Label>
                    <Input
                      id="ultimo_grado_estudios"
                      name="ultimo_grado_estudios"
                      value={formData.ultimo_grado_estudios}
                      onChange={handleChange}
                      placeholder="Ej: Doctorado en..."
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empleo_actual" className="text-blue-900 font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Empleo Actual
                    </Label>
                    <Input
                      id="empleo_actual"
                      name="empleo_actual"
                      value={formData.empleo_actual}
                      onChange={handleChange}
                      placeholder="Puesto y lugar de trabajo"
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linea_investigacion" className="text-blue-900 font-medium flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Línea de Investigación
                    </Label>
                    <Input
                      id="linea_investigacion"
                      name="linea_investigacion"
                      value={formData.linea_investigacion}
                      onChange={handleChange}
                      placeholder="Tu línea de investigación principal"
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area_investigacion" className="text-blue-900 font-medium flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Área de Investigación
                    </Label>
                    <Input
                      id="area_investigacion"
                      name="area_investigacion"
                      value={formData.area_investigacion}
                      onChange={handleChange}
                      placeholder="Ej: Ciencias Exactas, Ingeniería, etc."
                      className="bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Guardar Cambios
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
