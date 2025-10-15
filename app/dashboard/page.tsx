"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User as UserIcon, LogOut, Building, Award, FileText, Phone, Mail, Briefcase, GraduationCap, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UploadCv } from "@/components/upload-cv"
import { CvViewerEnhanced } from "@/components/cv-viewer-enhanced"
import { TestButton } from "@/components/test-button"

interface User {
  id: number
  nombre: string
  nombre_completo?: string
  email: string
  correo?: string
  curp?: string
  rfc?: string
  no_cvu?: string
  telefono?: string
  nivel?: string
  area?: string
  area_investigacion?: string
  linea_investigacion?: string
  institucion?: string
  fotografia_url?: string
  cv_url?: string
  ultimo_grado_estudios?: string
  empleo_actual?: string
  nacionalidad?: string
  fecha_nacimiento?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Cargar datos del usuario desde el API
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (!response.ok) {
          // Si no está autenticado, redirigir al login
          router.push("/iniciar-sesion")
          return
        }

        const data = await response.json()
        setUser(data.user)
        
        // Actualizar también localStorage para el navbar
        localStorage.setItem("user", JSON.stringify(data.user))
        window.dispatchEvent(new CustomEvent('userUpdated'))
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        router.push("/iniciar-sesion")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/iniciar-sesion")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700 mx-auto"></div>
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
            <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
            <p className="text-blue-600">Bienvenido a tu panel de investigador</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        {/* Información del usuario */}
        <Card className="mb-8 bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              Perfil del Investigador
            </CardTitle>
            <CardDescription className="text-blue-600">
              Información completa de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fotografía y datos básicos */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.fotografia_url || ""} alt={user.nombre_completo || user.nombre} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                  {(user.nombre_completo || user.nombre)?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">{user.nombre_completo || user.nombre}</h3>
                  <p className="text-blue-600 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user.correo || user.email}
                  </p>
                  {user.telefono && (
                    <p className="text-blue-600 flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      {user.telefono}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-100">
              {user.curp && (
                <div>
                  <label className="text-sm font-medium text-blue-700">CURP</label>
                  <p className="text-blue-900">{user.curp}</p>
                </div>
              )}
              {user.rfc && (
                <div>
                  <label className="text-sm font-medium text-blue-700">RFC</label>
                  <p className="text-blue-900">{user.rfc}</p>
                </div>
              )}
              {user.no_cvu && (
                <div>
                  <label className="text-sm font-medium text-blue-700">CVU</label>
                  <p className="text-blue-900">{user.no_cvu}</p>
                </div>
              )}
              {user.ultimo_grado_estudios && (
                <div>
                  <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Último grado de estudios
                  </label>
                  <p className="text-blue-900">{user.ultimo_grado_estudios}</p>
                </div>
              )}
              {user.empleo_actual && (
                <div>
                  <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Empleo actual
                  </label>
                  <p className="text-blue-900">{user.empleo_actual}</p>
                </div>
              )}
              {user.institucion && (
                <div>
                  <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    Institución
                  </label>
                  <p className="text-blue-900">{user.institucion}</p>
                </div>
              )}
              {user.linea_investigacion && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-blue-700">Línea de investigación</label>
                  <p className="text-blue-900">{user.linea_investigacion}</p>
                </div>
              )}
              {user.area_investigacion && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-blue-700">Área de investigación</label>
                  <p className="text-blue-900">{user.area_investigacion}</p>
                </div>
              )}
              {user.nivel && (
                <div>
                  <label className="text-sm font-medium text-blue-700">Nivel SNI</label>
                  <p className="text-blue-900">{user.nivel}</p>
                </div>
              )}
              {user.nacionalidad && (
                <div>
                  <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Nacionalidad
                  </label>
                  <p className="text-blue-900">{user.nacionalidad}</p>
                </div>
              )}
              {user.fecha_nacimiento && (
                <div>
                  <label className="text-sm font-medium text-blue-700">Fecha de nacimiento</label>
                  <p className="text-blue-900">{new Date(user.fecha_nacimiento).toLocaleDateString('es-MX')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Curriculum Vitae */}
        <Card className="mb-8 bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Curriculum Vitae
            </CardTitle>
            <CardDescription className="text-blue-600">
              Gestiona tu curriculum vitae para que sea visible en tu perfil público
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.cv_url ? (
              <div className="space-y-4">
                {/* Botón de prueba */}
                <TestButton />
                
                <CvViewerEnhanced 
                  cvUrl={user.cv_url} 
                  investigadorNombre={user.nombre_completo || user.nombre}
                  showAsCard={true}
                />
                <UploadCv
                  value={user.cv_url}
                  onChange={async (url) => {
                    console.log("=== onChange LLAMADO (CON CV) ===")
                    console.log("URL recibida:", url)
                    
                    // Actualizar el CV en la base de datos
                    try {
                      const token = localStorage.getItem('token')
                      console.log("Token:", token ? "Existe" : "NO EXISTE")
                      console.log("Email usuario:", user.correo || user.email)
                      
                      console.log("Llamando a /api/investigadores/update-cv...")
                      const response = await fetch('/api/investigadores/update-cv', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                          'x-user-email': user.correo || user.email
                        },
                        body: JSON.stringify({ cv_url: url })
                      })
                      
                      console.log("Response status:", response.status)
                      const responseData = await response.json()
                      console.log("Response data:", responseData)
                      
                      if (response.ok) {
                        console.log("✅ BD actualizada correctamente")
                        // Actualizar el estado local
                        setUser({ ...user, cv_url: url })
                        
                        // Actualizar localStorage para mantener sincronizado
                        const updatedUser = { ...user, cv_url: url }
                        localStorage.setItem("user", JSON.stringify(updatedUser))
                        window.dispatchEvent(new CustomEvent('userUpdated'))
                        
                        console.log("🔄 FORZANDO RECARGA INMEDIATA (CON CV)...")
                        // Forzar recarga inmediata con cache-busting
                        const currentUrl = new URL(window.location.href)
                        currentUrl.searchParams.set('_t', Date.now().toString())
                        window.location.href = currentUrl.toString()
                      } else {
                        console.error("❌ Error en la respuesta:", responseData)
                        alert(`Error al actualizar: ${responseData.error || 'Error desconocido'}. Por favor, recarga la página manualmente (F5).`)
                      }
                    } catch (error) {
                      console.error('❌ Error al actualizar CV:', error)
                      alert('Error al actualizar el CV. Por favor, recarga la página manualmente (F5).')
                    }
                  }}
                  nombreCompleto={user.nombre_completo || user.nombre}
                  showPreview={false}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-700 font-medium mb-1">No has subido tu CV aún</p>
                  <p className="text-sm text-blue-600">
                    Sube tu curriculum vitae para que sea visible en tu perfil público
                  </p>
                </div>
                <UploadCv
                  value={user.cv_url || ""}
                  onChange={async (url) => {
                    console.log("=== onChange LLAMADO (SIN CV) ===")
                    console.log("URL recibida:", url)
                    
                    // Actualizar el CV en la base de datos
                    try {
                      const token = localStorage.getItem('token')
                      console.log("Token:", token ? "Existe" : "NO EXISTE")
                      console.log("Email usuario:", user.correo || user.email)
                      
                      console.log("Llamando a /api/investigadores/update-cv...")
                      const response = await fetch('/api/investigadores/update-cv', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                          'x-user-email': user.correo || user.email
                        },
                        body: JSON.stringify({ cv_url: url })
                      })
                      
                      console.log("Response status:", response.status)
                      const responseData = await response.json()
                      console.log("Response data:", responseData)
                      
                      if (response.ok) {
                        console.log("✅ BD actualizada correctamente")
                        // Actualizar el estado local
                        setUser({ ...user, cv_url: url })
                        
                        // Actualizar localStorage para mantener sincronizado
                        const updatedUser = { ...user, cv_url: url }
                        localStorage.setItem("user", JSON.stringify(updatedUser))
                        window.dispatchEvent(new CustomEvent('userUpdated'))
                        
                        console.log("🔄 FORZANDO RECARGA INMEDIATA (SIN CV)...")
                        // Forzar recarga inmediata con cache-busting
                        const currentUrl = new URL(window.location.href)
                        currentUrl.searchParams.set('_t', Date.now().toString())
                        window.location.href = currentUrl.toString()
                      } else {
                        console.error("❌ Error en la respuesta:", responseData)
                        alert(`Error al actualizar: ${responseData.error || 'Error desconocido'}. Por favor, recarga la página manualmente (F5).`)
                      }
                    } catch (error) {
                      console.error('❌ Error al actualizar CV:', error)
                      alert('Error al actualizar el CV. Por favor, recarga la página manualmente (F5).')
                    }
                  }}
                  nombreCompleto={user.nombre_completo || user.nombre}
                  showPreview={true}
                />
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
