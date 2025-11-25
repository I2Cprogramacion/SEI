"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Download, Users, BarChart3, FileText } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { AREAS_SNII, NIVELES_SNII } from "@/lib/snii-parametros"
import { ExportEvaluacionDialog } from "@/components/export-evaluacion-dialog"

interface Alerta {
  id: number
  nombre: string
  email: string
  fotografia_url: string
  area: string
  nivel: string
  problemas: string[]
  prioridad: "alta" | "media"
  slug: string
}

interface Estadisticas {
  total: number
  distribucionArea: Array<{ area: string; total: number }>
  distribucionNivel: Array<{ nivel: string; total: number }>
}

export default function EvaluacionesPage() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [alertasStats, setAlertasStats] = useState({ total: 0, alta: 0, media: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [areaFiltro, setAreaFiltro] = useState("todas")
  const [nivelFiltro, setNivelFiltro] = useState("todos")
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Cargar estadísticas
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const response = await fetch("/api/evaluaciones?tipo=resumen")
        const data = await response.json()
        setEstadisticas(data)
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      }
    }

    const fetchAlertas = async () => {
      try {
        const response = await fetch("/api/evaluaciones?tipo=alertas")
        const data = await response.json()
        setAlertas(data.alertas || [])
        setAlertasStats({
          total: data.total || 0,
          alta: data.alta || 0,
          media: data.media || 0,
        })
      } catch (error) {
        console.error("Error al cargar alertas:", error)
      }
    }

    Promise.all([fetchEstadisticas(), fetchAlertas()]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  // Colores para gráficos
  const COLORS_AREA = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
    "#6366f1", // indigo-500
    "#f43f5e", // rose-500
    "#06b6d4", // cyan-500
    "#a855f7", // purple-500
  ]

  const COLORS_NIVEL = {
    "SNII III": "#dc2626", // red-600
    "SNII II": "#ea580c", // orange-600
    "SNII I": "#ca8a04", // yellow-600
    "Candidato SNII": "#16a34a", // green-600
    "Sin nivel": "#6b7280", // gray-500
  }

  // Preparar datos para gráficos
  const datosArea = estadisticas?.distribucionArea.map((item) => ({
    name: item.area.length > 30 ? item.area.substring(0, 30) + "..." : item.area,
    value: parseInt(String(item.total)),
    fullName: item.area,
  })) || []

  const datosNivel = estadisticas?.distribucionNivel.map((item) => ({
    name: item.nivel,
    value: parseInt(String(item.total)),
  })) || []

  return (
    <div className="w-full">
      <div className="w-full py-6 md:py-8 px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:bg-gray-100">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Volver al panel</span>
                <span className="sm:hidden">Volver</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Evaluaciones SNII
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Sistema de evaluación basado en parámetros de referencia SNII 2020-2024
              </p>
            </div>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardDescription>Total Investigadores</CardDescription>
              <CardTitle className="text-3xl">{estadisticas?.total || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-gray-600">
                <Users className="mr-1 h-3 w-3" />
                Registrados en el sistema
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardDescription>Alertas Prioritarias</CardDescription>
              <CardTitle className="text-3xl text-red-600">{alertasStats.alta}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-gray-600">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Requieren atención inmediata
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardDescription>Alertas Medias</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{alertasStats.media}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-gray-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                Por debajo de parámetros
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription>Áreas Activas</CardDescription>
              <CardTitle className="text-3xl">{datosArea.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-gray-600">
                <BarChart3 className="mr-1 h-3 w-3" />
                Áreas de conocimiento
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="estadisticas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="alertas">
              Alertas
              {alertasStats.total > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alertasStats.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comparativa">Comparativa</TabsTrigger>
          </TabsList>

          {/* Pestaña de Estadísticas */}
          <TabsContent value="estadisticas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Áreas */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Área de Conocimiento</CardTitle>
                  <CardDescription>
                    Investigadores clasificados por área SNII
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : datosArea.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={datosArea} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border rounded-lg shadow-lg">
                                  <p className="font-medium text-sm">
                                    {payload[0].payload.fullName}
                                  </p>
                                  <p className="text-blue-600 font-bold">
                                    {payload[0].value} investigadores
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {datosArea.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS_AREA[index % COLORS_AREA.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      No hay datos disponibles
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de Niveles */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Nivel SNII</CardTitle>
                  <CardDescription>
                    Investigadores clasificados por nivel de reconocimiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : datosNivel.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={datosNivel}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {datosNivel.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS_NIVEL[entry.name as keyof typeof COLORS_NIVEL] || "#6b7280"}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      No hay datos disponibles
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Leyenda de niveles */}
            <Card>
              <CardHeader>
                <CardTitle>Leyenda de Niveles SNII</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {NIVELES_SNII.map((nivel) => (
                    <div key={nivel.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor:
                            COLORS_NIVEL[nivel.nombre as keyof typeof COLORS_NIVEL] || "#6b7280",
                        }}
                      />
                      <span className="text-sm text-gray-700">{nivel.nombre}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Alertas */}
          <TabsContent value="alertas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investigadores que Requieren Atención</CardTitle>
                <CardDescription>
                  Investigadores con producción por debajo de los parámetros SNII o perfiles desactualizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : alertas.length > 0 ? (
                  <div className="space-y-4">
                    {alertas.slice(0, 10).map((alerta) => (
                      <div
                        key={alerta.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          alerta.prioridad === "alta"
                            ? "border-l-red-500 bg-red-50"
                            : "border-l-yellow-500 bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={alerta.fotografia_url || "/placeholder-user.jpg"} />
                            <AvatarFallback>
                              {alerta.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{alerta.nombre}</h3>
                                <p className="text-sm text-gray-600">{alerta.email}</p>
                              </div>
                              <Badge
                                variant={alerta.prioridad === "alta" ? "destructive" : "default"}
                                className={
                                  alerta.prioridad === "media"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : ""
                                }
                              >
                                {alerta.prioridad === "alta" ? "Alta" : "Media"}
                              </Badge>
                            </div>
                            <div className="space-y-1 mb-3">
                              <p className="text-sm">
                                <span className="font-medium">Área:</span> {alerta.area || "N/A"}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Nivel:</span> {alerta.nivel || "N/A"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700">Problemas detectados:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {alerta.problemas.map((problema, idx) => (
                                  <li key={idx} className="text-sm text-gray-600">
                                    {problema}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-3">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/investigadores/${alerta.slug}`}>
                                  Ver perfil
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {alertas.length > 10 && (
                      <p className="text-center text-sm text-gray-600 pt-4">
                        Mostrando 10 de {alertas.length} alertas
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No hay alertas</p>
                    <p className="text-sm">
                      Todos los investigadores cumplen con los parámetros esperados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Comparativa */}
          <TabsContent value="comparativa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparativa Detallada</CardTitle>
                <CardDescription>
                  Análisis de investigadores vs parámetros SNII por área y nivel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Área de conocimiento</label>
                      <Select value={areaFiltro} onValueChange={setAreaFiltro}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas las áreas</SelectItem>
                          {Object.values(AREAS_SNII).map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nivel SNII</label>
                      <Select value={nivelFiltro} onValueChange={setNivelFiltro}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los niveles</SelectItem>
                          {NIVELES_SNII.map((nivel) => (
                            <SelectItem key={nivel.id} value={nivel.nombre}>
                              {nivel.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Funcionalidad en desarrollo</p>
                  <p className="text-sm">
                    La comparativa detallada estará disponible próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo de exportación */}
        <ExportEvaluacionDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
        />
      </div>
    </div>
  )
}

