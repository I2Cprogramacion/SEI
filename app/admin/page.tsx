"use client"

import { useState, useEffect } from "react"
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
          new Date(pub.fecha_publicacion || pub.createdAt) >= haceUnMes
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
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto py-4 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Panel de Administración</h1>
            <p className="text-sm md:text-base text-blue-600">Gestiona la plataforma SECCTI desde aquí</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent flex-1 sm:flex-initial" 
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
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent flex-1 sm:flex-initial"
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
                <Card key={i} className="bg-white border-blue-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="animate-pulse bg-blue-100 h-4 w-32 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse bg-blue-100 h-8 w-16 rounded"></div>
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
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Acciones Rápidas</CardTitle>
                <CardDescription className="text-blue-600">
                  Gestiona los elementos principales de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent justify-start"
                    asChild
                  >
                    <Link href="/admin/investigadores">
                      <Users className="mr-2 h-4 w-4" />
                      Gestionar Investigadores
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent justify-start"
                    asChild
                  >
                    <Link href="/admin/proyectos">
                      <FileText className="mr-2 h-4 w-4" />
                      Gestionar Proyectos
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent justify-start"
                    asChild
                  >
                    <Link href="/admin/publicaciones">
                      <Award className="mr-2 h-4 w-4" />
                      Gestionar Publicaciones
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent justify-start"
                    asChild
                  >
                    <Link href="/admin/instituciones">
                      <Building className="mr-2 h-4 w-4" />
                      Gestionar Instituciones
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <AlertTriangle className="h-5 w-5" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-blue-100 rounded animate-pulse"></div>
                  <div className="h-4 bg-blue-100 rounded animate-pulse"></div>
                </div>
              ) : stats.alertas > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600">Perfiles incompletos</span>
                    <Badge variant="outline" className="border-amber-200 text-amber-700">
                      {stats.alertas}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    asChild
                  >
                    <Link href="/admin/investigadores/incompletos">Ver detalles</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-blue-600">No hay alertas pendientes</p>
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
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="h-5 w-5" />
              Métricas de Crecimiento
            </CardTitle>
            <CardDescription className="text-blue-600">Estadísticas de crecimiento de la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center animate-pulse">
                    <div className="h-8 bg-blue-100 rounded mb-2"></div>
                    <div className="h-4 bg-blue-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{stats.investigadoresNuevos}</div>
                  <p className="text-sm text-blue-600">Nuevos investigadores este mes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{stats.publicacionesRecientes}</div>
                  <p className="text-sm text-blue-600">Publicaciones recientes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{stats.proyectosActivos}</div>
                  <p className="text-sm text-blue-600">Proyectos activos</p>
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
