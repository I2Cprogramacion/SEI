"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Info,
  AlertCircle,
  Upload,
  FileText,
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
  AlertTriangle,
  Eye,
  Edit,
  EyeOff,
  Lock,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    curp: "",
    rfc: "",
    no_cvu: "",
    correo: "",
    telefono: "",
    ultimo_grado_estudios: "",
    empleo_actual: "",
    linea_investigacion: "",
    nacionalidad: "Mexicana",
    fecha_nacimiento: "",
    password: "",
    confirm_password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const [ocrCompleted, setOcrCompleted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (file.type !== "application/pdf") {
        setError("Por favor selecciona un archivo PDF válido")
        setSelectedFile(null)
        setOcrCompleted(false)
        // Reset the input value
        e.target.value = ""
        return
      }

      // Validar tamaño de archivo (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024 // 2MB en bytes
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)

      if (file.size > maxSize) {
        setError(`El archivo es demasiado grande. El tamaño máximo permitido es 2MB. Tu archivo pesa ${fileSizeMB}MB`)
        setSelectedFile(null)
        setOcrCompleted(false)
        // Reset the input value
        e.target.value = ""
        return
      }

      // Si el archivo es válido, mostrar mensaje de éxito con el peso
      setSelectedFile(file)
      setError(null)
      setOcrCompleted(false)

      // Limpiar formulario cuando se selecciona nuevo archivo
      setFormData({
        nombre_completo: "",
        curp: "",
        rfc: "",
        no_cvu: "",
        correo: "",
        telefono: "",
        ultimo_grado_estudios: "",
        empleo_actual: "",
        linea_investigacion: "", // Este campo siempre se mantiene vacío para captura manual
        nacionalidad: "Mexicana",
        fecha_nacimiento: "",
        password: "",
        confirm_password: "",
      })
    } else {
      setSelectedFile(null)
      setOcrCompleted(false)
      setError(null)
    }
  }

  const handlePDFUpload = async () => {
    if (!selectedFile) return;

    setIsProcessingPDF(true);
    setError(null);

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Enviar archivo al endpoint de OCR (sin autenticación para registro público)
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      let result = null;
      try {
        result = await response.json();
      } catch (jsonErr) {
        // Si no es JSON, mostrar error genérico
        setError("Error inesperado procesando el PDF. Intenta de nuevo.");
        setIsProcessingPDF(false);
        return;
      }

      // Si la respuesta tiene datos clave, autollenar aunque falte el correo, incluso si status es 400
      const ocrData = result.ocr || result;
      if (ocrData.curp || ocrData.rfc || ocrData.no_cvu || ocrData.telefono) {
        setFormData((prev) => ({
          ...prev,
          curp: ocrData.curp || "",
          rfc: ocrData.rfc || "",
          no_cvu: ocrData.no_cvu || "",
          correo: ocrData.correo || "",
          telefono: ocrData.telefono || "",
          linea_investigacion: "",
          password: "",
          confirm_password: "",
        }));
        setOcrCompleted(true);
        setError(null);
        setIsProcessingPDF(false);
        console.log("PDF procesado exitosamente. Campos extraídos:", ocrData);
        return;
      } else {
        setError("No se pudieron extraer datos clave del PDF (CURP, RFC, CVU, Teléfono)");
        setOcrCompleted(true);
        setIsProcessingPDF(false);
        return;
      }
    } catch (error) {
      console.error("Error procesando PDF:", error);
      setError("No se pudieron extraer datos clave del PDF (CURP, RFC, CVU, Teléfono)");
      setOcrCompleted(true);
      setIsProcessingPDF(false);
    }
  }

  // Validar fortaleza de contraseña
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const score = Object.values(requirements).filter(Boolean).length
    return { requirements, score, isValid: score >= 4 }
  }

  // Validar que todos los campos requeridos estén completos
  const validateForm = () => {
    const requiredFields = [
      { field: "nombre_completo", label: "Nombre Completo" },
      { field: "correo", label: "Correo Electrónico" },
      { field: "telefono", label: "Teléfono" },
      { field: "ultimo_grado_estudios", label: "Último Grado de Estudios" },
      { field: "empleo_actual", label: "Empleo Actual" },
      { field: "linea_investigacion", label: "Línea de Investigación" },
      { field: "nacionalidad", label: "Nacionalidad" },
      { field: "fecha_nacimiento", label: "Fecha de Nacimiento" },
      { field: "no_cvu", label: "CVU/PU" },
      { field: "curp", label: "CURP" },
      { field: "rfc", label: "RFC" },
      { field: "password", label: "Contraseña" },
      { field: "confirm_password", label: "Confirmar Contraseña" },
    ]

    const emptyFields = requiredFields.filter((field) => !formData[field.field as keyof typeof formData]?.trim())

    return emptyFields
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ocrCompleted) {
      setError("Debes procesar un Perfil Único antes de continuar con el registro")
      return
    }

    // Validar que todos los campos estén completos
    const emptyFields = validateForm()
    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map((field) => field.label).join(", ")
      setError(`Los siguientes campos son obligatorios y no pueden estar vacíos: ${fieldNames}`)
      return
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setError("La contraseña no cumple con los requisitos de seguridad mínimos")
      return
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirm_password) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Validaciones adicionales
      if (!formData.correo.includes("@")) {
        throw new Error("El correo electrónico debe tener un formato válido")
      }

      // Añadir fecha de registro
      const dataToSend = {
        ...formData,
        fecha_registro: new Date().toISOString(),
        origen: "ocr",
        archivo_procesado: selectedFile?.name || "",
      }

      // No enviar la confirmación de contraseña
      const { confirm_password, ...dataToSendWithoutConfirm } = dataToSend

      console.log("Enviando datos:", dataToSendWithoutConfirm)

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(dataToSendWithoutConfirm),
      })

      const responseData = await response.json()
      console.log("Respuesta del servidor:", responseData)
      if (responseData.token) {
        localStorage.setItem("token", responseData.token)
        console.log("Token guardado en localStorage (registro):", responseData.token)
      } else {
        console.log("No se recibió token en la respuesta de registro.")
      }

      if (!response.ok) {
        // Manejar caso de duplicado (código 409)
        if (response.status === 409 && responseData.duplicado) {
          setError(`${responseData.message} ID: ${responseData.id}`)
          return
        }

        throw new Error(responseData.error || "Error al guardar los datos")
      }

      // Redirigir a la página de éxito
      const tipo = responseData.message && responseData.message.includes("⚠️") ? "warning" : "success"
      const urlParams = new URLSearchParams({
        mensaje: responseData.message || "Registro completado exitosamente",
        tipo: tipo,
      })

      router.push(`/registro/exito?${urlParams.toString()}`)
    } catch (error) {
      console.error("Error al registrar:", error)
      setError(`Error al registrar: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si el formulario está completo
  const isFormComplete = validateForm().length === 0
  const passwordValidation = validatePassword(formData.password)
  const passwordsMatch = formData.password === formData.confirm_password

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container max-w-5xl mx-auto py-6 md:py-12 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mb-3 md:mb-4">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-blue-900">Regístrate en SECCTI</h1>
            <p className="text-sm md:text-lg text-blue-600 max-w-2xl mx-auto px-2">
              Sube tu Perfil Único (PU) en PDF para crear tu cuenta de investigador de forma automática
            </p>
          </div>

          {/* Info Alert OCR campos */}
          <div className="max-w-3xl mx-auto">
            <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <Info className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-900 font-semibold">¿Qué datos se extraen automáticamente?</AlertTitle>
              <AlertDescription className="text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li><b>CVU/PU</b> <span className="text-green-700">(extraído por OCR)</span></li>
                  <li><b>CURP</b> <span className="text-green-700">(extraído por OCR)</span></li>
                  <li><b>RFC</b> <span className="text-green-700">(extraído por OCR)</span></li>
                </ul>
                <div className="mt-2 text-blue-800">
                  <b>Todos los demás campos deben ser llenados manualmente por el usuario.</b>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Paso 1: Subir PDF */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <CardTitle className="text-2xl text-blue-900 flex items-center justify-center gap-2">
                  <Upload className="h-6 w-6" />
                  Subir Perfil Único
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Selecciona tu Perfil Único (PU) en formato PDF para extraer automáticamente tu información académica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="pdf-upload" className="text-blue-900 font-medium">
                    Archivo PDF del Perfil Único * (Máximo 2MB)
                  </Label>
                  <div className="relative">
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="bg-white border-blue-200 text-blue-900 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-blue-100 transition-colors"
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error de archivo</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <span className="text-sm text-green-700 font-medium block">{selectedFile.name}</span>
                        <span className="text-xs text-green-600">
                          Archivo válido - Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handlePDFUpload}
                  disabled={!selectedFile || isProcessingPDF}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 h-10 md:h-12"
                >
                  {isProcessingPDF ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Procesando PDF con OCR...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Procesar Perfil Único
                    </>
                  )}
                </Button>

                {ocrCompleted && (
                  <div className="space-y-3">
                    <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <AlertTitle className="text-green-800 font-semibold">¡Datos extraídos exitosamente!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Se han extraído los datos de tu Perfil Único. Revisa cuidadosamente la información en el
                        formulario antes de continuar.
                      </AlertDescription>
                    </Alert>

                    <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <AlertTitle className="text-amber-800 font-semibold">
                        ⚠️ Importante: Verificación requerida
                      </AlertTitle>
                      <AlertDescription className="text-amber-700">
                        <div className="space-y-2">
                          <p>
                            El OCR puede contener errores de interpretación. Es <strong>fundamental</strong> que revises
                            y corrijas:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Números de identificación (CURP, RFC, CVU)</li>
                            <li>
                              <strong>Línea de investigación (captura manual requerida)</strong>
                            </li>
                            <li>
                              <strong>Contraseña segura (captura manual requerida)</strong>
                            </li>
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Requisitos del archivo
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>
                        <strong>Formato:</strong> Solo archivos PDF
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>
                        <strong>Tamaño máximo:</strong> 2MB
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>
                        <strong>Contenido:</strong> Perfil Único (PU) actualizado
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      <span>
                        <strong>Verificación necesaria:</strong> Siempre revisa los datos extraídos
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Paso 2: Revisar y completar datos */}
            <Card
              className={`bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg transition-all duration-300 ${
                !ocrCompleted ? "opacity-50" : "hover:shadow-xl"
              }`}
            >
              <CardHeader className="text-center pb-6">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                    ocrCompleted ? "bg-amber-100" : "bg-gray-100"
                  }`}
                >
                  <span className={`font-bold text-lg ${ocrCompleted ? "text-amber-600" : "text-gray-400"}`}>2</span>
                </div>
                <CardTitle className="text-2xl text-blue-900 flex items-center justify-center gap-2">
                  <Eye className={`h-6 w-6 ${ocrCompleted ? "text-amber-600" : "text-gray-400"}`} />
                  Revisar y Completar
                </CardTitle>
                <CardDescription className="text-blue-600">
                  {ocrCompleted
                    ? "⚠️ IMPORTANTE: Revisa todos los datos y completa la información faltante"
                    : "Primero debes procesar un Perfil Único para continuar"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ocrCompleted && (
                  <Alert className="mb-4 md:mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-red-800 font-semibold">🔍 Todos los campos son obligatorios</AlertTitle>
                    <AlertDescription className="text-red-700">
                      <strong>No puedes completar el registro si algún campo está vacío.</strong> Revisa cada campo
                      cuidadosamente y asegúrate de que toda la información esté completa y correcta.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información Personal */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <User className="h-4 w-4 md:h-5 md:w-5" />
                      Información Personal
                      {ocrCompleted && (
                        <span className="text-xs md:text-sm text-amber-600 font-normal">(Verificar datos)</span>
                      )}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="nombre_completo"
                          className="text-blue-900 text-sm md:text-base font-medium flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Nombre Completo *{ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="nombre_completo"
                          name="nombre_completo"
                          value={formData.nombre_completo}
                          onChange={handleChange}
                          placeholder="Nombre completo"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.nombre_completo.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="correo"
                          className="text-blue-900 text-sm md:text-base font-medium flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Correo Electrónico *
                          {ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="correo"
                          name="correo"
                          type="email"
                          value={formData.correo}
                          onChange={handleChange}
                          placeholder="Correo electrónico"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.correo.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="telefono"
                          className="text-blue-900 text-sm md:text-base font-medium flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Teléfono *{ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="Teléfono"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.telefono.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="fecha_nacimiento"
                          className="text-blue-900 text-sm md:text-base font-medium flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Fecha de Nacimiento *
                          {ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="fecha_nacimiento"
                          name="fecha_nacimiento"
                          type="date"
                          value={formData.fecha_nacimiento}
                          onChange={handleChange}
                          className={`bg-white border-blue-200 text-blue-900 ${
                            !formData.fecha_nacimiento.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label
                          htmlFor="nacionalidad"
                          className="text-blue-900 text-sm md:text-base font-medium flex items-center gap-2"
                        >
                          <Flag className="h-4 w-4" />
                          Nacionalidad *
                        </Label>
                        <Input
                          id="nacionalidad"
                          name="nacionalidad"
                          value={formData.nacionalidad}
                          onChange={handleChange}
                          className={`bg-white border-blue-200 text-blue-900 ${
                            !formData.nacionalidad.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información Académica y Profesional */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Información Académica y Profesional
                      {ocrCompleted && <span className="text-sm text-amber-600 font-normal">(Verificar datos)</span>}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="ultimo_grado_estudios"
                          className="text-blue-900 font-medium flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4" />
                          Último Grado de Estudios *
                          {ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="ultimo_grado_estudios"
                          name="ultimo_grado_estudios"
                          value={formData.ultimo_grado_estudios}
                          onChange={handleChange}
                          placeholder="Último grado de estudios"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.ultimo_grado_estudios.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="empleo_actual" className="text-blue-900 font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Empleo Actual *{ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="empleo_actual"
                          name="empleo_actual"
                          value={formData.empleo_actual}
                          onChange={handleChange}
                          placeholder="Empleo actual"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.empleo_actual.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información Fiscal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Información Fiscal y de Registro
                      {ocrCompleted && <span className="text-sm text-amber-600 font-normal">(Verificar números)</span>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="no_cvu" className="text-blue-900 font-medium flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          CVU/PU *{ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="no_cvu"
                          name="no_cvu"
                          value={formData.no_cvu}
                          onChange={handleChange}
                          placeholder="CVU/PU"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.no_cvu.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="curp" className="text-blue-900 font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          CURP *{ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="curp"
                          name="curp"
                          value={formData.curp}
                          onChange={handleChange}
                          placeholder="CURP"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.curp.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rfc" className="text-blue-900 font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          RFC *{ocrCompleted && <span className="text-xs text-amber-600">(Verificar)</span>}
                        </Label>
                        <Input
                          id="rfc"
                          name="rfc"
                          value={formData.rfc}
                          onChange={handleChange}
                          placeholder="RFC"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.rfc.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={!ocrCompleted}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seguridad de la Cuenta */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Seguridad de la Cuenta
                      <span className="text-sm text-blue-600 font-normal">(Captura manual requerida)</span>
                    </h3>
                    <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800 font-semibold">Contraseña segura requerida</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Crea una contraseña segura para proteger tu cuenta. Debe cumplir con los requisitos de seguridad
                        establecidos.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-blue-900 font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Contraseña *
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Crea una contraseña segura"
                            className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 pr-10 ${
                              !formData.password.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                            }`}
                            required
                            disabled={!ocrCompleted}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={!ocrCompleted}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password" className="text-blue-900 font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Confirmar Contraseña *
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm_password"
                            name="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Confirma tu contraseña"
                            className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 pr-10 ${
                              !formData.confirm_password.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                            } ${
                              formData.confirm_password &&
                              formData.password &&
                              formData.password !== formData.confirm_password
                                ? "border-red-300 bg-red-50"
                                : ""
                            }`}
                            required
                            disabled={!ocrCompleted}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={!ocrCompleted}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de fortaleza de contraseña */}
                    {formData.password && ocrCompleted && (
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</h4>
                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                            <div
                              className={`flex items-center gap-2 ${
                                passwordValidation.requirements.length ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {passwordValidation.requirements.length ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              Mínimo 8 caracteres
                            </div>
                            <div
                              className={`flex items-center gap-2 ${
                                passwordValidation.requirements.uppercase ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {passwordValidation.requirements.uppercase ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              Una mayúscula (A-Z)
                            </div>
                            <div
                              className={`flex items-center gap-2 ${
                                passwordValidation.requirements.lowercase ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {passwordValidation.requirements.lowercase ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              Una minúscula (a-z)
                            </div>
                            <div
                              className={`flex items-center gap-2 ${
                                passwordValidation.requirements.number ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {passwordValidation.requirements.number ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              Un número (0-9)
                            </div>
                            <div
                              className={`flex items-center gap-2 ${
                                passwordValidation.requirements.special ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {passwordValidation.requirements.special ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              Un carácter especial
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Fortaleza:</span>
                              <span
                                className={`font-medium ${
                                  passwordValidation.score >= 4
                                    ? "text-green-600"
                                    : passwordValidation.score >= 3
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {passwordValidation.score >= 4
                                  ? "Fuerte"
                                  : passwordValidation.score >= 3
                                    ? "Media"
                                    : "Débil"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordValidation.score >= 4
                                    ? "bg-green-500"
                                    : passwordValidation.score >= 3
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${(passwordValidation.score / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Verificación de coincidencia de contraseñas */}
                        {formData.confirm_password && (
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              passwordsMatch ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {passwordsMatch ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Línea de Investigación */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Línea de Investigación
                      <span className="text-sm text-blue-600 font-normal">(Captura manual requerida)</span>
                    </h3>
                    <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                      <Edit className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800 font-semibold">Captura manual requerida</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Este campo requiere que describas manualmente tu línea de investigación principal.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label
                        htmlFor="linea_investigacion"
                        className="text-blue-900 font-medium flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Área de Investigación Principal *
                        <span className="text-xs text-blue-600">(Escribir manualmente)</span>
                      </Label>
                      <Textarea
                        id="linea_investigacion"
                        name="linea_investigacion"
                        value={formData.linea_investigacion}
                        onChange={handleChange}
                        placeholder="Describe detalladamente tu área de investigación principal, metodologías utilizadas, y objetivos de tu trabajo académico..."
                        className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 min-h-[120px] ${
                          !formData.linea_investigacion.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                        }`}
                        required
                        disabled={!ocrCompleted}
                      />
                      {!formData.linea_investigacion.trim() && ocrCompleted && (
                        <p className="text-sm text-red-600">
                          Este campo es obligatorio y debe ser completado manualmente
                        </p>
                      )}
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Indicador de completitud del formulario */}
                  {ocrCompleted && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Progreso del formulario: {13 - validateForm().length}/13 campos completos
                        </span>
                        <div className="flex items-center gap-2">
                          {isFormComplete && passwordValidation.isValid && passwordsMatch ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              isFormComplete && passwordValidation.isValid && passwordsMatch
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {isFormComplete && passwordValidation.isValid && passwordsMatch
                              ? "Formulario completo"
                              : "Campos faltantes o contraseña insegura"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      isLoading || !ocrCompleted || !isFormComplete || !passwordValidation.isValid || !passwordsMatch
                    }
                    className={`w-full shadow-md hover:shadow-lg transition-all duration-300 h-10 md:h-12 text-sm md:text-base ${
                      isFormComplete && passwordValidation.isValid && passwordsMatch
                        ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Registrando...
                      </>
                    ) : !isFormComplete || !passwordValidation.isValid || !passwordsMatch ? (
                      <>
                        <AlertCircle className="mr-2 h-5 w-5" />
                        Completa todos los campos y crea una contraseña segura
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Completar Registro
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-blue-600 max-w-md mx-auto">
            <p>
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/iniciar-sesion"
                className="text-blue-700 underline underline-offset-4 hover:text-blue-900 font-medium"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
