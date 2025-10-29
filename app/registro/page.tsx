"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { useSignUp, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
// CAPTCHA DESHABILITADO: import ReCAPTCHA from "react-google-recaptcha"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UploadFotografia } from "@/components/upload-fotografia"
import { TagsInput } from "@/components/ui/tags-input"
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
  MapPin,
  Award,
  Users2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Constants
const FILE_CONSTRAINTS = {
  MAX_SIZE_MB: 2,
  ACCEPTED_TYPE: "application/pdf",
  MAX_SIZE_BYTES: 2 * 1024 * 1024
};

const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MIN_SCORE: 4
};

const RATE_LIMITS = {
  MAX_ATTEMPTS: 3,
  LOCKOUT_DURATION_MS: 60000
};

// Types
interface FormData {
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  curp: string;
  rfc: string;
  no_cvu: string;
  correo: string;
  telefono: string;
  fotografia_url?: string;
  nacionalidad: string;
  fecha_nacimiento: string;
  genero: string;
  municipio: string;
  estado_nacimiento?: string;
  entidad_federativa?: string;
  institucion_id?: string | null;
  institucion?: string;
  departamento?: string;
  ubicacion?: string;
  sitio_web?: string;
  ultimo_grado_estudios: string;
  grado_maximo_estudios?: string;
  empleo_actual: string;
  linea_investigacion: string[];
  area_investigacion: string[];
  disciplina?: string;
  area_investigacionRaw?: string;
  especialidad?: string;
  orcid?: string;
  nivel?: string;
  nivel_investigador: string;
  nivel_actual_id?: string | null;
  fecha_asignacion_nivel?: string | null;
  puntaje_total?: number;
  estado_evaluacion?: string;
  articulos?: string;
  libros?: string;
  capitulos_libros?: string;
  proyectos_investigacion?: string;
  proyectos_vinculacion?: string;
  experiencia_docente?: string;
  experiencia_laboral?: string;
  premios_distinciones?: string;
  idiomas?: string;
  colaboracion_internacional?: string;
  colaboracion_nacional?: string;
  sni?: string;
  anio_sni?: string | null;
  cv_url?: string;
  tipo_perfil: string;
  nivel_tecnologo_id?: string | null;
  nivel_tecnologo?: string;
  archivo_procesado?: string;
  fecha_registro?: string;
  origen?: string;
  slug?: string;
  clerk_user_id?: string;
  activo?: boolean;
  es_admin?: boolean;
  password: string;
  confirm_password: string;
}

interface PasswordValidation {
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
  score: number
  isValid: boolean
}

const MUNICIPIOS_CHIHUAHUA = [
  "Ahumada",
  "Aldama",
  "Allende",
  "Aquiles Serdán",
  "Ascensión",
  "Bachíniva",
  "Balleza",
  "Batopilas de Manuel Gómez Morín",
  "Bocoyna",
  "Buenaventura",
  "Camargo",
  "Carichí",
  "Casas Grandes",
  "Coronado",
  "Coyame del Sotol",
  "La Cruz",
  "Cuauhtémoc",
  "Cusihuiriachi",
  "Chihuahua",
  "Chínipas",
  "Delicias",
  "Dr. Belisario Domínguez",
  "Galeana",
  "Santa Isabel",
  "Gómez Farías",
  "Gran Morelos",
  "Guachochi",
  "Guadalupe",
  "Guadalupe y Calvo",
  "Guazapares",
  "Guerrero",
  "Hidalgo del Parral",
  "Huejotitán",
  "Ignacio Zaragoza",
  "Janos",
  "Jiménez",
  "Juárez",
  "Julimes",
  "López",
  "Madera",
  "Maguarichi",
  "Manuel Benavides",
  "Matachí",
  "Matamoros",
  "Meoqui",
  "Morelos",
  "Moris",
  "Namiquipa",
  "Nonoava",
  "Nuevo Casas Grandes",
  "Ocampo",
  "Ojinaga",
  "Praxedis G. Guerrero",
  "Riva Palacio",
  "Rosales",
  "Rosario",
  "San Francisco de Borja",
  "San Francisco de Conchos",
  "San Francisco del Oro",
  "Santa Bárbara",
  "Satevó",
  "Saucillo",
  "Temósachic",
  "El Tule",
  "Urique",
  "Uruachi",
  "Valle de Zaragoza",
];

const initialFormData: FormData = {
  nombres: "",
  apellidos: "",
  nombre_completo: "",
  curp: "",
  rfc: "",
  no_cvu: "",
  correo: "",
  telefono: "",
  ultimo_grado_estudios: "",
  empleo_actual: "",
  linea_investigacion: [],
  area_investigacion: [],
  nacionalidad: "Mexicana",
  fecha_nacimiento: "",
  genero: "",
  tipo_perfil: "INVESTIGADOR",
  nivel_investigador: "",
  nivel_tecnologo: "",
  municipio: "",
  password: "",
  confirm_password: "",
  fotografia_url: "",
}

// Utility functions
const validatePassword = (password: string): PasswordValidation => {
  const requirements = {
    length: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const score = Object.values(requirements).filter(Boolean).length
  return { requirements, score, isValid: score >= PASSWORD_REQUIREMENTS.MIN_SCORE }
}

const sanitizeOcrData = (data: any) => {
  // Extraer nombre completo y separarlo en nombres y apellidos
  const nombreCompleto = data.nombre_completo?.trim() || ""
  let nombres = ""
  let apellidos = ""
  
  if (nombreCompleto) {
    const partes = nombreCompleto.split(/\s+/)
    if (partes.length >= 2) {
      // Asumimos que los primeros 2 elementos son nombres y el resto apellidos
      nombres = partes.slice(0, 2).join(' ')
      apellidos = partes.slice(2).join(' ')
      
      // Si solo hay 2 partes, asumimos 1 nombre y 1 apellido
      if (partes.length === 2) {
        nombres = partes[0]
        apellidos = partes[1]
      }
    } else if (partes.length === 1) {
      nombres = partes[0]
    }
  }

  return {
    nombres: nombres,
    apellidos: apellidos,
    nombre_completo: nombreCompleto,
    curp: data.curp?.trim().toUpperCase() || "",
    rfc: data.rfc?.trim().toUpperCase() || "",
    no_cvu: data.no_cvu?.trim() || "",
    correo: data.correo?.trim().toLowerCase() || "",
    telefono: data.telefono?.trim() || "",
    fecha_nacimiento: data.fecha_nacimiento?.trim() || "",
  }
}

// File Upload Section Component
interface FileUploadSectionProps {
  selectedFile: File | null
  isProcessing: boolean
  error: string | null
  ocrCompleted: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onProcess: () => void
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFile,
  isProcessing,
  error,
  ocrCompleted,
  onFileChange,
  onProcess,
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="text-center pb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
          <span className="text-blue-600 font-bold text-lg">1</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl text-blue-900 flex items-center justify-center gap-2">
          <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
          Subir Perfil Único
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-blue-600 px-2">
          Selecciona tu Perfil Único (PU) en formato PDF para extraer automáticamente tu información académica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="pdf-upload" className="text-sm sm:text-base text-blue-900 font-medium">
            Archivo PDF del Perfil Único * (Máximo {FILE_CONSTRAINTS.MAX_SIZE_MB}MB)
          </Label>
          <p className="text-xs text-blue-600">
            Este documento se procesará automáticamente para extraer tu información y se guardará como tu Perfil Único en el perfil.
          </p>
          <div className="relative">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              aria-label="Subir archivo PDF del Perfil Único"
              aria-required="true"
              className="bg-white border-blue-200 text-blue-900 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-blue-100 transition-colors h-14 py-2.5"
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
          onClick={onProcess}
          disabled={!selectedFile || isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 h-12"
        >
          {isProcessing ? (
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
                Se han extraído los datos de tu Perfil Único. Revisa cuidadosamente la información en el formulario
                antes de continuar.
              </AlertDescription>
            </Alert>

            <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 font-semibold">⚠️ Importante: Verificación requerida</AlertTitle>
              <AlertDescription className="text-amber-700">
                <div className="space-y-2">
                  <p>
                    El OCR puede contener errores de interpretación. Es <strong>fundamental</strong> que revises y
                    corrijas:
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
                <strong>Tamaño máximo:</strong> {FILE_CONSTRAINTS.MAX_SIZE_MB}MB
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
  )
}

// Password Input Component
interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  showPassword: boolean
  onTogglePassword: () => void
  disabled: boolean
  hasError: boolean
  label: string
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  showPassword,
  onTogglePassword,
  disabled,
  hasError,
  label,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-blue-900 font-medium flex items-center gap-2">
        <Lock className="h-4 w-4" />
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 pr-10 ${
            hasError ? "border-red-300 bg-red-50" : ""
          }`}
          required
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={onTogglePassword}
          disabled={disabled}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
        </Button>
      </div>
  </div>
  )
}

// Password Strength Indicator Component
interface PasswordStrengthProps {
  validation: PasswordValidation
  confirmPassword: string
  password: string
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ validation, confirmPassword, password }) => {
  const passwordsMatch = password === confirmPassword

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</h4>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
          <div
            className={`flex items-center gap-2 ${
              validation.requirements.length ? "text-green-600" : "text-gray-500"
            }`}
          >
            {validation.requirements.length ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            Mínimo 8 caracteres
          </div>
          <div
            className={`flex items-center gap-2 ${
              validation.requirements.uppercase ? "text-green-600" : "text-gray-500"
            }`}
          >
            {validation.requirements.uppercase ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            Una mayúscula (A-Z)
          </div>
          <div
            className={`flex items-center gap-2 ${
              validation.requirements.lowercase ? "text-green-600" : "text-gray-500"
            }`}
          >
            {validation.requirements.lowercase ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            Una minúscula (a-z)
          </div>
          <div
            className={`flex items-center gap-2 ${
              validation.requirements.number ? "text-green-600" : "text-gray-500"
            }`}
          >
            {validation.requirements.number ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            Un número (0-9)
          </div>
          <div
            className={`flex items-center gap-2 ${
              validation.requirements.special ? "text-green-600" : "text-gray-500"
            }`}
          >
            {validation.requirements.special ? (
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
                validation.score >= 4 ? "text-green-600" : validation.score >= 3 ? "text-yellow-600" : "text-red-600"
              }`}
            >
              {validation.score >= 4 ? "Fuerte" : validation.score >= 3 ? "Media" : "Débil"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                validation.score >= 4 ? "bg-green-500" : validation.score >= 3 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${(validation.score / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function RegistroPage() {
  const router = useRouter()
  const { isLoaded, signUp } = useSignUp()
  const clerk = useClerk()

  // Mounted state for hydration fix
  const [isMounted, setIsMounted] = useState(false)

  // State
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const [ocrCompleted, setOcrCompleted] = useState(false) // false: no mostrar mensaje hasta procesar PDF
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [lastAttempt, setLastAttempt] = useState(0)

  // Hydration fix effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Memoized values
  const passwordValidation = useMemo(() => validatePassword(formData.password), [formData.password])

  const passwordsMatch = formData.password === formData.confirm_password

  // Campos requeridos dinámicos según tipo de perfil
  // Definir exactamente 17 campos requeridos, contando solo linea_investigacion y area_investigacion como un campo cada uno
  const requiredFields = [
    { field: "nombres", label: "Nombre(s)" },
    { field: "apellidos", label: "Apellidos" },
    { field: "correo", label: "Correo Electrónico" },
    { field: "telefono", label: "Teléfono" },
    { field: "ultimo_grado_estudios", label: "Último Grado de Estudios" },
    { field: "empleo_actual", label: "Empleo Actual" },
    { field: "linea_investigacion", label: "Línea de Investigación" },
    { field: "area_investigacion", label: "Área de Investigación" },
    { field: "nacionalidad", label: "Nacionalidad" },
    { field: "fecha_nacimiento", label: "Fecha de Nacimiento" },
    { field: "genero", label: "Género" },
    { field: "tipo_perfil", label: "Tipo de Perfil" },
    ...(formData.tipo_perfil === "INVESTIGADOR" 
      ? [{ field: "nivel_investigador", label: "Nivel de Investigador" }]
      : [{ field: "nivel_tecnologo", label: "Nivel de Tecnólogo" }]
    ),
    { field: "municipio", label: "Municipio" },
    { field: "no_cvu", label: "CVU/PU" },
    { field: "curp", label: "CURP" },
    { field: "rfc", label: "RFC" },
    { field: "password", label: "Contraseña" },
    { field: "confirm_password", label: "Confirmar Contraseña" },
  ];

  const emptyFields = requiredFields.filter((field) => {
    const value = formData[field.field as keyof FormData];
    if (Array.isArray(value)) {
      // Solo requiere al menos un elemento
      return value.length === 0;
    }
    if (typeof value === 'string') {
      return !value.trim();
    }
    return !value;
  });

  const isFormComplete = emptyFields.length === 0

  // Handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      }
      
      // Generar nombre_completo automáticamente cuando cambien nombres o apellidos
      if (name === 'nombres' || name === 'apellidos') {
        const nombres = name === 'nombres' ? value : prev.nombres
        const apellidos = name === 'apellidos' ? value : prev.apellidos
        updated.nombre_completo = `${nombres} ${apellidos}`.trim()
      }
      
      return updated
    })
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        if (file.type !== FILE_CONSTRAINTS.ACCEPTED_TYPE) {
          setError("Por favor selecciona un archivo PDF válido")
          setSelectedFile(null)
          setOcrCompleted(false)
          e.target.value = ""
          return
        }

        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
        if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
          setError(
            `El archivo es demasiado grande. El tamaño máximo permitido es ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB. Tu archivo pesa ${fileSizeMB}MB`
          )
          setSelectedFile(null)
          setOcrCompleted(false)
          e.target.value = ""
          return
        }

        setSelectedFile(file)
        setError(null)
        setOcrCompleted(false)
        setFormData(initialFormData)
      } else {
        setSelectedFile(null)
        setOcrCompleted(false)
        setError(null)
      }
    },
    []
  )

  const handleSavePDFAsCV = useCallback(async () => {
    if (!selectedFile) return

    try {
      const formDataCV = new FormData()
      formDataCV.append("file", selectedFile)

      // Intentar subir a Cloudinary primero
      let cvUrl = null
      try {
        const response = await fetch("/api/upload-cv", {
          method: "POST",
          body: formDataCV,
        })

        if (response.ok) {
          const result = await response.json()
          cvUrl = result.url
          console.log("✅ Perfil Único subido a Cloudinary:", cvUrl)
        }
      } catch (cloudinaryError) {
        console.log("⚠️ Error subiendo a Cloudinary, intentando local...")
        
        // Fallback a almacenamiento local
        try {
          const responseLocal = await fetch("/api/upload-cv-local", {
            method: "POST",
            body: formDataCV,
          })

          if (responseLocal.ok) {
            const resultLocal = await responseLocal.json()
            cvUrl = resultLocal.url
            console.log("✅ Perfil Único subido localmente:", cvUrl)
          }
        } catch (localError) {
          console.error("❌ Error subiendo CV localmente:", localError)
        }
      }

      // Guardar la URL del CV en el estado del formulario
      if (cvUrl) {
        setFormData((prev) => ({
          ...prev,
          cv_url: cvUrl,
        }))
        console.log("✅ Perfil Único URL guardada en formulario:", cvUrl)
      }
    } catch (error) {
      console.error("❌ Error guardando PDF como Perfil Único:", error)
    }
  }, [selectedFile])

  const handlePDFUpload = useCallback(async () => {
    if (!selectedFile) return

    setIsProcessingPDF(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const formDataPDF = new FormData()
      formDataPDF.append("file", selectedFile)

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formDataPDF,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      let result = null
      try {
        result = await response.json()
      } catch (jsonErr) {
        setError("Error inesperado procesando el PDF. Intenta de nuevo.")
        setIsProcessingPDF(false)
        return
      }

      const ocrData = result.ocr || result
      const sanitizedData = sanitizeOcrData(ocrData)

      if (sanitizedData.curp || sanitizedData.rfc || sanitizedData.no_cvu || sanitizedData.telefono) {
        setFormData((prev) => ({
          ...prev,
          ...sanitizedData,
        }))
        setOcrCompleted(true)
        setError(null)
        setIsProcessingPDF(false)
        console.log("PDF procesado exitosamente. Campos extraídos:", sanitizedData)
        
        // Guardar el PDF como Perfil Único automáticamente
        await handleSavePDFAsCV()
        return
      } else {
        setError("No se pudieron extraer datos clave del PDF (CURP, RFC, CVU, Teléfono)")
        setOcrCompleted(true)
        setIsProcessingPDF(false)
        return
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        setError("La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.")
      } else {
        console.error("Error procesando PDF:", error)
        setError("No se pudieron extraer datos clave del PDF (CURP, RFC, CVU, Teléfono)")
      }
      setOcrCompleted(true)
      setIsProcessingPDF(false)
    }
  }, [selectedFile])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Rate limiting check
      const now = Date.now()
      if (submitAttempts >= RATE_LIMITS.MAX_ATTEMPTS && now - lastAttempt < RATE_LIMITS.LOCKOUT_DURATION_MS) {
        setError("Demasiados intentos. Por favor espera 1 minuto antes de intentar nuevamente.")
        return
      }

      // CAPTCHA DESHABILITADO TEMPORALMENTE
      // console.log("🔍 Verificando CAPTCHA en handleSubmit. captchaValue:", captchaValue)
      // if (!captchaValue) {
      //   console.log("❌ CAPTCHA no completado. Mostrando error.")
      //   setError("Por favor, completa el CAPTCHA para continuar")
      //   return
      // }
      // console.log("✅ CAPTCHA verificado. Continuando con el registro...")

      if (!ocrCompleted) {
        setError("Debes procesar un Perfil Único antes de continuar con el registro")
        return
      }

      if (emptyFields.length > 0) {
        const fieldNames = emptyFields.map((field) => field.label).join(", ")
        setError(`Los siguientes campos son obligatorios y no pueden estar vacíos: ${fieldNames}`)
        return
      }

      if (!passwordValidation.isValid) {
        setError("La contraseña no cumple con los requisitos de seguridad mínimos")
        return
      }

      if (formData.password !== formData.confirm_password) {
        setError("Las contraseñas no coinciden")
        return
      }

      setIsLoading(true)
      setError(null)
      setSubmitAttempts((prev) => prev + 1)
      setLastAttempt(Date.now())

      try {
        if (!formData.correo.includes("@")) {
          throw new Error("El correo electrónico debe tener un formato válido")
        }

        // PRIMERO: Verificar que signUp esté cargado y disponible
        if (!isLoaded || !signUp) {
          throw new Error("El sistema de registro no está listo. Intenta de nuevo.")
        }

        try {
          // PASO 1: Crear el usuario en Clerk primero (valida duplicados automáticamente)
          const signUpAttempt = await signUp.create({
            emailAddress: formData.correo,
            password: formData.password,
          })

          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          })

          // Esperar a que el usuario esté disponible en Clerk y obtener el user real
          let realClerkUserId = null;
          try {
            // Esperar a que Clerk cree el usuario y lo devuelva en el frontend
            const userResp = await fetch('/api/auth/me'); // Debes tener un endpoint que devuelva el user.id real
            if (userResp.ok) {
              const userData = await userResp.json();
              realClerkUserId = userData.id;
            }
          } catch {}
          // Fallback: usar el id de signUp si no se pudo obtener el real
          const clerkUserId = realClerkUserId || signUpAttempt.createdUserId || signUpAttempt.id;

          if (!clerkUserId) {
            throw new Error("Error al crear usuario en Clerk: no se obtuvo ID")
          }

          // PASO 2: Mapear y enviar todos los campos requeridos a PostgreSQL
          const dataToSend = {
            // Datos personales
            nombre_completo: formData.nombre_completo || `${formData.nombres || ''} ${formData.apellidos || ''}`.trim(),
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            correo: formData.correo,
            curp: formData.curp,
            rfc: formData.rfc,
            no_cvu: formData.no_cvu,
            telefono: formData.telefono,
            fotografia_url: formData.fotografia_url || "",
            nacionalidad: formData.nacionalidad,
            fecha_nacimiento: formData.fecha_nacimiento,
            genero: formData.genero,
            municipio: formData.municipio,
            estado_nacimiento: formData.estado_nacimiento || "",
            entidad_federativa: formData.entidad_federativa || "",

            // Datos académicos/profesionales
            institucion_id: formData.institucion_id || null,
            institucion: formData.institucion || "",
            departamento: formData.departamento || "",
            ubicacion: formData.ubicacion || "",
            sitio_web: formData.sitio_web || "",
            ultimo_grado_estudios: formData.ultimo_grado_estudios,
            grado_maximo_estudios: formData.grado_maximo_estudios || "",
            empleo_actual: formData.empleo_actual,
            linea_investigacion: Array.isArray(formData.linea_investigacion) ? formData.linea_investigacion.join(', ') : formData.linea_investigacion,
            area_investigacion: Array.isArray(formData.area_investigacion) ? formData.area_investigacion.join(', ') : formData.area_investigacion,
            disciplina: formData.disciplina || "",
            especialidad: formData.especialidad || "",
            orcid: formData.orcid || "",
            nivel: formData.nivel || "",
            nivel_investigador: formData.nivel_investigador || "",
            nivel_actual_id: formData.nivel_actual_id || null,
            fecha_asignacion_nivel: formData.fecha_asignacion_nivel || null,
            puntaje_total: formData.puntaje_total || 0,
            estado_evaluacion: formData.estado_evaluacion || "PENDIENTE",

            // Producción y experiencia
            articulos: formData.articulos || "",
            libros: formData.libros || "",
            capitulos_libros: formData.capitulos_libros || "",
            proyectos_investigacion: formData.proyectos_investigacion || "",
            proyectos_vinculacion: formData.proyectos_vinculacion || "",
            experiencia_docente: formData.experiencia_docente || "",
            experiencia_laboral: formData.experiencia_laboral || "",
            premios_distinciones: formData.premios_distinciones || "",
            idiomas: formData.idiomas || "",
            colaboracion_internacional: formData.colaboracion_internacional || "",
            colaboracion_nacional: formData.colaboracion_nacional || "",
            sni: formData.sni || "",
            anio_sni: formData.anio_sni || null,
            cv_url: formData.cv_url || "",

            // Control y sistema
            tipo_perfil: formData.tipo_perfil,
            nivel_tecnologo_id: formData.nivel_tecnologo_id || null,
            nivel_tecnologo: formData.nivel_tecnologo || "",
            archivo_procesado: selectedFile?.name || "",
            fecha_registro: new Date().toISOString(),
            origen: "ocr",
            slug: formData.slug || "",
            clerk_user_id: clerkUserId,
            activo: true,
            es_admin: false
          };

          // Eliminar password y confirm_password antes de enviar a PostgreSQL
          // Guardar en PostgreSQL (sin password, está en Clerk)
          try {
            const response = await fetch("/api/registro", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();

            if (!response.ok) {
              console.error("❌ ERROR AL GUARDAR EN POSTGRESQL:", responseData);
            } else {
              console.log("✅ Datos guardados en PostgreSQL:", responseData);
            }
          } catch (dbError) {
            console.error("Error de conexión con PostgreSQL:", dbError);
          }

          // PASO 3: Verificar el estado del registro y redirigir
          if (signUpAttempt.status === "complete") {
            await clerk.setActive({ session: signUpAttempt.createdSessionId });
            router.push("/admin");
          } else if (signUpAttempt.status === "missing_requirements") {
            router.push("/verificar-email");
          } else {
            router.push("/verificar-email");
          }
        } catch (clerkError: any) {
          const errorMessage = clerkError.errors?.[0]?.message || ""
          if (errorMessage.toLowerCase().includes("email address is taken")) {
            throw new Error("Este correo electrónico ya está registrado en el sistema. Por favor, inicia sesión.")
          }
          throw new Error(errorMessage || "Error al crear la cuenta")
        }
      } catch (error) {
        setError(`Error al registrar: ${error instanceof Error ? error.message : "Error desconocido"}`)
      } finally {
        setIsLoading(false)
      }
    },
    [
      ocrCompleted,
      emptyFields,
      passwordValidation,
      formData,
      selectedFile,
      signUp,
      router,
      submitAttempts,
      lastAttempt,
    ]
  )

  // Prevent hydration mismatch
  if (!isMounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-blue-600 font-medium">Cargando formulario...</p>
        </div>
      </div>
    )
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

          <div className="grid grid-cols-1 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Step 1: Upload PDF */}
            <FileUploadSection
              selectedFile={selectedFile}
              isProcessing={isProcessingPDF}
              error={error}
              ocrCompleted={ocrCompleted}
              onFileChange={handleFileChange}
              onProcess={handlePDFUpload}
            />

            {/* Step 2: Review and Complete */}
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
                <Alert className="mb-4 md:mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-800 font-semibold">
                    🔍 Todos los campos son obligatorios
                  </AlertTitle>
                  <AlertDescription className="text-red-700">
                    <strong>No puedes completar el registro si algún campo está vacío.</strong> Revisa cada campo cuidadosamente y asegúrate de que toda la información esté completa y correcta.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información Personal */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <User className="h-4 w-4 md:h-5 md:w-5" />
                      Información Personal
                      {(
                        <span className="text-xs md:text-sm text-amber-600 font-normal">(Verificar datos)</span>
                      )}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Columna 1: Nombres */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="nombres"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Nombre(s) *
                        </Label>
                        <Input
                          id="nombres"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleChange}
                          placeholder="Nombre(s)"
                          className={`bg-white border-blue-200 text-blue-900 ${
                            !formData.nombres.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={false}
                        />
                      </div>

                      {/* Columna 2: Apellidos */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="apellidos"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Apellidos *
                        </Label>
                        <Input
                          id="apellidos"
                          name="apellidos"
                          value={formData.apellidos}
                          onChange={handleChange}
                          placeholder="Apellidos"
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.apellidos.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={false}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Columna 1: Teléfono */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="telefono"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Teléfono *
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
                          disabled={false}
                        />
                      </div>

                      {/* Columna 2: Fecha de Nacimiento */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="fecha_nacimiento"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Fecha de Nacimiento *
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
                          disabled={false}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Columna 1: Correo Electrónico */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="correo"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Correo Electrónico *
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
                          disabled={false}
                        />
                      </div>

                      {/* Columna 2: Nacionalidad */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="nacionalidad"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
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
                          disabled={false}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Columna 1: Género */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="genero"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <Users2 className="h-4 w-4" />
                          Género *
                        </Label>
                        <Select 
                          value={formData.genero} 
                          onValueChange={(value) => handleSelectChange("genero", value)}
                        >
                          <SelectTrigger 
                            className={`bg-white border-blue-200 text-blue-900 ${
                              !formData.genero && ocrCompleted ? "border-red-300 bg-red-50" : ""
                            }`}
                          >
                            <SelectValue placeholder="Selecciona género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Prefiero no decirlo">Prefiero no decirlo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Columna 2: Tipo de Perfil */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="tipo_perfil"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <Award className="h-4 w-4" />
                          Tipo de Perfil *
                        </Label>
                        <Select 
                          value={formData.tipo_perfil} 
                          onValueChange={(value) => {
                            handleSelectChange("tipo_perfil", value)
                            // Limpiar el nivel cuando cambia el tipo
                            if (value === "INVESTIGADOR") {
                              handleSelectChange("nivel_tecnologo", "")
                            } else {
                              handleSelectChange("nivel_investigador", "")
                            }
                          }}
                        >
                          <SelectTrigger 
                            className={`bg-white border-blue-200 text-blue-900 ${
                              !formData.tipo_perfil && ocrCompleted ? "border-red-300 bg-red-50" : ""
                            }`}
                          >
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INVESTIGADOR">Investigador</SelectItem>
                            <SelectItem value="TECNOLOGO">Tecnólogo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Nivel dinámico según tipo de perfil */}
                    <div className="grid grid-cols-1 gap-4">
                      {formData.tipo_perfil === "INVESTIGADOR" ? (
                        <div className="space-y-2">
                          <Label
                            htmlFor="nivel_investigador"
                            className="text-blue-900 text-sm font-medium flex items-center gap-2"
                          >
                            <Award className="h-4 w-4" />
                            Nivel de Investigador *
                          </Label>
                          <Select 
                            value={formData.nivel_investigador} 
                            onValueChange={(value) => handleSelectChange("nivel_investigador", value)}
                          >
                            <SelectTrigger 
                              className={`bg-white border-blue-200 text-blue-900 ${
                                !formData.nivel_investigador && ocrCompleted ? "border-red-300 bg-red-50" : ""
                              }`}
                            >
                              <SelectValue placeholder="Selecciona nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Candidato a investigador estatal">Candidato a investigador estatal</SelectItem>
                              <SelectItem value="Investigador estatal nivel I">Investigador estatal nivel I</SelectItem>
                              <SelectItem value="Investigador estatal nivel II">Investigador estatal nivel II</SelectItem>
                              <SelectItem value="Investigador estatal nivel III">Investigador estatal nivel III</SelectItem>
                              <SelectItem value="Investigador excepcional">Investigador excepcional</SelectItem>
                              <SelectItem value="Investigador insignia">Investigador insignia</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-blue-600 mt-1">
                            Selecciona el nivel que corresponda a tu trayectoria científica
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label
                            htmlFor="nivel_tecnologo"
                            className="text-blue-900 text-sm font-medium flex items-center gap-2"
                          >
                            <Award className="h-4 w-4" />
                            Nivel de Tecnólogo *
                          </Label>
                          <Select 
                            value={formData.nivel_tecnologo} 
                            onValueChange={(value) => handleSelectChange("nivel_tecnologo", value)}
                          >
                            <SelectTrigger 
                              className={`bg-white border-blue-200 text-blue-900 ${
                                !formData.nivel_tecnologo && ocrCompleted ? "border-red-300 bg-red-50" : ""
                              }`}
                            >
                              <SelectValue placeholder="Selecciona nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tecnólogo Nivel A">
                                <div className="flex flex-col">
                                  <span className="font-medium">Tecnólogo Nivel A</span>
                                  <span className="text-xs text-gray-500">Estudiantes o egresados recientes</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Tecnólogo Nivel B">
                                <div className="flex flex-col">
                                  <span className="font-medium">Tecnólogo Nivel B</span>
                                  <span className="text-xs text-gray-500">Profesionales con experiencia comprobable</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-blue-600 mt-1">
                            Nivel A: Proyectos iniciales | Nivel B: Experiencia comprobable
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Municipio */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="municipio"
                          className="text-blue-900 text-sm font-medium flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Municipio *
                        </Label>
                        <Select 
                          value={formData.municipio} 
                          onValueChange={(value) => handleSelectChange("municipio", value)}
                        >
                          <SelectTrigger 
                            className={`bg-white border-blue-200 text-blue-900 ${
                              !formData.municipio && ocrCompleted ? "border-red-300 bg-red-50" : ""
                            }`}
                          >
                            <SelectValue placeholder="Selecciona municipio" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {MUNICIPIOS_CHIHUAHUA.map((municipio) => (
                              <SelectItem key={municipio} value={municipio}>
                                {municipio}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Fotografía de Perfil */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {/* Componente de subir foto - 2 columnas */}
                      <div className="md:col-span-2">
                        <UploadFotografia
                          value={formData.fotografia_url}
                          onChange={(url: string) => setFormData((prev) => ({ ...prev, fotografia_url: url }))}
                          nombreCompleto={formData.nombre_completo}
                        />
                      </div>

                      {/* Recomendaciones - 1 columna */}
                      <div className="md:col-span-1">
                        <Alert className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-900 font-semibold text-sm">
                            Recomendaciones para la foto
                          </AlertTitle>
                          <AlertDescription className="text-blue-700 text-xs space-y-1 mt-2">
                            <p>✓ Formato JPG, PNG o WEBP</p>
                            <p>✓ Tamaño máximo: 2MB</p>
                            <p>✓ Foto profesional</p>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>

                  {/* Información Académica y Profesional */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Información Académica y Profesional
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="ultimo_grado_estudios"
                          className="text-blue-900 font-medium flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4" />
                          Último Grado de Estudios *
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
                          disabled={false}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="empleo_actual" className="text-blue-900 font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Empleo Actual *
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
                          disabled={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información Fiscal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Información Fiscal y de Registro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="no_cvu" className="text-blue-900 font-medium flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          CVU/PU *
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
                          disabled={false}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="curp" className="text-blue-900 font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          CURP *
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
                          disabled={false}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rfc" className="text-blue-900 font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          RFC *
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
                          disabled={false}
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
                      <PasswordInput
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Crea una contraseña segura"
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        disabled={false}
                        hasError={!formData.password.trim() && ocrCompleted}
                        label="Contraseña *"
                      />

                      <PasswordInput
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirma tu contraseña"
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={false}
                        hasError={
                          (!formData.confirm_password.trim() && ocrCompleted) ||
                          (!!formData.confirm_password &&
                            !!formData.password &&
                            formData.password !== formData.confirm_password)
                        }
                        label="Confirmar Contraseña *"
                      />
                    </div>

                    {formData.password && ocrCompleted && (
                      <PasswordStrength
                        validation={passwordValidation}
                        confirmPassword={formData.confirm_password}
                        password={formData.password}
                      />
                    )}
                  </div>

                    {/* Área de Investigación como textarea grande */}
                    <div className="space-y-2">
                      <Label htmlFor="area_investigacion" className="text-blue-900 font-medium flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Áreas de Investigación *
                        <span className="text-xs text-blue-600">(Máximo 500 caracteres)</span>
                      </Label>
                      <Textarea
                        id="area_investigacion"
                        placeholder="Describe tus áreas de investigación, especialidades y campos de conocimiento..."
                        value={formData.area_investigacionRaw ?? formData.area_investigacion.join(', ')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 500) {
                            // Guardar el valor crudo para que el usuario pueda escribir espacios
                            setFormData(prev => ({
                              ...prev,
                              area_investigacionRaw: value,
                              area_investigacion: value.split(',').map((area: string) => area.trim()).filter(Boolean)
                            }));
                          }
                        }}
                        className={`min-h-[120px] resize-y ${formData.area_investigacion.length === 0 && ocrCompleted ? "border-red-300 bg-red-50" : ""}`}
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                          {(formData.area_investigacionRaw ?? formData.area_investigacion.join(', ')).length}/500 caracteres
                        </span>
                        {formData.area_investigacion.length === 0 && (
                          <span className="text-red-600">
                            Este campo es obligatorio
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Línea de Investigación */}
                    <div className="space-y-2">
                      <TagsInput
                        value={formData.linea_investigacion}
                        onChange={(tags: string[]) => setFormData(prev => ({ ...prev, linea_investigacion: tags }))}
                        label="Línea de Investigación Específica"
                        placeholder="Escribe una línea de investigación y presiona Enter para agregarla"
                        maxTags={5}
                        required
                        disabled={false}
                        className={formData.linea_investigacion.length === 0 ? "border-red-300" : ""}
                      />
                      {formData.linea_investigacion.length === 0 && (
                        <p className="text-sm text-red-600">
                          Este campo es obligatorio. Agrega al menos una línea de investigación.
                        </p>
                      )}
                      <div className="text-xs text-blue-600">
                        <p>Ejemplos: "Inteligencia Artificial", "Biotecnología", "Energías Renovables", "Ciencias de Datos"</p>
                      </div>
                    </div>
                  {/* Fin de bloque principal del formulario */}

                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Indicador de completitud del formulario */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Progreso del formulario: {requiredFields.length - emptyFields.length}/{requiredFields.length} campos completos
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

                  {/* CAPTCHA DESHABILITADO TEMPORALMENTE */}
                  {/* <div className="flex justify-center my-6">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                      onChange={(value) => {
                        console.log("🔵 CAPTCHA onChange triggered. Value:", value)
                        console.log("🔵 Setting captchaValue state to:", value)
                        setCaptchaValue(value)
                        if (value) {
                          setError(null)
                          console.log("✅ CAPTCHA completado, error limpiado")
                        }
                      }}
                      onExpired={() => {
                        console.log("⚠️ CAPTCHA expiró")
                        setCaptchaValue(null)
                        setError("El CAPTCHA expiró. Por favor, márcalo nuevamente.")
                      }}
                      theme="light"
                    />
                  </div> */}

                  {/* FEEDBACK VISUAL DEL CAPTCHA DESHABILITADO */}
                  {/* {captchaValue && (
                    <div className="text-center text-sm text-green-600 font-medium mb-2 animate-fadeIn">
                      ✅ CAPTCHA verificado correctamente
                    </div>
                  )}
                  {!captchaValue && (
                    <div className="text-center text-sm text-amber-600 mb-2">
                      ⚠️ Marca el checkbox "No soy un robot" para continuar
                    </div>
                  )} */}

                  {/* Clerk CAPTCHA Container */}
                  <div id="clerk-captcha" className="flex justify-center"></div>

                  <Button
                    type="submit"
                    disabled={
                      isLoading || !ocrCompleted || !isFormComplete || !passwordValidation.isValid || !passwordsMatch
                      // || !captchaValue // CAPTCHA DESHABILITADO
                    }
                    className={`w-full shadow-md hover:shadow-lg transition-all duration-300 h-10 md:h-12 text-sm md:text-base ${
                      isFormComplete && passwordValidation.isValid && passwordsMatch
                      // && captchaValue // CAPTCHA DESHABILITADO
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
