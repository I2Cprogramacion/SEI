"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, FileText, Award, Lightbulb, Loader2, Search, Filter, X, BarChart3, PieChart } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts"
import { Breadcrumbs } from "@/components/breadcrumbs"

interface CampoEstudio {
  id: number
  nombre: string
  descripcion: string
  investigadores: number
  proyectos: number
  publicaciones: number
  instituciones: number
  crecimiento: number
  tendencia: "up" | "down" | "stable"
  subcampos: string[]
  color: string
  slug: string
  instituciones_lista?: string
  dias_promedio_registro?: number
}

interface Estadisticas {
  totalCampos: number
  totalInvestigadores: number
  totalProyectos: number
  totalPublicaciones: number
}

interface Filtros {
  instituciones: string[]
  nivelesActividad: Array<{
    valor: string
    etiqueta: string
    color: string
  }>
  ordenamiento: Array<{
    valor: string
    etiqueta: string
  }>
}

interface Parametros {
  search: string
  institucion: string
  actividad: string
  orden: string
  direccion: string
}

export default function CamposPage() {
  const [camposEstudio, setCamposEstudio] = useState<CampoEstudio[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalCampos: 0,
    totalInvestigadores: 0,
    totalProyectos: 0,
    totalPublicaciones: 0
  })
  const [filtros, setFiltros] = useState<Filtros>({
    instituciones: [],
    nivelesActividad: [],
    ordenamiento: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  
  // Estados de filtros
  const [search, setSearch] = useState('')
  const [institucion, setInstitucion] = useState('all')
  const [actividad, setActividad] = useState('all')
  const [orden, setOrden] = useState('investigadores')
  const [direccion, setDireccion] = useState('desc')

  const fetchCampos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (institucion !== 'all') params.append('institucion', institucion)
      if (actividad !== 'all') params.append('actividad', actividad)
      if (orden !== 'investigadores') params.append('orden', orden)
      if (direccion !== 'desc') params.append('direccion', direccion)
      
      const response = await fetch(`/api/campos/simple-fix?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los campos de investigación')
      }
      
      const data = await response.json()
      setCamposEstudio(data.campos || [])
      setEstadisticas(data.estadisticas || {
        totalCampos: 0,
        totalInvestigadores: 0,
        totalProyectos: 0,
        totalPublicaciones: 0
      })
      setFiltros(data.filtros || {
        instituciones: [],
        nivelesActividad: [],
        ordenamiento: []
      })
    } catch (err) {
      console.error('Error fetching campos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampos()
  }, [search, institucion, actividad, orden, direccion])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-blue-600">Cargando campos de investigación...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: "Campos de Investigación", current: true }
        ]}
        className="mb-6"
      />
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-blue-900">Campos de Investigación</h1>
          <p className="text-blue-600">
            Explora las diferentes áreas de conocimiento y especialización de los investigadores en Chihuahua
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Búsqueda */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    placeholder="Buscar por nombre, especialidad o línea de investigación..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>

              {/* Filtros expandibles */}
              {filtrosAbiertos && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-blue-100">
                  {/* Filtro por institución */}
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-2 block">Institución</label>
                    <Select value={institucion} onValueChange={setInstitucion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las instituciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las instituciones</SelectItem>
                        {filtros.instituciones.map((inst) => (
                          <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por nivel de actividad */}
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-2 block">Nivel de Actividad</label>
                    <Select value={actividad} onValueChange={setActividad}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los niveles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        {filtros.nivelesActividad.map((nivel) => (
                          <SelectItem key={nivel.valor} value={nivel.valor}>
                            <span className={nivel.color}>{nivel.etiqueta}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ordenamiento */}
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-2 block">Ordenar por</label>
                    <Select value={orden} onValueChange={setOrden}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filtros.ordenamiento.map((opcion) => (
                          <SelectItem key={opcion.valor} value={opcion.valor}>
                            {opcion.etiqueta}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dirección del ordenamiento */}
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-2 block">Dirección</label>
                    <Select value={direccion} onValueChange={setDireccion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Mayor a menor</SelectItem>
                        <SelectItem value="asc">Menor a mayor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Filtros activos */}
              {(search || institucion !== 'all' || actividad !== 'all' || orden !== 'investigadores' || direccion !== 'desc') && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-sm text-blue-600">Filtros activos:</span>
                  {search && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Búsqueda: "{search}"
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch('')} />
                    </Badge>
                  )}
                  {institucion !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Institución: {institucion}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setInstitucion('all')} />
                    </Badge>
                  )}
                  {actividad !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Actividad: {filtros.nivelesActividad.find(n => n.valor === actividad)?.etiqueta}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setActividad('all')} />
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('')
                      setInstitucion('all')
                      setActividad('all')
                      setOrden('investigadores')
                      setDireccion('desc')
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Lightbulb className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{estadisticas.totalCampos}</div>
              <p className="text-sm text-blue-600">Campos activos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{estadisticas.totalInvestigadores}</div>
              <p className="text-sm text-blue-600">Investigadores</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{estadisticas.totalProyectos}</div>
              <p className="text-sm text-blue-600">Proyectos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{estadisticas.totalPublicaciones}</div>
              <p className="text-sm text-blue-600">Publicaciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de campos */}
        {camposEstudio.length === 0 ? (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <Lightbulb className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No hay campos registrados</h3>
              <p className="text-blue-600">
                Los campos de investigación aparecerán aquí cuando los investigadores registren sus áreas de especialización.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {camposEstudio.map((campo) => (
            <Link href={`/campos/${campo.slug}`} key={campo.id}>
              <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={campo.color}>{campo.nombre}</Badge>
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`h-4 w-4 ${campo.tendencia === "up" ? "text-green-500" : "text-blue-500"}`}
                          />
                          <span className="text-xs text-blue-600">{campo.crecimiento}% actividad</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-blue-900">{campo.nombre}</CardTitle>
                      <CardDescription className="text-blue-600">{campo.descripcion}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Estadísticas del campo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Investigadores</span>
                          <span className="font-medium text-blue-900">{campo.investigadores}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Proyectos</span>
                          <span className="font-medium text-blue-900">{campo.proyectos}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Publicaciones</span>
                          <span className="font-medium text-blue-900">{campo.publicaciones}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Instituciones</span>
                          <span className="font-medium text-blue-900">{campo.instituciones}</span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso de actividad */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Nivel de actividad</span>
                        <span className="text-blue-900 font-medium">{campo.crecimiento}%</span>
                      </div>
                      <Progress value={campo.crecimiento} className="h-2" />
                    </div>

                    {/* Subcampos */}
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm">Especialidades:</h4>
                      <div className="flex flex-wrap gap-1">
                        {campo.subcampos.slice(0, 3).map((subcampo, index) => (
                          <Badge key={index} variant="outline" className="border-blue-200 text-blue-700 text-xs">
                            {subcampo}
                          </Badge>
                        ))}
                        {campo.subcampos.length > 3 && (
                          <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                            +{campo.subcampos.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        )}

        {/* Gráficos de estadísticas */}
        {camposEstudio.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de barras - Investigadores por campo */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Investigadores por Campo
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Distribución de investigadores en cada área de investigación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={camposEstudio.slice(0, 8).map(campo => ({
                      nombre: campo.nombre.length > 15 ? campo.nombre.substring(0, 15) + '...' : campo.nombre,
                      investigadores: campo.investigadores,
                      proyectos: campo.proyectos,
                      publicaciones: campo.publicaciones
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="nombre" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          value, 
                          name === 'investigadores' ? 'Investigadores' : 
                          name === 'proyectos' ? 'Proyectos' : 'Publicaciones'
                        ]}
                        labelStyle={{ color: '#1e40af' }}
                      />
                      <Bar dataKey="investigadores" fill="#3b82f6" name="investigadores" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de dona - Distribución de actividad */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Nivel de Actividad
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Distribución de campos por nivel de actividad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { 
                            name: 'Alta Actividad', 
                            value: camposEstudio.filter(c => c.crecimiento >= 70).length,
                            color: '#10b981'
                          },
                          { 
                            name: 'Actividad Media', 
                            value: camposEstudio.filter(c => c.crecimiento >= 40 && c.crecimiento < 70).length,
                            color: '#f59e0b'
                          },
                          { 
                            name: 'Baja Actividad', 
                            value: camposEstudio.filter(c => c.crecimiento < 40).length,
                            color: '#ef4444'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Alta Actividad', value: camposEstudio.filter(c => c.crecimiento >= 70).length, color: '#10b981' },
                          { name: 'Actividad Media', value: camposEstudio.filter(c => c.crecimiento >= 40 && c.crecimiento < 70).length, color: '#f59e0b' },
                          { name: 'Baja Actividad', value: camposEstudio.filter(c => c.crecimiento < 40).length, color: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        labelStyle={{ color: '#1e40af' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-blue-600">Alta actividad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-blue-600">Actividad media</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-blue-600">Baja actividad</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sección de tendencias */}
        {camposEstudio.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Tendencias de Investigación</CardTitle>
              <CardDescription className="text-blue-700">
                Campos con mayor crecimiento y actividad en los últimos años
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {camposEstudio
                  .sort((a, b) => b.crecimiento - a.crecimiento)
                  .slice(0, 3)
                  .map((campo, index) => (
                    <div
                      key={campo.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-sm">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 text-sm">{campo.nombre}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-blue-600">{campo.crecimiento}% actividad</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
