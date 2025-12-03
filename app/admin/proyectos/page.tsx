"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Eye, Search, FileText, Calendar, User } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"
import { AuthorAvatarGroup } from "@/components/author-avatar-group"

// Interfaz para los datos de proyectos
interface Proyecto {
  id: number
  titulo: string
  descripcion?: string
  investigador_principal?: string
  autor?: string | {
    nombre: string
    institucion?: string
  }
  fecha_inicio?: string
  fecha_fin?: string
  estado?: string
  presupuesto?: number | string | null
  institucion?: string
  area_investigacion?: string
  archivo_proyecto?: string
  fecha_registro?: string
}

export default function ProyectosAdmin() {
  console.log("🚀 [Proyectos] Componente ProyectosAdmin renderizado")
  
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [filteredData, setFilteredData] = useState<Proyecto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Cargar proyectos desde la API
  useEffect(() => {
    console.log("🔄 [Proyectos] useEffect ejecutado, iniciando fetch")
    const fetchProyectos = async () => {
      try {
        console.log("📡 [Proyectos] Iniciando fetch a /api/proyectos")
        setIsLoading(true)
        const response = await fetch("/api/proyectos")
        console.log("📡 [Proyectos] Respuesta recibida, status:", response.status, "ok:", response.ok)
        if (!response.ok) {
          throw new Error("Error al cargar los proyectos")
        }
        const data = await response.json()
        console.log("📊 [Proyectos] Datos recibidos de la API:", data)
        const proyectosData = data.proyectos || data || []
        console.log("📊 [Proyectos] Datos procesados:", proyectosData)
        if (proyectosData.length > 0) {
          console.log("📊 [Proyectos] Primer proyecto completo:", JSON.stringify(proyectosData[0], null, 2))
          console.log("📊 [Proyectos] Investigador principal:", proyectosData[0].investigador_principal)
          console.log("📊 [Proyectos] Autor:", proyectosData[0].autor)
          console.log("📊 [Proyectos] Presupuesto:", {
            raw: proyectosData[0].presupuesto,
            tipo: typeof proyectosData[0].presupuesto,
            valor: proyectosData[0].presupuesto
          })
        }
        setProyectos(proyectosData)
        setFilteredData(proyectosData)
        console.log("✅ [Proyectos] Proyectos cargados exitosamente, total:", proyectosData.length)
      } catch (error) {
        console.error("❌ [Proyectos] Error al cargar proyectos:", error)
        setError("No se pudieron cargar los proyectos.")
      } finally {
        setIsLoading(false)
        console.log("🏁 [Proyectos] Fetch completado, isLoading:", false)
      }
    }

    fetchProyectos()
  }, [])

  // Filtrar datos basados en búsqueda y filtros
  useEffect(() => {
    if (!Array.isArray(proyectos)) return
    
    let filtered = proyectos

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (proyecto) =>
          proyecto.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proyecto.investigador_principal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proyecto.institucion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proyecto.area_investigacion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (estadoFilter !== "todos") {
      filtered = filtered.filter(proyecto => 
        proyecto.estado?.toLowerCase() === estadoFilter.toLowerCase()
      )
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, estadoFilter, proyectos])

  // Obtener estados únicos para el filtro
  const estadosUnicos = Array.from(new Set(proyectos.map(p => p.estado).filter(Boolean))) as string[]

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredData) ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : []

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getEstadoBadge = (estado: string) => {
    const estados = {
      'activo': 'bg-green-100 text-green-800',
      'completado': 'bg-blue-100 text-blue-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'cancelado': 'bg-red-100 text-red-800',
    }
    return estados[estado as keyof typeof estados] || 'bg-gray-100 text-gray-800'
  }

  console.log("🎨 [Proyectos] Renderizando componente, isLoading:", isLoading, "proyectos:", proyectos.length, "filteredData:", filteredData.length)
  
  return (
    <div className="w-full">
      <div className="w-full py-4 md:py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:bg-gray-100">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Volver al panel</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 bg-clip-text text-transparent">Proyectos</h1>
            <p className="text-sm text-gray-600">Gestión de investigaciones en curso</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-shadow mb-8 w-full">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Proyectos de Investigación
          </CardTitle>
          <CardDescription className="text-gray-600">
            Gestiona todos los proyectos de investigación registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full p-0 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 px-4 md:px-0 pt-4 md:pt-0">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por título, investigador, institución..."
                  className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white border-blue-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" /> Activo
                    </span>
                  </SelectItem>
                  <SelectItem value="completado">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Completado
                    </span>
                  </SelectItem>
                  <SelectItem value="pausado">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" /> Pausado
                    </span>
                  </SelectItem>
                  <SelectItem value="cancelado">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" /> Cancelado
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || estadoFilter !== "todos") && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setEstadoFilter("todos")
                  }}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent flex-1 sm:flex-initial"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button 
                size="sm"
                className="bg-blue-700 text-white hover:bg-blue-800 flex-1 sm:flex-initial" 
                asChild
              >
                <Link href="/proyectos/nuevo">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo Proyecto</span>
                  <span className="sm:hidden">Nuevo</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block w-full -mx-4 md:mx-0">
            <div className="rounded-md border border-blue-100 overflow-x-auto w-full">
              <Table className="w-full min-w-full">
                <TableHeader className="bg-blue-50">
                  <TableRow className="hover:bg-blue-50 border-b border-blue-100">
                    <TableHead className="text-blue-700">ID</TableHead>
                    <TableHead className="text-blue-700">Título</TableHead>
                    <TableHead className="text-blue-700">Investigador Principal</TableHead>
                    <TableHead className="text-blue-700">Institución</TableHead>
                    <TableHead className="text-blue-700">Estado</TableHead>
                    <TableHead className="text-blue-700">Fecha Inicio</TableHead>
                    <TableHead className="text-blue-700">Presupuesto</TableHead>
                    <TableHead className="text-blue-700 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Cargando proyectos...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                        {error ? "Error al cargar los datos" : "No se encontraron proyectos"}
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((proyecto) => (
                      <TableRow key={proyecto.id} className="hover:bg-blue-50 border-b border-blue-100">
                        <TableCell className="text-blue-900">{proyecto.id}</TableCell>
                        <TableCell className="text-blue-900 font-medium">
                          <div className="max-w-xs truncate" title={proyecto.titulo}>
                            {proyecto.titulo || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-900">
                          {(() => {
                            const nombreInvestigador = proyecto.investigador_principal || (typeof proyecto.autor === 'string' ? proyecto.autor : proyecto.autor?.nombre) || null
                            console.log("🔍 [Proyectos] Renderizando investigador:", {
                              proyectoId: proyecto.id,
                              investigador_principal: proyecto.investigador_principal,
                              autor: proyecto.autor,
                              nombreFinal: nombreInvestigador,
                              tipo: typeof nombreInvestigador
                            })
                            if (!nombreInvestigador) {
                              console.log("⚠️ [Proyectos] No hay nombre de investigador, mostrando N/A")
                              return "N/A"
                            }
                            return (
                              <div className="max-w-xs">
                                <AuthorAvatarGroup 
                                  authors={nombreInvestigador}
                                  maxVisible={1}
                                  size="sm"
                                  showNames={true}
                                />
                              </div>
                            )
                          })()}
                        </TableCell>
                        <TableCell className="text-blue-900">{proyecto.institucion || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getEstadoBadge(proyecto.estado || "activo")}>
                            {proyecto.estado || "Activo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-900">
                          {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-blue-900">
                          {(() => {
                            const presupuesto = proyecto.presupuesto
                            console.log("💰 [Presupuesto Desktop] Valor:", presupuesto, "Tipo:", typeof presupuesto)
                            
                            // Si es null o undefined, mostrar N/A
                            if (presupuesto === null || presupuesto === undefined) {
                              return "N/A"
                            }
                            
                            // Si es string vacío, mostrar N/A
                            if (typeof presupuesto === 'string' && presupuesto.trim() === '') {
                              return "N/A"
                            }
                            
                            // Si es número, formatearlo directamente
                            if (typeof presupuesto === 'number') {
                              return `$${presupuesto.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            }
                            
                            // Si es string, intentar convertirlo
                            if (typeof presupuesto === 'string') {
                              const num = parseFloat(presupuesto.replace(/[^0-9.-]/g, ''))
                              if (!isNaN(num) && num > 0) {
                                return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                              }
                              // Si no se puede convertir, mostrar el string tal cual
                              return presupuesto
                            }
                            
                            // Si no se puede formatear, mostrar el valor tal cual
                            return String(presupuesto)
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              asChild
                            >
                              <Link href={`/proyectos/${proyecto.id}`}>
                                <Eye className="mr-1 h-3 w-3" />
                                Ver
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              asChild
                            >
                              <Link href={`/admin/proyectos/editar/${proyecto.id}`}>
                                <FileText className="mr-1 h-3 w-3" />
                                Editar
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                        No hay proyectos en esta página
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Vista de cards para móvil/tablet */}
          <div className="lg:hidden space-y-4 w-full px-4 md:px-0 pb-4 md:pb-0">
            {isLoading ? (
              <div className="text-center py-8 text-blue-600">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Cargando proyectos...
                </div>
              </div>
            ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
              <div className="text-center py-8 text-blue-600">
                {error ? "Error al cargar los datos" : "No se encontraron proyectos"}
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((proyecto) => (
                <Card key={proyecto.id} className="bg-white border-blue-100 w-full">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-blue-900 flex-1">{proyecto.titulo || "N/A"}</h3>
                        <Badge className={getEstadoBadge(proyecto.estado || "activo")}>
                          {proyecto.estado || "Activo"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-blue-700">
                        {(() => {
                          const nombreInvestigador = proyecto.investigador_principal || (typeof proyecto.autor === 'string' ? proyecto.autor : proyecto.autor?.nombre)
                          console.log("🔍 [Proyectos Mobile] Renderizando investigador:", {
                            proyectoId: proyecto.id,
                            investigador_principal: proyecto.investigador_principal,
                            autor: proyecto.autor,
                            nombreFinal: nombreInvestigador,
                            tipo: typeof nombreInvestigador
                          })
                          if (!nombreInvestigador) {
                            console.log("⚠️ [Proyectos Mobile] No hay nombre de investigador")
                            return null
                          }
                          return (
                            <div>
                              <span className="font-medium">Investigador:</span>
                              <div className="mt-1">
                                <AuthorAvatarGroup 
                                  authors={nombreInvestigador}
                                  maxVisible={1}
                                  size="sm"
                                  showNames={true}
                                />
                              </div>
                            </div>
                          )
                        })()}
                        {proyecto.institucion && (
                          <p><span className="font-medium">Institución:</span> {proyecto.institucion}</p>
                        )}
                        {proyecto.fecha_inicio && (
                          <p><span className="font-medium">Inicio:</span> {new Date(proyecto.fecha_inicio).toLocaleDateString()}</p>
                        )}
                        {(() => {
                          const presupuesto = proyecto.presupuesto
                          console.log("💰 [Presupuesto Mobile] Valor:", presupuesto, "Tipo:", typeof presupuesto)
                          
                          // Si es null o undefined, no mostrar nada
                          if (presupuesto === null || presupuesto === undefined) {
                            return null
                          }
                          
                          // Si es string vacío, no mostrar nada
                          if (typeof presupuesto === 'string' && presupuesto.trim() === '') {
                            return null
                          }
                          
                          // Si es número, formatearlo directamente
                          if (typeof presupuesto === 'number') {
                            return (
                              <p><span className="font-medium">Presupuesto:</span> ${presupuesto.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            )
                          }
                          
                          // Si es string, intentar convertirlo
                          if (typeof presupuesto === 'string') {
                            const num = parseFloat(presupuesto.replace(/[^0-9.-]/g, ''))
                            if (!isNaN(num) && num > 0) {
                              return (
                                <p><span className="font-medium">Presupuesto:</span> ${num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                              )
                            }
                            // Si no se puede convertir, mostrar el string tal cual
                            return (
                              <p><span className="font-medium">Presupuesto:</span> {presupuesto}</p>
                            )
                          }
                          
                          // Si no se puede formatear, mostrar el valor tal cual
                          return (
                            <p><span className="font-medium">Presupuesto:</span> {String(presupuesto)}</p>
                          )
                        })()}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          asChild
                        >
                          <Link href={`/proyectos/${proyecto.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          asChild
                        >
                          <Link href={`/admin/proyectos/editar/${proyecto.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-blue-600">
                No hay proyectos en esta página
              </div>
            )}
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-blue-600 hidden sm:inline">Mostrar</p>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number.parseInt(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[70px] bg-white border-blue-200 text-blue-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100 text-blue-900">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-blue-600 hidden sm:inline">por página</p>
              {Array.isArray(filteredData) && filteredData.length > 0 && (
                <p className="text-xs sm:text-sm text-blue-600 ml-2">
                  Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length}
                </p>
              )}
            </div>

            {Array.isArray(filteredData) && filteredData.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) paginate(currentPage - 1)
                      }}
                      className={`${
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      } text-blue-700 hover:bg-blue-50`}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage) }).map((_, index) => {
                    // Mostrar solo un número limitado de páginas
                    if (
                      index === 0 ||
                      index === Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage) - 1 ||
                      (index >= currentPage - 2 && index <= currentPage + 0)
                    ) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              paginate(index + 1)
                            }}
                            isActive={currentPage === index + 1}
                            className="text-blue-700 hover:bg-blue-50"
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    } else if (index === 1 || index === Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage) - 2) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis className="text-blue-600" />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage)) paginate(currentPage + 1)
                      }}
                      className={`${
                        currentPage === Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage)
                          ? "pointer-events-none opacity-50"
                          : ""
                      } text-blue-700 hover:bg-blue-50`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        dataType="proyectos"
        data={filteredData}
        filename="proyectos"
        title="Exportar Proyectos"
        description="Selecciona los campos que deseas incluir en la exportación"
      />
      </div>
    </div>
  )
}
