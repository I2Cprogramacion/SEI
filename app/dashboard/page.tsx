"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  User as UserIcon, 
  LogOut, 
  Building, 
  Award, 
  FileText, 
  Phone, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Edit, 
  Loader2, 
  AlertCircle,
  Users,
  TrendingUp,
  BookOpen,
  Network,
  MessageCircle,
  UserPlus,
  BarChart3,
  Eye,
  Sparkles
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

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
}

interface Sugerencia {
  id: number
  name: string
  email: string
  institution?: string
  area?: string
  lineaInvestigacion?: string
  fotografiaUrl?: string
  title?: string
  slug: string
  razonSugerencia?: string
}

interface Estadisticas {
  publicaciones: number
  proyectos: number
  conexiones: number
  perfilCompleto: number
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [investigadorData, setInvestigadorData] = useState<InvestigadorData | null>(null)
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    publicaciones: 0,
    proyectos: 0,
    conexiones: 0,
    perfilCompleto: 0
  })
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingSugerencias, setIsLoadingSugerencias] = useState(true)
  const [isLoadingEstadisticas, setIsLoadingEstadisticas] = useState(true)

  // Cargar datos del investigador
  useEffect(() => {
    const cargarDatos = async () => {
      if (!isLoaded || !user) return

      try {
        const response = await fetch("/api/investigadores/perfil")
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setInvestigadorData(result.data)
          }
        } else {
          console.warn("No se pudieron cargar los datos del perfil desde PostgreSQL")
        }
      } catch (error) {
        console.error("Error al cargar datos del investigador:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    cargarDatos()
  }, [isLoaded, user])

  // Cargar sugerencias de colaboración
  useEffect(() => {
    const cargarSugerencias = async () => {
      if (!isLoaded || !user) return

      try {
        const response = await fetch("/api/dashboard/sugerencias")
        if (response.ok) {
          const data = await response.json()
          setSugerencias(data)
        }
      } catch (error) {
        console.error("Error al cargar sugerencias:", error)
      } finally {
        setIsLoadingSugerencias(false)
      }
    }

    cargarSugerencias()
  }, [isLoaded, user])

  // Cargar estadísticas
  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!isLoaded || !user) return

      try {
        const response = await fetch("/api/dashboard/estadisticas")
        if (response.ok) {
          const data = await response.json()
          setEstadisticas(data)
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setIsLoadingEstadisticas(false)
      }
    }

    cargarEstadisticas()
  }, [isLoaded, user])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (!isLoaded || isLoadingData) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-700 mx-auto" />
          <p className="mt-4 text-blue-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Dashboard Social</h1>
            <p className="text-blue-600">Tu red de colaboración científica</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BookOpen className="h-8 w-8 opacity-80" />
                {isLoadingEstadisticas ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">{estadisticas.publicaciones}</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-sm">Publicaciones</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 opacity-80" />
                {isLoadingEstadisticas ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">{estadisticas.proyectos}</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-100 text-sm">Proyectos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 opacity-80" />
                {isLoadingEstadisticas ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">{estadisticas.conexiones}</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 text-sm">Conexiones</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 opacity-80" />
                {isLoadingEstadisticas ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">{estadisticas.perfilCompleto}%</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-orange-100 text-sm">Perfil Completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Mensaje informativo si no hay datos de PostgreSQL */}
        {!investigadorData && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Perfil incompleto</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    No se encontraron datos adicionales en tu perfil. Haz clic en "Editar Perfil" para completar tu información.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del usuario */}
        <Card className="mb-8 bg-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-blue-900 flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Perfil del Investigador
              </CardTitle>
              <CardDescription className="text-blue-600">
                Información completa de tu cuenta
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/dashboard/editar-perfil")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto y datos básicos */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={investigadorData?.fotografia_url || ""} alt={investigadorData?.nombre_completo || "Usuario"} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {(investigadorData?.nombre_completo || user.fullName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-900">
                  {investigadorData?.nombre_completo || user.fullName || user.firstName || "Usuario"}
                </h2>
                <p className="text-blue-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {investigadorData?.correo || user.primaryEmailAddress?.emailAddress || "No disponible"}
                </p>
                {investigadorData?.telefono && (
                  <p className="text-blue-600 flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    {investigadorData.telefono}
                  </p>
                )}
              </div>
            </div>

            {/* Información detallada */}
            {investigadorData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-100">
                {investigadorData.empleo_actual && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Empleo Actual
                    </label>
                    <p className="text-blue-900">{investigadorData.empleo_actual}</p>
                  </div>
                )}
                
                {investigadorData.ultimo_grado_estudios && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Último Grado de Estudios
                    </label>
                    <p className="text-blue-900">{investigadorData.ultimo_grado_estudios}</p>
                  </div>
                )}

                {investigadorData.area_investigacion && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Área de Investigación
                    </label>
                    <p className="text-blue-900">{investigadorData.area_investigacion}</p>
                  </div>
                )}

                {investigadorData.linea_investigacion && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Línea de Investigación
                    </label>
                    <p className="text-blue-900">{investigadorData.linea_investigacion}</p>
                  </div>
                )}

                {investigadorData.no_cvu && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700">CVU/PU</label>
                    <p className="text-blue-900">{investigadorData.no_cvu}</p>
                  </div>
                )}

                {investigadorData.nacionalidad && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Nacionalidad
                    </label>
                    <p className="text-blue-900">{investigadorData.nacionalidad}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Mi Institución
              </CardTitle>
              <CardDescription className="text-blue-600">
                Gestiona tu información institucional
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Reconocimientos
              </CardTitle>
              <CardDescription className="text-blue-600">
                Ver tus premios y distinciones
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Publicaciones
              </CardTitle>
              <CardDescription className="text-blue-600">
                Gestiona tu producción científica
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="mt-8">
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Resumen de Actividad</CardTitle>
              <CardDescription className="text-blue-600">
                Estadísticas de tu perfil de investigador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">0</div>
                  <div className="text-sm text-blue-600">Publicaciones</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">0</div>
                  <div className="text-sm text-green-600">Proyectos</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">0</div>
                  <div className="text-sm text-purple-600">Colaboraciones</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">0</div>
                  <div className="text-sm text-orange-600">Premios</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
