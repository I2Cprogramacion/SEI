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
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UploadFotografia } from "@/components/upload-fotografia"
import { TagsInput } from "@/components/ui/tags-input"
import { AreaSNIISelector } from "@/components/area-snii-selector"
import { RequisitosNivelInvestigador } from "@/components/requisitos-nivel-investigador"
import { TermsAndConditionsModal } from "@/components/terms-and-conditions-modal"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  area_investigacion: string;
  nivel_sni: string;
  disciplina?: string;
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
  dictamen_url?: string;
  grado_snii?: string;
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
  "Batopilas de Manuel Gómez Morán",
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

// Nacionalidades del continente americano
const nacionalidadesAmerica = [
  // América del Norte
  "Estadounidense", "Canadiense", "Mexicana",
  // América Central
  "Beliceña", "Costarricense", "Salvadoreña", "Guatemalteca", "Hondureña", "Nicaragüense", "Panameña",
  // Caribe
  "Antiguana", "Bahamena", "Barbadense", "Cubana", "Dominiquesa", "Dominicana", "Granadina", "Haitiana",
  "Jamaiquina", "Kittiana", "Luciana", "Puertorriqueña", "Santalucense", "Sanvicentina", "Trinitense",
  "Barbudense", "Arubana", "Curazoleña", "Sintmaartense",
  // América del Sur
  "Argentina", "Boliviana", "Brasileña", "Chilena", "Colombiana", "Ecuatoriana", "Guyanesa", "Paraguaya",
  "Peruana", "Surinamesa", "Uruguaya", "Venezolana"
];

// Información completa de niveles de tecnólogo e investigador
const nivelesCompletos = {
  tecnologos: [
    {
      nombre: "Tecnólogo Nivel A",
      descripcion: "Estudiantes o egresados recientes de licenciaturas en áreas de humanidades, ciencias, tecnología e innovación, con experiencia en proyectos iniciales de desarrollo tecnológico, adscritos a empresas, instituciones académicas o centros de investigación."
    },
    {
      nombre: "Tecnólogo Nivel B",
      descripcion: "Profesionales con experiencia comprobable en el desarrollo tecnológico o la innovación en las áreas de humanidades, ciencias, tecnología e innovación, adscritos a empresas, instituciones de educación superior, centros de investigación, o entidades equivalentes. Incluye a quienes cuenten con títulos de propiedad industrial otorgados por el IMPI."
    }
  ],
  investigadores: [
    {
      nombre: "Candidato a Investigador Estatal",
      descripcion: "Personas con nivel mínimo de licenciatura que realizan actividades de producción científica, divulgación y promoción científica, adscritos a instituciones académicas o tecnológicas."
    },
    {
      nombre: "Investigador Estatal Nivel I",
      descripcion: "Profesionales con grado de maestría o estudiantes de doctorado que colaboran en proyectos de investigación, desarrollo tecnológico y/o innovación."
    },
    {
      nombre: "Investigador Estatal Nivel II",
      descripcion: "Investigadores con grado de doctorado que han liderado proyectos científicos o tecnológicos con impacto en el estado y que sean miembros del SNI."
    },
    {
      nombre: "Investigador Estatal Nivel III",
      descripcion: "Miembros del Sistema Nacional de Investigadoras e Investigadores (SNII) en el nivel II, con alto impacto en el estado."
    },
    {
      nombre: "Investigador Excepcional",
      descripcion: "Miembros del SNI en los niveles III o Emérito, reconocidos por su trayectoria científica y tecnológica como referentes estatales en su área de conocimiento, con más de 10 años de experiencia en el proceso ID+i."
    },
    {
      nombre: "Investigador Insigne",
      descripcion: "Distinción otorgada a aquellos investigadores que han alcanzado el más alto nivel de reconocimiento en su trayectoria científica, tecnológica y académica, con un impacto significativo en su área de conocimiento y en la sociedad."
    }
  ]
}

// Descripciones de niveles de investigador (para compatibilidad con tooltips existentes)
const nivelesInvestigadorDescripciones: Record<string, string> = {
  "Candidato a Investigador Estatal": nivelesCompletos.investigadores[0].descripcion,
  "Investigador Estatal Nivel I": nivelesCompletos.investigadores[1].descripcion,
  "Investigador Estatal Nivel II": nivelesCompletos.investigadores[2].descripcion,
  "Investigador Estatal Nivel III": nivelesCompletos.investigadores[3].descripcion,
  "Investigador Excepcional": nivelesCompletos.investigadores[4].descripcion,
  "Investigador Insigne": nivelesCompletos.investigadores[5].descripcion
}


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
  area_investigacion: "",
  nivel_sni: "", // Se mantiene pero ya no es requerido, se determinará automáticamente
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
  dictamen_url: "",
  grado_snii: "",
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
          Subir Perfil Único Completo (PUC)
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-blue-600 px-2">
          Selecciona tu Perfil Único Completo (PUC) en formato PDF para extraer automáticamente tu información académica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="pdf-upload" className="text-sm sm:text-base text-blue-900 font-medium">
            Archivo PDF del Perfil Único Completo (PUC) * (Máximo {FILE_CONSTRAINTS.MAX_SIZE_MB}MB)
          </Label>
          <p className="text-xs text-blue-600">
            Este documento se procesará automáticamente para extraer tu información y se guardará como tu Perfil Único Completo (PUC) en el perfil.
          </p>
          <div className="relative">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              aria-label="Subir archivo PDF del Perfil Único Completo (PUC)"
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
                  Archivo vélido - Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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
              Procesar Perfil Único Completo (PUC)
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
              <AlertTitle className="text-amber-800 font-semibold">\u26a0\ufe0f Importante: Verificación requerida</AlertTitle>
              <AlertDescription className="text-amber-700">
                <div className="space-y-2">
                  <p>
                    El OCR puede contener errores de interpretación. Es <strong>fundamental</strong> que revises y
                    corrijas:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Números de identificación (CURP, RFC, CVU)</li>
                    <li>
                      <strong>Lánea de investigación (captura manual requerida)</strong>
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
                <strong>Tamaño méximo:</strong> {FILE_CONSTRAINTS.MAX_SIZE_MB}MB
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
                <strong>Verificación necesaria:</strong> Siempre revisa los datos extraádos
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
  const showMatchIndicator = confirmPassword.length > 0

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
            Mánimo 8 caracteres
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
            Un carécter especial
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

      {/* Indicador de coincidencia de contraseñas */}
      {showMatchIndicator && (
        <div
          className={`rounded-lg p-3 border ${
            passwordsMatch
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {passwordsMatch ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700">
                  \u2713 Las contraseñas coinciden
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium text-red-700">
                  \u2717 Las contraseñas no coinciden
                </span>
              </>
            )}
          </div>
        </div>
      )}
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
  const [selectedDictamenFile, setSelectedDictamenFile] = useState<File | null>(null)
  const [selectedGradoSNIIFile, setSelectedGradoSNIIFile] = useState<File | null>(null)
  const [showNivelesModal, setShowNivelesModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [lastAttempt, setLastAttempt] = useState(0)
  const [nacionalidadOtro, setNacionalidadOtro] = useState(false)
  
  // ============================================
  // TÉRMINOS Y CONDICIONES
  // ============================================
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Hydration fix effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Inicializar estado de nacionalidad "Otro" basado en el valor inicial
  useEffect(() => {
    if (formData.nacionalidad && !nacionalidadesAmerica.includes(formData.nacionalidad)) {
      setNacionalidadOtro(true)
    }
  }, [])

  // Memoized values
  const passwordValidation = useMemo(() => validatePassword(formData.password), [formData.password])

  const passwordsMatch = formData.password === formData.confirm_password

  // Campos requeridos dinémicos según tipo de perfil
  // Definir exactamente 17 campos requeridos, contando solo linea_investigacion y area_investigacion como un campo cada uno
  const requiredFields = [
    { field: "nombres", label: "Nombre(s)" },
    { field: "apellidos", label: "Apellidos" },
    { field: "correo", label: "Correo Electrónico" },
    { field: "telefono", label: "Teléfono" },
    { field: "ultimo_grado_estudios", label: "Último Grado de Estudios" },
    { field: "empleo_actual", label: "Empleo Actual" },
    { field: "linea_investigacion", label: "Lánea de Investigación" },
    { field: "area_investigacion", label: "Úrea de Investigación" },
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
    if (field.field === "ultimo_grado_estudios") {
      // Validar explácitamente que no esté vacáo ni sea solo espacios
      return !value || (typeof value === 'string' && value.trim() === '');
    }
    if (Array.isArray(value)) {
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
      
      // Generar nombre_completo autométicamente cuando cambien nombres o apellidos
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
          setError("Por favor selecciona un archivo PDF vélido")
          setSelectedFile(null)
          setOcrCompleted(false)
          e.target.value = ""
          return
        }

        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
        if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
          setError(
            `El archivo es demasiado grande. El tamaño méximo permitido es ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB. Tu archivo pesa ${fileSizeMB}MB`
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

      // Subir a Vercel Blob
      let cvUrl: string | null = null
      try {
        console.log("💾 Subiendo Perfil Único a Vercel Blob...")
        const response = await fetch("/api/upload-cv-vercel", {
          method: "POST",
          body: formDataCV,
        })

        if (response.ok) {
          const result = await response.json()
          cvUrl = result.url as string
          console.log("✅ Perfil Único subido a Vercel Blob:", cvUrl)
          
          // Guardar la URL del CV en el estado del formulario
          setFormData((prev) => ({
            ...prev,
            cv_url: cvUrl!,
          }))
          console.log("✅ Perfil Único URL guardada en formulario:", cvUrl)
        } else {
          const errorData = await response.json()
          console.error("❌ Error en respuesta:", errorData)
          throw new Error(errorData.error || "Error al subir el archivo")
        }
      } catch (error) {
        console.error("❌ Error subiendo Perfil Único a Vercel Blob:", error)
        setError(`Error al subir el Perfil Único: ${error instanceof Error ? error.message : "Error desconocido"}`)
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

      console.log("💾 [OCR] Enviando PDF para procesamiento...")
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formDataPDF,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      let result = null
      try {
        result = await response.json()
        console.log("💾 [OCR] Respuesta recibida:", result)
      } catch (jsonErr) {
        console.error("❌ [OCR] Error al parsear respuesta JSON:", jsonErr)
        setError("Error inesperado procesando el PDF. Intenta de nuevo.")
        setIsProcessingPDF(false)
        return
      }

      // ✅ El OCR ahora solo retorna datos extraádos, no guarda en BD
      // Extraer los datos de la respuesta (pueden estar en result directamente o en result.data)
      const ocrData = result.data || result
      
      // Limpiar y sanitizar los datos recibidos
      const sanitizedData = sanitizeOcrData(ocrData)

      console.log("✅ [OCR] Datos sanitizados:", sanitizedData)

      // Verificar si se extrajeron datos útiles
      if (sanitizedData.curp || sanitizedData.rfc || sanitizedData.no_cvu || sanitizedData.telefono || sanitizedData.correo) {
        console.log("✅ [OCR] Datos extraádos exitosamente, actualizando formulario...")
        
        // Actualizar el formulario con los datos extraádos
        setFormData((prev) => ({
          ...prev,
          ...sanitizedData,
        }))
        
        setOcrCompleted(true)
        setError(null)
        setIsProcessingPDF(false)
        
        // Guardar el PDF como Perfil Único autométicamente
        await handleSavePDFAsCV()
        
        console.log("✅ [OCR] Proceso completado. El usuario debe completar los campos faltantes.")
        return
      } else {
        console.warn("\u26a0\ufe0f [OCR] No se extrajeron suficientes datos del PDF")
        setError("No se pudieron extraer suficientes datos del PDF. Por favor, completa los campos manualmente.")
        setOcrCompleted(true) // Permitir continuar con captura manual
        setIsProcessingPDF(false)
        return
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error("❌ [OCR] Error durante el procesamiento:", error)
      
      if (error.name === "AbortError") {
        setError("La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.")
      } else {
        setError("Error al procesar el PDF. Por favor, completa los campos manualmente.")
      }
      
      setOcrCompleted(true) // Permitir continuar con captura manual
      setIsProcessingPDF(false)
    }
  }, [selectedFile, handleSavePDFAsCV])

  // Handlers para Dictamen y Grado SNII
  const handleDictamenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== FILE_CONSTRAINTS.ACCEPTED_TYPE) {
        setError("Por favor selecciona un archivo PDF vélido")
        setSelectedDictamenFile(null)
        e.target.value = ""
        return
      }
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
        setError(
          `El archivo es demasiado grande. El tamaño méximo permitido es ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB. Tu archivo pesa ${fileSizeMB}MB`
        )
        setSelectedDictamenFile(null)
        e.target.value = ""
        return
      }
      setSelectedDictamenFile(file)
      setFormData(prev => ({ ...prev, dictamen_url: `/uploads/${file.name}` }))
      setError(null)
    }
  }, [])

  const handleGradoSNIIChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== FILE_CONSTRAINTS.ACCEPTED_TYPE) {
        setError("Por favor selecciona un archivo PDF vélido")
        setSelectedGradoSNIIFile(null)
        e.target.value = ""
        return
      }
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
        setError(
          `El archivo es demasiado grande. El tamaño méximo permitido es ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB. Tu archivo pesa ${fileSizeMB}MB`
        )
        setSelectedGradoSNIIFile(null)
        e.target.value = ""
        return
      }
      setSelectedGradoSNIIFile(file)
      setFormData(prev => ({ ...prev, grado_snii: `/uploads/${file.name}` }))
      setError(null)
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // ============================================
      // VALIDACIÓN 1: TÉRMINOS Y CONDICIONES
      // ============================================
      if (!termsAccepted) {
        console.log("\u26a0\ufe0f [REGISTRO] Usuario intenta registrarse sin aceptar T&C")
        setShowTermsModal(true)
        return
      }

      // ============================================
      // VALIDACIÓN 2: ARCHIVOS OBLIGATORIOS
      // ============================================
      if (!formData.cv_url && !selectedFile) {
        setError("Debes subir tu Perfil Único (PU) para continuar.")
        return
      }

      if (!formData.dictamen_url && !selectedDictamenFile) {
        setError("Debes subir tu Dictamen SEI para continuar.")
        return
      }

      // Rate limiting check
      const now = Date.now()
      if (submitAttempts >= RATE_LIMITS.MAX_ATTEMPTS && now - lastAttempt < RATE_LIMITS.LOCKOUT_DURATION_MS) {
        setError("Demasiados intentos. Por favor espera 1 minuto antes de intentar nuevamente.")
        return
      }

      // CAPTCHA DESHABILITADO TEMPORALMENTE
      // console.log("✅ Verificando CAPTCHA en handleSubmit. captchaValue:", captchaValue)
      // if (!captchaValue) {
      //   console.log("❌ CAPTCHA no completado. Mostrando error.")
      //   setError("Por favor, completa el CAPTCHA para continuar")
      //   return
      // }
      // console.log("✅ CAPTCHA verificado. Continuando con el registro...")

      if (!ocrCompleted) {
  setError("El procesamiento automético de perfil (OCR) no esté disponible temporalmente. Por favor, captura tus datos manualmente. Puedes continuar con el registro.")
  // Permitir continuar aunque el OCR no esté disponible
      }

      if (emptyFields.length > 0) {
        const fieldNames = emptyFields.map((field) => field.label).join(", ")
        setError(`Los siguientes campos son obligatorios y no pueden estar vacáos: ${fieldNames}`)
        return
      }

      if (!passwordValidation.isValid) {
        setError("La contraseña no cumple con los requisitos de seguridad mánimos")
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
          throw new Error("El correo electrónico debe tener un formato vélido")
        }

        // PRIMERO: Verificar que signUp esté cargado y disponible
        if (!isLoaded || !signUp) {
          throw new Error("El sistema de registro no esté listo. Intenta de nuevo.")
        }

        try {
          console.log("✅ [REGISTRO] Paso 1: Creando usuario en Clerk...")
          
          // PASO 1: Crear el usuario en Clerk primero (valida duplicados autométicamente)
          const signUpAttempt = await signUp.create({
            emailAddress: formData.correo,
            password: formData.password,
          })

          // Obtener el clerk_user_id - puede estar en diferentes lugares según el estado
          // Intentar en orden: createdUserId, id del usuario, o id del signUp
          let clerkUserId: string | null = null
          const signUpObj = signUpAttempt as any // Cast para acceder a propiedades dinémicas
          
          // Opción 1: createdUserId (cuando esté completo)
          if (signUpAttempt.createdUserId) {
            clerkUserId = signUpAttempt.createdUserId
          }
          // Opción 2: verificar si tiene propiedad user con id
          else if (signUpObj.user?.id) {
            clerkUserId = signUpObj.user.id
          }
          // Opción 3: usar el id del signUp mismo
          else if (signUpAttempt.id) {
            clerkUserId = signUpAttempt.id
          }
          // Opción 4: buscar en el objeto cualquier campo que parezca un user ID
          else {
            
            // Intentar encontrar cualquier campo que contenga "user" y "id"
            for (const key of Object.keys(signUpObj)) {
              const value = signUpObj[key]
              if (typeof value === 'string' && value.startsWith('user_')) {
                clerkUserId = value
                break
              }
            }
          }

          if (!clerkUserId) {
            console.error("❌ [REGISTRO] No se pudo obtener clerk_user_id")
            throw new Error("Error al crear usuario en Clerk: no se obtuvo ID del usuario. Por favor, intenta de nuevo.")
          }
          
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          })

          // PASO 2: Guardar datos en tabla temporal registros_pendientes
          // ✅ IMPORTANTE: Los datos se guardan en la BD temporal (no en sessionStorage)
          // y se moverén a la tabla investigadores DESPUÉS de verificar el email
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
            area_investigacion: formData.area_investigacion,
            nivel_sni: formData.nivel_sni,
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
            // Si se subió un archivo PDF, usarlo como CV principal
            cv_url: formData.cv_url || (selectedFile ? `/uploads/${selectedFile.name}` : ""),
            dictamen_url: formData.dictamen_url || (selectedDictamenFile ? `/uploads/${selectedDictamenFile.name}` : ""),
            grado_snii: formData.grado_snii || (selectedGradoSNIIFile ? `/uploads/${selectedGradoSNIIFile.name}` : ""),

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

          // ✅ PASO 3: Guardar en Neon (PostgreSQL)
          // CRÍTICO: El usuario DEBE guardarse en la BD
          
          try {
            const response = await fetch("/api/registro", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();

            // ­ƒö┤ SI FALLA, MOSTRAR ERROR Y DETENER
            if (!response.ok || !responseData.success) {
              console.error("❌ [REGISTRO] ERROR AL GUARDAR EN NEON")
              console.error("   Status HTTP:", response.status)
              console.error("   Respuesta:", responseData)
              console.error("   Detalles técnicos:", responseData.error || responseData.message)
              
              // Mensaje més especáfico para campos faltantes
              let mensajeError = responseData.message || responseData.error
              
              if (responseData.camposFaltantes && responseData.camposFaltantes.length > 0) {
                mensajeError = `❌ CAMPOS OBLIGATORIOS VACÍOS:\n\n${responseData.camposFaltantes.join(', ')}\n\nPor favor, completa todos los campos requeridos.`
              }
              
              // LANZAR error para detener el flujo
              throw new Error(
                mensajeError || 
                `No se pudo guardar el registro (error ${response.status}). Por favor, verifica tus datos e intenta de nuevo.`
              )
            } else {
              console.log("✅ [REGISTRO] Datos guardados en Neon exitosamente")
              console.log("   - ID de investigador:", responseData.id)
              console.log("   - Correo:", responseData.correo)
            }
          } catch (dbError) {
            console.error("❌ [REGISTRO] Error crático al guardar en BD:", dbError)
            
            // MOSTRAR ERROR AL USUARIO Y DETENER FLUJO
            setError(
              dbError instanceof Error ? dbError.message :
              "No se pudo guardar tu registro en la base de datos. Por favor, intenta més tarde."
            )
            
            // IMPORTANTE: Salir aquá, NO continuar con verificación de email
            setIsLoading(false)
            return
          }

          // PASO 4: Redirigir a verificación de email
          // El usuario ya esté en Neon, ahora falta verificar email en Clerk
          
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
            throw new Error("Este correo electrónico ya esté registrado en el sistema. Por favor, inicia sesión.")
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
            <h1 className="text-2xl md:text-4xl font-bold text-blue-900 dark:text-white">Regístrate en SEI</h1>
            <p className="text-sm md:text-lg text-blue-600 max-w-2xl mx-auto px-2">
              Sube tu Perfil Único (PU) en PDF para crear tu cuenta de investigador de forma automática
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* CONSOLIDATED: All Document Uploads (PU + Dictamen + SNII) */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <CardTitle className="text-xl sm:text-2xl text-blue-900 flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  Carga tus Documentos
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-blue-600 px-2">
                  Sube los documentos requeridos para completar tu registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Requisitos */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Requisitos de los archivos
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span><strong>Formato:</strong> Solo archivos PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span><strong>Tamaño máximo:</strong> {FILE_CONSTRAINTS.MAX_SIZE_MB}MB</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span><strong>Contenido:</strong> Perfil Único (PU) actualizado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      <span><strong>Verificación necesaria:</strong> Siempre revisa los datos extraídos</span>
                    </li>
                  </ul>
                </div>

                {/* Perfil Único Section */}
                <div className="space-y-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">1</span>
                    </div>
                    <Label htmlFor="pdf-upload" className="text-sm sm:text-base text-blue-900 font-semibold">
                      Perfil Único Completo (PUC) - Obligatorio *
                    </Label>
                  </div>
                  <p className="text-xs text-blue-700 ml-10">Se procesará automáticamente con OCR - Máximo {FILE_CONSTRAINTS.MAX_SIZE_MB}MB</p>
                  <div className="ml-10">
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      aria-label="Subir archivo PDF del Perfil Único Completo (PUC)"
                      aria-required="true"
                      className="bg-white border-blue-200 text-blue-900 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1.5 file:text-sm file:mr-3 hover:file:bg-blue-100 transition-colors h-10"
                      required
                    />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200 ml-10">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-green-700 font-medium block truncate">{selectedFile.name}</span>
                        <span className="text-xs text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  )}
                  {selectedFile && !isProcessingPDF && (
                    <div className="ml-10">
                      <Button
                        type="button"
                        onClick={handlePDFUpload}
                        disabled={isProcessingPDF}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 h-auto"
                      >
                        {isProcessingPDF ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Procesar con OCR
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {ocrCompleted && (
                    <div className="ml-10 p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-green-700 font-medium">✓ Datos extraídos exitosamente</p>
                      <p className="text-xs text-green-600 mt-1">Verifica los datos en el formulario y corrrige si es necesario</p>
                    </div>
                  )}
                </div>

                {/* Dictamen Section */}
                <div className="space-y-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-700">2</span>
                    </div>
                    <Label htmlFor="dictamen-upload" className="text-sm sm:text-base text-orange-900 font-semibold">
                      Dictamen SEI - Obligatorio *
                    </Label>
                  </div>
                  <p className="text-xs text-orange-700 ml-10">Máximo {FILE_CONSTRAINTS.MAX_SIZE_MB}MB</p>
                  <div className="ml-10">
                    <Input
                      id="dictamen-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleDictamenChange}
                      aria-label="Subir archivo PDF del Dictamen SEI"
                      aria-required="true"
                      className="bg-white border-orange-200 text-orange-900 file:bg-orange-50 file:text-orange-700 file:border-0 file:rounded-md file:px-3 file:py-1.5 file:text-sm file:mr-3 hover:file:bg-orange-100 transition-colors h-10"
                      required
                    />
                  </div>
                  {selectedDictamenFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200 ml-10">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-green-700 font-medium block truncate">{selectedDictamenFile.name}</span>
                        <span className="text-xs text-green-600">{(selectedDictamenFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grado SNII Section */}
                <div className="space-y-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-700">3</span>
                    </div>
                    <Label htmlFor="grado-snii-upload" className="text-sm sm:text-base text-purple-900 font-semibold">
                      Grado SNII - Opcional
                    </Label>
                  </div>
                  <p className="text-xs text-purple-700 ml-10">Sistema Nacional de Investigadoras e Investigadores - Máximo {FILE_CONSTRAINTS.MAX_SIZE_MB}MB</p>
                  <div className="ml-10">
                    <Input
                      id="grado-snii-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleGradoSNIIChange}
                      aria-label="Subir archivo PDF del Grado SNII"
                      className="bg-white border-purple-200 text-purple-900 file:bg-purple-50 file:text-purple-700 file:border-0 file:rounded-md file:px-3 file:py-1.5 file:text-sm file:mr-3 hover:file:bg-purple-100 transition-colors h-10"
                    />
                  </div>
                  {selectedGradoSNIIFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200 ml-10">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-green-700 font-medium block truncate">{selectedGradoSNIIFile.name}</span>
                        <span className="text-xs text-green-600">{(selectedGradoSNIIFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                    ? "\u26a0\ufe0f IMPORTANTE: Revisa todos los datos y completa la información faltante"
                    : "Primero debes procesar un Perfil Único para continuar"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 md:mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-800 font-semibold">
                    ✅ Todos los campos son obligatorios
                  </AlertTitle>
                  <AlertDescription className="text-red-700">
                    <strong>No puedes completar el registro si algún campo esté vacáo.</strong> Revisa cada campo cuidadosamente y asegúrate de que toda la información esté completa y correcta.
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
                          type="tel"
                          inputMode="numeric"
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
                        <Select
                          value={nacionalidadOtro ? "Otro" : formData.nacionalidad}
                          onValueChange={(value) => {
                            if (value === "Otro") {
                              setNacionalidadOtro(true)
                              setFormData(prev => ({ ...prev, nacionalidad: "" }))
                            } else {
                              setNacionalidadOtro(false)
                              setFormData(prev => ({ ...prev, nacionalidad: value }))
                            }
                          }}
                        >
                          <SelectTrigger className={`bg-white border-blue-200 text-blue-900 ${
                            !formData.nacionalidad.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}>
                            <SelectValue placeholder="Selecciona una nacionalidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {nacionalidadesAmerica.map((nacionalidad) => (
                              <SelectItem key={nacionalidad} value={nacionalidad}>
                                {nacionalidad}
                              </SelectItem>
                            ))}
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        {nacionalidadOtro && (
                          <Input
                            id="nacionalidad-otro"
                            name="nacionalidad"
                            value={formData.nacionalidad}
                            onChange={handleChange}
                            placeholder="Escribe tu nacionalidad"
                            className={`bg-white border-blue-200 text-blue-900 mt-2 ${
                              !formData.nacionalidad.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                            }`}
                            required
                          />
                        )}
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

                    {/* Nivel dinémico según tipo de perfil */}
                    <div className="grid grid-cols-1 gap-4">
                      {formData.tipo_perfil === "INVESTIGADOR" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor="nivel_investigador"
                              className="text-blue-900 text-sm font-medium flex items-center gap-2"
                            >
                              <Award className="h-4 w-4" />
                              Nivel de Investigador *
                            </Label>
                            <Dialog open={showNivelesModal} onOpenChange={setShowNivelesModal}>
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setShowNivelesModal(true)
                                  }}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold text-blue-900">
                                    Información de Niveles
                                  </DialogTitle>
                                  <DialogDescription>
                                    Conoce los diferentes niveles de tecnólogos e investigadores disponibles en el sistema
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-6 mt-4">
                                  {/* Tecnólogos */}
                                  <div>
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                      <Users2 className="h-5 w-5" />
                                      Niveles de Tecnólogo
                                    </h3>
                                    <div className="space-y-4">
                                      {nivelesCompletos.tecnologos.map((tecnologo, index) => (
                                        <Card key={index} className="border-blue-200">
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base text-blue-800">
                                              {tecnologo.nombre}
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <p className="text-sm text-gray-700">
                                              {tecnologo.descripcion}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Investigadores */}
                                  <div>
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                      <Award className="h-5 w-5" />
                                      Niveles de Investigador
                                    </h3>
                                    <div className="space-y-4">
                                      {nivelesCompletos.investigadores.map((investigador, index) => (
                                        <Card key={index} className="border-blue-200">
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base text-blue-800">
                                              {investigador.nombre}
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <p className="text-sm text-gray-700">
                                              {investigador.descripcion}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
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
                              {Object.keys(nivelesInvestigadorDescripciones).map((nivel) => (
                                <SelectItem key={nivel} value={nivel}>
                                  {nivel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-blue-600 mt-1">
                            Selecciona el nivel que corresponda a tu trayectoria cientáfica
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor="nivel_tecnologo"
                              className="text-blue-900 text-sm font-medium flex items-center gap-2"
                            >
                              <Award className="h-4 w-4" />
                              Nivel de Tecnólogo *
                            </Label>
                            <Dialog open={showNivelesModal} onOpenChange={setShowNivelesModal}>
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setShowNivelesModal(true)
                                  }}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold text-blue-900">
                                    Información de Niveles
                                  </DialogTitle>
                                  <DialogDescription>
                                    Conoce los diferentes niveles de tecnólogos e investigadores disponibles en el sistema
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-6 mt-4">
                                  {/* Tecnólogos */}
                                  <div>
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                      <Users2 className="h-5 w-5" />
                                      Niveles de Tecnólogo
                                    </h3>
                                    <div className="space-y-4">
                                      {nivelesCompletos.tecnologos.map((tecnologo, index) => (
                                        <Card key={index} className="border-blue-200">
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base text-blue-800">
                                              {tecnologo.nombre}
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <p className="text-sm text-gray-700">
                                              {tecnologo.descripcion}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Investigadores */}
                                  <div>
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                      <Award className="h-5 w-5" />
                                      Niveles de Investigador
                                    </h3>
                                    <div className="space-y-4">
                                      {nivelesCompletos.investigadores.map((investigador, index) => (
                                        <Card key={index} className="border-blue-200">
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base text-blue-800">
                                              {investigador.nombre}
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <p className="text-sm text-gray-700">
                                              {investigador.descripcion}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
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

                    {/* Fotografáa de Perfil */}
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
                    {ocrCompleted && (!formData.curp.trim() || !formData.rfc.trim() || !formData.no_cvu.trim()) && (
                      <Alert className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <AlertTitle className="text-orange-800 font-semibold">
                          ⚠️ CAMPOS OBLIGATORIOS VACÍOS
                        </AlertTitle>
                        <AlertDescription className="text-orange-700">
                          El OCR no pudo extraer tu CURP, RFC o CVU. <strong>Debes completarlos manualmente</strong> para continuar con el registro.
                          <br />
                          <br />
                          <strong>• CURP:</strong> Debe tener exactamente 18 caracteres (ej: TARC800101HDGRRL00)
                          <br />
                          <strong>• RFC:</strong> Debe tener 10-13 caracteres (ej: TARC800101XYZ)
                          <br />
                          <strong>• CVU/PU:</strong> Tu número de identidad académica
                        </AlertDescription>
                      </Alert>
                    )}
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
                          CURP * <span className="text-xs text-gray-500">(18 caracteres)</span>
                        </Label>
                        <Input
                          id="curp"
                          name="curp"
                          value={formData.curp}
                          onChange={handleChange}
                          placeholder="CURP (18 caracteres)"
                          maxLength={18}
                          minLength={18}
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.curp.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={false}
                        />
                        {formData.curp && formData.curp.length < 18 && formData.curp.length > 0 && (
                          <p className="text-xs text-amber-600">La CURP debe tener exactamente 18 caracteres</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rfc" className="text-blue-900 font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          RFC * <span className="text-xs text-gray-500">(10-13 caracteres)</span>
                        </Label>
                        <Input
                          id="rfc"
                          name="rfc"
                          value={formData.rfc}
                          onChange={handleChange}
                          placeholder="RFC (10 o 13 caracteres)"
                          maxLength={13}
                          minLength={10}
                          className={`bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 ${
                            !formData.rfc.trim() && ocrCompleted ? "border-red-300 bg-red-50" : ""
                          }`}
                          required
                          disabled={false}
                        />
                        {formData.rfc && (formData.rfc.length < 12 || formData.rfc.length > 13) && formData.rfc.length > 0 && (
                          <p className="text-xs text-amber-600">El RFC debe tener 12 o 13 caracteres</p>
                        )}
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

                    {/* Úrea de Investigación (selector SNII) */}
                    <div className="space-y-2">
                      <AreaSNIISelector
                        value={formData.area_investigacion}
                        onChange={(value: string) => setFormData(prev => ({ ...prev, area_investigacion: value }))}
                        error={!formData.area_investigacion && ocrCompleted}
                      />
                    </div>

                    {/* Requisitos del Nivel de Investigador */}
                    <div className="space-y-2">
                      <RequisitosNivelInvestigador
                        nivelInvestigador={formData.nivel_investigador}
                        areaInvestigacion={formData.area_investigacion}
                      />
                    </div>

                    {/* Lánea de Investigación */}
                    <div className="space-y-2">
                      <TagsInput
                        value={formData.linea_investigacion}
                        onChange={(tags: string[]) => setFormData(prev => ({ ...prev, linea_investigacion: tags }))}
                        label="Lánea de Investigación Especáfica"
                        placeholder="Escribe una lánea de investigación y presiona Enter para agregarla"
                        maxTags={5}
                        required
                        disabled={false}
                        className={formData.linea_investigacion.length === 0 ? "border-red-300" : ""}
                      />
                      {formData.linea_investigacion.length === 0 && (
                        <p className="text-sm text-red-600">
                          Este campo es obligatorio. Agrega al menos una lánea de investigación.
                        </p>
                      )}
                      <div className="text-xs text-blue-600">
                        <p>Ejemplos: "Inteligencia Artificial", "Biotecnologáa", "Energáas Renovables", "Ciencias de Datos"</p>
                      </div>
                    </div>
                  {/* Fin de bloque principal del formulario */}

                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error en el registro</AlertTitle>
                      <AlertDescription className="whitespace-pre-wrap break-words">
                        {error}
                      </AlertDescription>
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
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE!}
                      onChange={(value) => {
                        console.log("✅ CAPTCHA onChange triggered. Value:", value)
                        console.log("✅ Setting captchaValue state to:", value)
                        setCaptchaValue(value)
                        if (value) {
                          setError(null)
                          console.log("✅ CAPTCHA completado, error limpiado")
                        }
                      }}
                      onExpired={() => {
                        console.log("\u26a0\ufe0f CAPTCHA expiró")
                        setCaptchaValue(null)
                        setError("El CAPTCHA expiró. Por favor, mércalo nuevamente.")
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
                      \u26a0\ufe0f Marca el checkbox "No soy un robot" para continuar
                    </div>
                  )} */}

                  {/* Clerk CAPTCHA Container */}
                  <div id="clerk-captcha" className="flex justify-center"></div>

                  {/* TÉRMINOS Y CONDICIONES - Checkbox + Link */}
                  <div className="space-y-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="accept-terms-checkbox"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => {
                          setTermsAccepted(checked as boolean)
                          console.log(`[TÉRMINOS] Checkbox: ${checked ? 'Aceptado' : 'No aceptado'}`)
                        }}
                        className="mt-1"
                      />
                      <label htmlFor="accept-terms-checkbox" className="text-sm cursor-pointer flex-1 leading-relaxed">
                        <span className="text-gray-700">
                          He leádo y acepto los{" "}
                          <button
                            type="button"
                            onClick={() => {
                              console.log("[TÉRMINOS] Usuario abre modal")
                              setShowTermsModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
                          >
                            Términos y Condiciones
                          </button>
                          {" "}de la Plataforma
                        </span>
                      </label>
                    </div>
                    
                    {/* Visual feedback */}
                    {termsAccepted && (
                      <div className="flex items-center gap-2 text-green-600 text-xs pl-8">
                        <CheckCircle className="h-4 w-4" />
                        <span>\u2713 Términos aceptados</span>
                      </div>
                    )}
                    
                    {!termsAccepted && (
                      <div className="flex items-center gap-2 text-amber-600 text-xs pl-8">
                        <AlertCircle className="h-4 w-4" />
                        <span>Debes aceptar los Términos para continuar</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isLoading || !ocrCompleted || !isFormComplete || !passwordValidation.isValid || !passwordsMatch || !termsAccepted
                      // || !captchaValue // CAPTCHA DESHABILITADO
                    }
                    className={`w-full shadow-md hover:shadow-lg transition-all duration-300 h-10 md:h-12 text-sm md:text-base ${
                      isFormComplete && passwordValidation.isValid && passwordsMatch && termsAccepted
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

      {/* ============================================ */}
      {/* MODAL - TÉRMINOS Y CONDICIONES */}
      {/* ============================================ */}
      <TermsAndConditionsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccept={() => {
          setTermsAccepted(true)
          setShowTermsModal(false)
          console.log("✅ [REGISTRO] Términos y Condiciones aceptados")
        }}
        onDecline={() => {
          setTermsAccepted(false)
          setShowTermsModal(false)
          setError("Debes aceptar los Términos y Condiciones para continuar el registro")
          console.log("❌ [REGISTRO] Registro cancelado - Términos y Condiciones rechazados")
        }}
        isLoading={isLoading}
      />
    </div>
  )
}
