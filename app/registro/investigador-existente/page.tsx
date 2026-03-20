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
  "Chápipas",
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
  "Huejoitín",
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
      descripcion: "Miembros del Sistema Nacional de Investigadores (SNI) en el nivel II, con alto impacto en el estado."
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
  nivel_sni: "",
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
              <AlertTitle className="text-amber-800 font-semibold">Importante: Verificación requerida</AlertTitle>
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
                  Las contraseñas coinciden
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium text-red-700">
                  Las contraseñas no coinciden
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RegistroPage() {
  return (
    <div>Página de registro para investigadores existentes</div>
  )
}
