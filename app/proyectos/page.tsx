"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Calendar, Users, ExternalLink, FileText, Upload, ChevronLeft, ChevronRight, DollarSign } from "lucide-react"
import Link from "next/link"
import { AuthorAvatarGroup } from "@/components/author-avatar-group"

// Interfaces para tipos de datos
interface Proyecto {
  id: number
  titulo: string
  descripcion: string
  autor: string | {
    nombre: string
    institucion: string
    email?: string
    telefono?: string
  }
  investigador_principal?: string
  institucion?: string
  categoria: string
  estado: string
  fechaInicio?: string
  fechaFin?: string
  fecha_inicio?: string
  fecha_fin?: string
  presupuesto?: number | string | null
  palabrasClave: string[]
  objetivos?: string[]
  resultados?: string[]
  metodologia?: string
  impacto?: string
  colaboradores?: string[] | Array<{
    nombre: string
    institucion: string
  }>
  financiamiento?: string
  slug: string
}

export default function ProyectosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedInstitution, setSelectedInstitution] = useState("all")
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Función para formatear fechas
  const formatFecha = (fecha: string | null | undefined) => {
    if (!fecha) return 'N/A'
    try {
      const date = new Date(fecha)
      if (isNaN(date.getTime())) return fecha
      return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return fecha
    }
  }

  // Conectar con API real
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/proyectos')
        const data = await response.json()
        
        if (response.ok) {
          setProyectos(data.proyectos || [])
        } else {
          console.error("Error fetching proyectos:", data.error)
          setProyectos([])
        }
      } catch (error) {
        console.error("Error fetching proyectos:", error)
        setProyectos([])
      } finally {
        setLoading(false)
      }
    }

    fetchProyectos()
  }, [])

  // Estados para filtros
  const [categorias, setCategorias] = useState<string[]>([])
  const [estados, setEstados] = useState<string[]>([])
  const [instituciones, setInstituciones] = useState<string[]>([])

  // Cargar opciones de filtros
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const response = await fetch('/api/proyectos')
        const data = await response.json()
        
        if (response.ok && data.filtros) {
          setCategorias(data.filtros.categorias || [])
          setEstados(data.filtros.estados || [])
          setInstituciones(data.filtros.instituciones || [])
        }
      } catch (error) {
        console.error("Error fetching filtros:", error)
      }
    }

    fetchFiltros()
  }, [])

  // Filtrar proyectos
  const filteredProyectos = proyectos.filter((proyecto) => {
    // Manejar autor (puede ser objeto o string por compatibilidad)
    const autorNombre = typeof proyecto.autor === 'string' 
      ? proyecto.autor 
      : (proyecto.autor?.nombre || '')
    const investigadorPrincipal = proyecto.investigador_principal || autorNombre
    const autorInstitucion = typeof proyecto.autor === 'string' 
      ? (proyecto.institucion || '') 
      : (proyecto.autor?.institucion || proyecto.institucion || '')
    const palabrasClave = Array.isArray(proyecto.palabrasClave) ? proyecto.palabrasClave : []
    
    const matchesSearch =
      (proyecto.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proyecto.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      palabrasClave.some((keyword) => (keyword || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      autorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investigadorPrincipal.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || proyecto.categoria === selectedCategory
    const matchesStatus = selectedStatus === "all" || proyecto.estado === selectedStatus
    const matchesInstitution = selectedInstitution === "all" || autorInstitucion === selectedInstitution

    return matchesSearch && matchesCategory && matchesStatus && matchesInstitution
  })

  // Usar filtros de la API
  const categories = categorias
  const statuses = estados
  const institutions = instituciones

  // Calcular paginación
  const totalPages = Math.ceil(filteredProyectos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProyectos = filteredProyectos.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedStatus, selectedInstitution])

  // Funciones de navegación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <AnimatedHeader 
            title="Proyectos de Investigación"
            subtitle="Explora los proyectos de investigación activos y completados en Chihuahua"
          />
          <AnimatedButton 
            asChild
            className="bg-blue-700 hover:bg-blue-800 text-white animate-glow w-full sm:w-auto"
          >
            <Link href="/proyectos/nuevo">
              <Upload className="mr-2 h-4 w-4" />
              Subir Nuevo Proyecto
            </Link>
          </AnimatedButton>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="glass-effect">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, descripción o investigador..."
                    className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Institución" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todas las instituciones</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <p className="text-blue-600 text-sm sm:text-base break-words">
              {loading
                ? "Cargando..."
                : `${filteredProyectos.length} proyecto${filteredProyectos.length !== 1 ? "s" : ""} encontrado${filteredProyectos.length !== 1 ? "s" : ""}`}
            </p>
            <AnimatedButton variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avanzados
            </AnimatedButton>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-effect">
                  <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-blue-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProyectos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {paginatedProyectos.map((proyecto, index) => (
                <AnimatedCard key={proyecto.id} className="glass-effect card-hover" delay={index * 100}>
                  <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
                    <div className="flex flex-wrap gap-2 items-start mb-2">
                      <AnimatedBadge className="bg-blue-700 text-white text-xs sm:text-sm break-words">{proyecto.categoria}</AnimatedBadge>
                      <AnimatedBadge variant="outline" className="border-blue-200 text-blue-700 text-xs sm:text-sm break-words">
                        {proyecto.estado}
                      </AnimatedBadge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-blue-900 break-words">{proyecto.titulo || 'Sin título'}</CardTitle>
                    <CardDescription className="text-blue-600 text-xs sm:text-sm break-words">
                      {typeof proyecto.autor === 'string' 
                        ? proyecto.institucion || proyecto.autor 
                        : (proyecto.autor?.institucion || proyecto.institucion || 'Sin institución')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <p className="text-blue-600 mb-4 text-sm sm:text-base break-words line-clamp-3">{proyecto.descripcion || 'Sin descripción'}</p>
                    <div className="space-y-2">
                      {(proyecto.fechaInicio || proyecto.fechaFin || proyecto.fecha_inicio || proyecto.fecha_fin) && (
                        <div className="flex items-center text-sm text-blue-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>
                            {formatFecha(proyecto.fecha_inicio || proyecto.fechaInicio)} - {formatFecha(proyecto.fecha_fin || proyecto.fechaFin)}
                          </span>
                        </div>
                      )}
                      {proyecto.presupuesto && (
                        <div className="flex items-center text-sm text-blue-600">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>
                            {(() => {
                              const presup = proyecto.presupuesto
                              if (typeof presup === 'number') {
                                return `$${presup.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                              }
                              if (typeof presup === 'string') {
                                const num = parseFloat(presup.replace(/[^0-9.-]/g, ''))
                                if (!isNaN(num) && num > 0) {
                                  return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                }
                                return presup
                              }
                              return String(presup)
                            })()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-blue-600">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{Array.isArray(proyecto.colaboradores) ? proyecto.colaboradores.length + 1 : 1} investigadores</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Array.isArray(proyecto.palabrasClave) && proyecto.palabrasClave.slice(0, 3).map((keyword: string, kwIndex: number) => (
                        <AnimatedBadge key={kwIndex} variant="secondary" interactive className="bg-blue-50 text-blue-700 stagger-item text-xs break-words">
                          {keyword}
                        </AnimatedBadge>
                      ))}
                      {Array.isArray(proyecto.palabrasClave) && proyecto.palabrasClave.length > 3 && (
                        <AnimatedBadge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                          +{proyecto.palabrasClave.length - 3} más
                        </AnimatedBadge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-6">
                    <div className="flex items-center -space-x-2">
                      {(() => {
                        const nombreInvestigador = proyecto.investigador_principal || (typeof proyecto.autor === 'string' ? proyecto.autor : proyecto.autor?.nombre) || null
                        if (nombreInvestigador) {
                          return (
                            <AuthorAvatarGroup 
                              authors={nombreInvestigador}
                              maxVisible={1}
                              size="sm"
                              showNames={false}
                              role="autor"
                              noGap={true}
                            />
                          )
                        }
                        return null
                      })()}
                      {Array.isArray(proyecto.colaboradores) && proyecto.colaboradores.length > 0 && (
                        <>
                          {proyecto.colaboradores.slice(0, 2).map((colaborador: any, colabIndex: number) => {
                            const colaboradorNombre = typeof colaborador === 'string' 
                              ? colaborador.split(' - ')[0] || colaborador
                              : (colaborador?.nombre || '')
                            if (!colaboradorNombre) return null
                            return (
                              <AuthorAvatarGroup 
                                key={colabIndex}
                                authors={colaboradorNombre}
                                maxVisible={1}
                                size="sm"
                                showNames={false}
                                role="coautor"
                                noGap={true}
                              />
                            )
                          })}
                          {proyecto.colaboradores.length > 2 && (
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-medium ring-2 ring-blue-100 border-2 border-white">
                              +{proyecto.colaboradores.length - 2}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                      asChild
                    >
                      <Link href={`/proyectos/${proyecto.slug}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </AnimatedButton>
                  </CardFooter>
                </AnimatedCard>
              ))}
              </div>

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-center gap-4 mt-8 sm:mt-10">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Mostrar todas las páginas si son 7 o menos
                        if (totalPages <= 7) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(page)}
                              className={`min-w-[40px] ${
                                currentPage === page
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : ""
                              }`}
                            >
                              {page}
                            </Button>
                          )
                        }

                        // Si hay más de 7 páginas, mostrar lógica de elipsis
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(page)}
                              className={`min-w-[40px] ${
                                currentPage === page
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : ""
                              }`}
                            >
                              {page}
                            </Button>
                          )
                        }

                        // Mostrar elipsis
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 text-blue-600">
                              ...
                            </span>
                          )
                        }

                        return null
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-blue-600">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProyectos.length)} de {filteredProyectos.length} proyectos
                  </p>
                </div>
              )}
            </>
          ) : (
            <AnimatedCard className="glass-effect card-hover" delay={500}>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-blue-300 mb-4 animate-float" />
                <h3 className="text-lg font-semibold mb-2 text-blue-900">No se encontraron proyectos</h3>
                <p className="text-sm text-blue-600 mb-6">
                  {proyectos.length === 0
                    ? "Aún no hay proyectos registrados en la plataforma."
                    : "Intenta ajustar los filtros de búsqueda para encontrar más resultados."}
                </p>
                {proyectos.length > 0 && (
                  <AnimatedButton
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                      setSelectedInstitution("all")
                    }}
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Limpiar filtros
                  </AnimatedButton>
                )}
              </CardContent>
            </AnimatedCard>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
