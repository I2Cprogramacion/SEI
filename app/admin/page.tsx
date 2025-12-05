"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Building, Award, TrendingUp, AlertTriangle, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { FeaturedResearchers } from "@/components/featured-researchers"
import { RecentProjects } from "@/components/recent-projects"
import { MetricCard, ProgressCard } from "@/components/admin/metric-cards"

// Interfaces para tipos de datos
interface DashboardStats {
  totalInvestigadores: number
  totalProyectos: number
  totalPublicaciones: number
  totalInstituciones: number
  investigadoresNuevos: number
  proyectosActivos: number
  publicacionesRecientes: number
  alertas: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestigadores: 0,
    totalProyectos: 0,
    totalPublicaciones: 0,
    totalInstituciones: 0,
    investigadoresNuevos: 0,
    proyectosActivos: 0,
    publicacionesRecientes: 0,
    alertas: 0,
  })
  const [loading, setLoading] = useState(true)

  // Verificar que el usuario es admin (no evaluador)
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/verificar-acceso')
        if (response.ok) {
          const data = await response.json()
          // Si es evaluador pero no admin, redirigir a instituciones
          if (data.esEvaluador && !data.esAdmin) {
            router.push('/admin/instituciones')
            return
          }
          // Si no tiene acceso, redirigir al dashboard
          if (!data.tieneAcceso) {
            router.push('/dashboard')
            return
          }
        }
      } catch (error) {
        console.error('Error verificando acceso:', error)
      }
    }
    checkAdmin()
  }, [router])

  // Cargar estadísticas reales desde las APIs
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Cargar datos de todas las APIs en paralelo
        const [investigadoresRes, proyectosRes, publicacionesRes, institucionesRes] = await Promise.all([
          fetch('/api/investigadores').catch(() => ({ ok: false })),
          fetch('/api/proyectos').catch(() => ({ ok: false })),
          fetch('/api/publicaciones').catch(() => ({ ok: false })),
          fetch('/api/instituciones').catch(() => ({ ok: false }))
        ])

        // Procesar datos de investigadores
        let investigadores = [];
        if (investigadoresRes instanceof Response && investigadoresRes.ok) {
          const investigadoresData = await investigadoresRes.json();
          investigadores = investigadoresData.investigadores || investigadoresData || [];
        }

        // Procesar datos de proyectos
        let proyectos = [];
        if (proyectosRes instanceof Response && proyectosRes.ok) {
          const proyectosData = await proyectosRes.json();
          proyectos = proyectosData.proyectos || proyectosData || [];
        }

        // Procesar datos de publicaciones
        let publicaciones = [];
        if (publicacionesRes instanceof Response && publicacionesRes.ok) {
          const publicacionesData = await publicacionesRes.json();
          publicaciones = publicacionesData.publicaciones || publicacionesData || [];
        }

        // Procesar datos de instituciones
        let instituciones = [];
        if (institucionesRes instanceof Response && institucionesRes.ok) {
          const institucionesData = await institucionesRes.json();
          instituciones = institucionesData.instituciones || institucionesData || [];
        }

        // Calcular estadísticas
        const ahora = new Date()
        const haceUnMes = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

        const investigadoresNuevos = investigadores.filter((inv: any) => 
          new Date(inv.fecha_registro || inv.createdAt) >= haceUnMes
        ).length;

        const proyectosActivos = proyectos.filter((proj: any) => 
          proj.estado === 'activo' || proj.estado === 'en_progreso'
        ).length;

        const publicacionesRecientes = publicaciones.filter((pub: any) => 
          new Date(pub.fecha_creacion || pub.fecha_publicacion || pub.createdAt) >= haceUnMes
        ).length;

        // Calcular alertas (perfiles incompletos)
        const alertas = investigadores.filter((inv: any) => 
          !inv.nombre_completo || !inv.correo || !inv.institucion
        ).length;

        setStats({
          totalInvestigadores: investigadores.length,
          totalProyectos: proyectos.length,
          totalPublicaciones: publicaciones.length,
          totalInstituciones: instituciones.length,
          investigadoresNuevos,
          proyectosActivos,
          publicacionesRecientes,
          alertas,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        // Mantener datos por defecto en caso de error
        setStats({
          totalInvestigadores: 0,
          totalProyectos: 0,
          totalPublicaciones: 0,
          totalInstituciones: 0,
          investigadoresNuevos: 0,
          proyectosActivos: 0,
          publicacionesRecientes: 0,
          alertas: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="w-full">
      <div className="w-full py-6 md:py-8 px-4 md:px-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Gestiona la plataforma SEI desde aquí</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-sm hover:shadow-md transition-all flex-1 sm:flex-initial" 
              asChild
            >
              <Link href="/">
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Ver sitio público</span>
                <span className="sm:hidden">Sitio público</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-sm hover:shadow-md transition-all flex-1 sm:flex-initial"
              onClick={() => window.location.reload()}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
              <span className="sm:hidden">Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-xl"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mb-2"></div>
                    <div className="animate-pulse bg-gray-200 h-2 w-full rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Link href="/admin/investigadores">
                <MetricCard
                  title="Total Investigadores"
                  value={stats.totalInvestigadores}
                  change={{
                    value: stats.investigadoresNuevos,
                    isPositive: true,
                    label: "nuevos este mes"
                  }}
                  icon={Users}
                  iconColor="text-blue-600"
                />
              </Link>

              <Link href="/admin/proyectos">
                <ProgressCard
                  title="Proyectos Activos"
                  current={stats.proyectosActivos}
                  total={stats.totalProyectos}
                  icon={FileText}
                  iconColor="text-blue-600"
                />
              </Link>

              <Link href="/admin/publicaciones">
                <MetricCard
                  title="Publicaciones"
                  value={stats.totalPublicaciones}
                  change={{
                    value: stats.publicacionesRecientes,
                    isPositive: true,
                    label: "este mes"
                  }}
                  icon={Award}
                  iconColor="text-blue-600"
                />
              </Link>

              <Link href="/admin/instituciones">
                <MetricCard
                  title="Instituciones"
                  value={stats.totalInstituciones}
                  description="registradas en la plataforma"
                  icon={Building}
                  iconColor="text-blue-600"
                />
              </Link>
            </>
          )}
        </div>


        {/* Alertas y acciones rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Acciones Rápidas</CardTitle>
                <CardDescription className="text-gray-500">
                  Gestiona los elementos principales de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white justify-start h-auto py-4 px-4 shadow-sm hover:shadow-md transition-all group"
                    asChild
                  >
                    <Link href="/admin/investigadores">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center mr-3 transition-colors">
                        <Users className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Investigadores</div>
                        <div className="text-xs text-gray-500">Gestionar perfiles</div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white justify-start h-auto py-4 px-4 shadow-sm hover:shadow-md transition-all group"
                    asChild
                  >
                    <Link href="/admin/proyectos">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center mr-3 transition-colors">
                        <FileText className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Proyectos</div>
                        <div className="text-xs text-gray-500">Gestionar proyectos</div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white justify-start h-auto py-4 px-4 shadow-sm hover:shadow-md transition-all group"
                    asChild
                  >
                    <Link href="/admin/publicaciones">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center mr-3 transition-colors">
                        <Award className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Publicaciones</div>
                        <div className="text-xs text-gray-500">Gestionar publicaciones</div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white justify-start h-auto py-4 px-4 shadow-sm hover:shadow-md transition-all group"
                    asChild
                  >
                    <Link href="/admin/instituciones">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center mr-3 transition-colors">
                        <Building className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Instituciones</div>
                        <div className="text-xs text-gray-500">Gestionar instituciones</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xl font-bold">Alertas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-amber-100 rounded animate-pulse"></div>
                  <div className="h-4 bg-amber-100 rounded animate-pulse"></div>
                </div>
              ) : stats.alertas > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Perfiles incompletos</span>
                    <Badge className="bg-amber-500 text-white border-0 font-semibold">
                      {stats.alertas}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 bg-white shadow-sm"
                    asChild
                  >
                    <Link href="/admin/investigadores/incompletos">Ver detalles</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 text-center">✨ No hay alertas pendientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Investigadores destacados y proyectos recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeaturedResearchers />
          <RecentProjects />
        </div>

        {/* Métricas de crecimiento */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Métricas de Crecimiento</div>
                <CardDescription className="text-gray-500 mt-0">Estadísticas de crecimiento de la plataforma</CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center animate-pulse">
                    <div className="h-10 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-3xl font-bold text-blue-700 mb-1">{stats.investigadoresNuevos}</div>
                  <p className="text-sm text-gray-600 font-medium">Nuevos investigadores este mes</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-3xl font-bold text-purple-700 mb-1">{stats.publicacionesRecientes}</div>
                  <p className="text-sm text-gray-600 font-medium">Publicaciones recientes</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-3xl font-bold text-green-700 mb-1">{stats.proyectosActivos}</div>
                  <p className="text-sm text-gray-600 font-medium">Proyectos activos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
