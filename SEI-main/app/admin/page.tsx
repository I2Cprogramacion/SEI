"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Building, Award, TrendingUp, AlertTriangle, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { FeaturedResearchers } from "@/components/featured-researchers"
import { RecentProjects } from "@/components/recent-projects"

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

  // TODO: Conectar con API real
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // const response = await fetch('/api/admin/dashboard-stats')
        // const data = await response.json()
        // setStats(data)

        // Por ahora, datos vacíos
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
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Panel de Administración</h1>
            <p className="text-blue-600">Gestiona la plataforma SECCTI desde aquí</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
              <Eye className="mr-2 h-4 w-4" />
              Ver sitio público
            </Button>
            <Button className="bg-blue-700 text-white hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo registro
            </Button>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Investigadores</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.totalInvestigadores}</div>
              <p className="text-xs text-blue-600">+{loading ? "..." : stats.investigadoresNuevos} nuevos este mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Proyectos Activos</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.proyectosActivos}</div>
              <p className="text-xs text-blue-600">de {loading ? "..." : stats.totalProyectos} totales</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Publicaciones</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.totalPublicaciones}</div>
              <p className="text-xs text-blue-600">+{loading ? "..." : stats.publicacionesRecientes} este mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Instituciones</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.totalInstituciones}</div>
              <p className="text-xs text-blue-600">registradas</p>
            </CardContent>
          </Card>
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
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    asChild
                  >
                    <Link href="/admin/investigadores">
                      <Users className="mr-2 h-4 w-4" />
                      Gestionar Investigadores
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    asChild
                  >
                    <Link href="/admin/proyectos">
                      <FileText className="mr-2 h-4 w-4" />
                      Gestionar Proyectos
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    asChild
                  >
                    <Link href="/admin/publicaciones">
                      <Award className="mr-2 h-4 w-4" />
                      Gestionar Publicaciones
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
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
  )
}
