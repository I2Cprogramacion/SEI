"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, LogOut, Building, Award, FileText, Edit, Save, Eye, X, Calendar, ExternalLink, Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  nombre: string
  email: string
  nivel?: string
  area?: string
  institucion?: string
  telefono?: string
  biografia?: string
  lineaInvestigacion?: string
  ultimoGradoEstudios?: string
  empleoActual?: string
  nacionalidad?: string
  fechaNacimiento?: string
}

interface Proyecto {
  id: number
  titulo: string
  descripcion: string
  resumen: string
  categoria: string
  estado: string
  fechaPublicacion: string
  archivo?: string
  slug: string
}

interface MisProyectosProps {
  userEmail: string
  userName: string
}

function MisProyectos({ userEmail, userName }: MisProyectosProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMisProyectos = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/proyectos')
        const data = await response.json()
        
        if (response.ok) {
          // Filtrar solo los proyectos del usuario actual
          const misProyectos = data.proyectos.filter((proyecto: any) => 
            proyecto.email === userEmail || proyecto.autor === userName
          )
          
          // Transformar datos al formato esperado
          const proyectosFormateados = misProyectos.map((proyecto: any) => ({
            id: proyecto.id,
            titulo: proyecto.titulo,
            descripcion: proyecto.descripcion,
            resumen: proyecto.resumen,
            categoria: proyecto.categoria,
            estado: proyecto.estadoProyecto || 'Activo',
            fechaPublicacion: proyecto.fechaPublicacion || proyecto.fechaCreacion?.split('T')[0] || new Date().toISOString().split('T')[0],
            archivo: proyecto.archivo,
            slug: proyecto.slug
          }))
          
          setProyectos(proyectosFormateados)
        } else {
          console.error('Error en la respuesta:', data.error)
          setProyectos([])
        }
      } catch (error) {
        console.error("Error fetching mis proyectos:", error)
        setProyectos([])
      } finally {
        setLoading(false)
      }
    }

    fetchMisProyectos()
  }, [userEmail, userName])

  if (loading) {
    return (
      <div className="mt-8">
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900">Mis Proyectos</CardTitle>
            <CardDescription className="text-blue-600">
              Proyectos que has subido a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-2 text-blue-600">Cargando proyectos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-blue-900">Mis Proyectos</CardTitle>
              <CardDescription className="text-blue-600">
                Proyectos que has subido a la plataforma ({proyectos.length})
              </CardDescription>
            </div>
            <Button asChild className="bg-blue-700 text-white hover:bg-blue-800">
              <Link href="/proyectos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {proyectos.length > 0 ? (
            <div className="space-y-4">
              {proyectos.map((proyecto) => (
                <div key={proyecto.id} className="border border-blue-100 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-blue-900 mb-1">
                            {proyecto.titulo}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-blue-700 text-white text-xs">{proyecto.categoria}</Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              proyecto.estado === 'Activo' ? 'border-green-200 text-green-700' :
                              proyecto.estado === 'Completado' ? 'border-gray-200 text-gray-700' :
                              'border-yellow-200 text-yellow-700'
                            }`}
                          >
                            {proyecto.estado}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-blue-600 line-clamp-2">
                        {proyecto.resumen || proyecto.descripcion}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-blue-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(proyecto.fechaPublicacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {proyecto.archivo && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Documento disponible</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        asChild
                      >
                        <Link href={proyecto.archivo || `/proyectos/${proyecto.slug}`}>
                          <ExternalLink className="mr-2 h-3 w-3" />
                          {proyecto.archivo ? 'Ver documento' : 'Ver detalles'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-blue-300 mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-blue-900">No tienes proyectos aún</h4>
              <p className="text-sm text-blue-600 mb-6">
                Sube tu primer proyecto de investigación para que aparezca aquí.
              </p>
              <Button asChild className="bg-blue-700 text-white hover:bg-blue-800">
                <Link href="/proyectos/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Subir mi primer proyecto
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario está logueado
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/iniciar-sesion")
      return
    }

    try {
      const userObj = JSON.parse(userData)
      
      // Verificar si el usuario es admin
      if (!userObj.isAdmin) {
        console.log("Acceso denegado: Usuario no es admin")
        router.push("/")
        return
      }
      
      setUser(userObj)
    } catch (error) {
      console.error("Error al parsear datos del usuario:", error)
      router.push("/iniciar-sesion")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/iniciar-sesion")
  }

  const handleEdit = () => {
    setEditedUser({ ...user })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedUser(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Aquí iría la lógica para guardar en la base de datos
      // Por ahora solo actualizamos el localStorage
      localStorage.setItem("user", JSON.stringify(editedUser))
      setUser(editedUser)
      setIsEditing(false)
      setEditedUser(null)
    } catch (error) {
      console.error("Error al guardar:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof User, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value })
    }
  }

  const generatePublicProfileSlug = (name: string) => {
    if (!name) return 'usuario'
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
      || 'usuario'
    return slug
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Panel de Administración</h1>
            <p className="text-blue-600">Gestiona el sistema y la información de investigadores</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              asChild 
              variant="outline" 
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Link href={`/investigadores/${generatePublicProfileSlug(user.nombre || user.email)}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Perfil Público
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Información del usuario */}
        <Card className="mb-8 bg-white border-blue-100">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-blue-900 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Perfil del Investigador
                </CardTitle>
                <CardDescription className="text-blue-600">
                  {isEditing ? "Edita tu información personal" : "Información básica de tu cuenta"}
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-blue-700">Nombre completo</Label>
                    <Input
                      id="nombre"
                      value={editedUser?.nombre || ""}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-blue-700">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedUser?.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium text-blue-700">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={editedUser?.telefono || ""}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nivel" className="text-sm font-medium text-blue-700">Nivel SNI</Label>
                    <Input
                      id="nivel"
                      value={editedUser?.nivel || ""}
                      onChange={(e) => handleInputChange("nivel", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-sm font-medium text-blue-700">Área de investigación</Label>
                    <Input
                      id="area"
                      value={editedUser?.area || ""}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institucion" className="text-sm font-medium text-blue-700">Institución</Label>
                    <Input
                      id="institucion"
                      value={editedUser?.institucion || ""}
                      onChange={(e) => handleInputChange("institucion", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ultimoGradoEstudios" className="text-sm font-medium text-blue-700">Último grado de estudios</Label>
                    <Input
                      id="ultimoGradoEstudios"
                      value={editedUser?.ultimoGradoEstudios || ""}
                      onChange={(e) => handleInputChange("ultimoGradoEstudios", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empleoActual" className="text-sm font-medium text-blue-700">Empleo actual</Label>
                    <Input
                      id="empleoActual"
                      value={editedUser?.empleoActual || ""}
                      onChange={(e) => handleInputChange("empleoActual", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lineaInvestigacion" className="text-sm font-medium text-blue-700">Línea de investigación</Label>
                  <Input
                    id="lineaInvestigacion"
                    value={editedUser?.lineaInvestigacion || ""}
                    onChange={(e) => handleInputChange("lineaInvestigacion", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biografia" className="text-sm font-medium text-blue-700">Biografía</Label>
                  <Textarea
                    id="biografia"
                    value={editedUser?.biografia || ""}
                    onChange={(e) => handleInputChange("biografia", e.target.value)}
                    className="border-blue-200 focus:border-blue-500 min-h-[100px]"
                    placeholder="Cuéntanos sobre tu trayectoria académica y profesional..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-700">Nombre completo</label>
                  <p className="text-blue-900">{user.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Correo electrónico</label>
                  <p className="text-blue-900">{user.email}</p>
                </div>
                {user.telefono && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">Teléfono</label>
                    <p className="text-blue-900">{user.telefono}</p>
                  </div>
                )}
                {user.nivel && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">Nivel SNI</label>
                    <p className="text-blue-900">{user.nivel}</p>
                  </div>
                )}
                {user.area && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">Área de investigación</label>
                    <p className="text-blue-900">{user.area}</p>
                  </div>
                )}
                {user.institucion && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">Institución</label>
                    <p className="text-blue-900">{user.institucion}</p>
                  </div>
                )}
                {user.ultimoGradoEstudios && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">Último grado de estudios</label>
                    <p className="text-blue-900">{user.ultimoGradoEstudios}</p>
                  </div>
                )}
                {user.empleoActual && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">Empleo actual</label>
                    <p className="text-blue-900">{user.empleoActual}</p>
                  </div>
                )}
                {user.lineaInvestigacion && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-blue-700">Línea de investigación</label>
                    <p className="text-blue-900">{user.lineaInvestigacion}</p>
                  </div>
                )}
                {user.biografia && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-blue-700">Biografía</label>
                    <p className="text-blue-900 leading-relaxed">{user.biografia}</p>
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

        {/* Mis Proyectos */}
        <MisProyectos userEmail={user.email} userName={user.nombre} />
      </div>
    </div>
  )
}
