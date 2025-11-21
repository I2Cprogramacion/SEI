"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Building, MapPin, Phone, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedBadge } from "@/components/ui/animated-badge"

interface Investigador {
  id: number
  nombre: string
  email: string
  fotografiaUrl?: string
  institucion?: string
  area?: string
  ultimoGradoEstudios?: string
  nivel?: string
  estadoNacimiento?: string
  entidadFederativa?: string
  municipio?: string
  telefono?: string
  lineaInvestigacion?: string
  slug: string
}

export default function InvestigadoresPage() {
  const [investigadores, setInvestigadores] = useState<Investigador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState("all")
  const [selectedInstitution, setSelectedInstitution] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  // Estados para filtros
  const [areas, setAreas] = useState<string[]>([])
  const [instituciones, setInstituciones] = useState<string[]>([])
  const [ubicaciones, setUbicaciones] = useState<string[]>([])

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Cargar investigadores
  useEffect(() => {
    const fetchInvestigadores = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/investigadores')
        const data = await response.json()
        
        if (response.ok) {
          const investigadoresList = data.investigadores || []
          setInvestigadores(investigadoresList)
        } else {
          console.error("Error fetching investigadores:", data.error)
          setInvestigadores([])
        }
      } catch (error) {
        console.error("Error fetching investigadores:", error)
        setInvestigadores([])
      } finally {
        setLoading(false)
      }
    }

    fetchInvestigadores()
  }, [])

  // Cargar opciones de filtros
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const response = await fetch('/api/investigadores')
        const data = await response.json()
        
        if (response.ok && data.filtros) {
          setAreas(data.filtros.areas || [])
          setInstituciones(data.filtros.instituciones || [])
          setUbicaciones(data.filtros.ubicaciones || [])
        }
      } catch (error) {
        console.error("Error fetching filtros:", error)
      }
    }

    fetchFiltros()
  }, [])

  // Filtrar investigadores - SIMPLIFICADO: Solo validar datos esenciales
  const filteredInvestigadores = investigadores.filter((investigador) => {
    // SOLO validar que tenga los datos MÍNIMOS ESENCIALES (id, nombre, email)
    const hasBasicData = investigador.id && investigador.nombre && investigador.email
    
    if (!hasBasicData) {
      return false
    }

    // Si no hay término de búsqueda ni filtros activos, MOSTRAR TODOS
    if (!searchTerm && selectedField === "all" && selectedInstitution === "all" && selectedLocation === "all") {
      return true
    }

    // Aplicar búsqueda si hay término
    if (searchTerm) {
      const matchesSearch =
        (investigador.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.institucion || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) {
        return false
      }
    }

    // Aplicar filtros de área
    if (selectedField !== "all") {
      if (!investigador.area || investigador.area !== selectedField) {
        return false
      }
    }

    if (selectedInstitution !== "all") {
      if (!investigador.institucion || investigador.institucion !== selectedInstitution) {
        return false
      }
    }

    if (selectedLocation !== "all") {
      // Filtrar por municipio
      if (!investigador.municipio || investigador.municipio !== selectedLocation) {
        return false
      }
    }

    return true
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredInvestigadores.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInvestigadores = filteredInvestigadores.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedField, selectedInstitution, selectedLocation])

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
        {/* Header */}
        <AnimatedCard className="glass-effect card-hover mb-6 sm:mb-8" delay={100}>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-2 sm:mb-4">
                Investigadores
              </h1>
              <p className="text-blue-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 px-2">
                Descubre a los investigadores registrados en nuestra plataforma
              </p>
              
              {/* Barra de búsqueda */}
              <div className="relative max-w-md mx-auto mb-4 sm:mb-6 px-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar investigadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400 text-sm sm:text-base"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center px-2">
                <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-0">
                  <Filter className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="px-3 py-1.5 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto sm:max-w-[200px]"
                  >
                    <option value="all">Todas las áreas</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto sm:max-w-[200px]"
                >
                  <option value="all">Todas las instituciones</option>
                  {instituciones.map((institucion) => (
                    <option key={institucion} value={institucion}>{institucion}</option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto sm:max-w-[200px]"
                >
                  <option value="all">Todas las ubicaciones</option>
                  {ubicaciones.map((ubicacion) => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
                </select>
              </div>

              {/* Estadísticas */}
              <div className="mt-4 sm:mt-6 flex justify-center gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{investigadores.length}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{filteredInvestigadores.length}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Mostrando</p>
                </div>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Grid de investigadores */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full glass-effect">
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col items-center text-center animate-pulse">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 bg-blue-100 rounded-full mb-3 sm:mb-4"></div>
                      <div className="h-4 bg-blue-100 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-blue-100 rounded w-1/2 mb-3 sm:mb-4"></div>
                      <div className="h-6 bg-blue-100 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInvestigadores.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginatedInvestigadores.map((investigador, index) => (
                <Link href={`/investigadores/${investigador.slug}`} key={investigador.id}>
                  <AnimatedCard className="h-full glass-effect card-hover cursor-pointer overflow-hidden group relative" delay={index * 100}>
                    {/* Gradiente decorativo superior */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardContent className="pt-8 sm:pt-10 px-5 sm:px-6 pb-5 overflow-hidden relative z-10">
                      <div className="flex flex-col items-center text-center w-full max-w-full">
                        {/* Avatar con efecto mejorado */}
                        <div className="relative mb-5 sm:mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                          <Avatar className="h-28 w-28 sm:h-32 sm:w-32 relative ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 shadow-lg">
                            <AvatarImage 
                              src={investigador.fotografiaUrl && investigador.fotografiaUrl.includes('/image/upload/') && investigador.fotografiaUrl.length > 50 
                                ? investigador.fotografiaUrl 
                                : "/placeholder.svg"} 
                              alt={investigador.nombre}
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold shadow-inner">
                              {investigador.nombre
                                ?.split(" ")
                                ?.map((n) => n[0])
                                ?.join("")
                                ?.toUpperCase()
                                ?.slice(0, 2) || "??"}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Nombre con mejor tipografía */}
                        <h3 className="font-bold text-blue-900 mb-2 text-lg sm:text-xl w-full px-3 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                          {investigador.nombre || 'Sin nombre'}
                        </h3>

                        {/* Título/Grado con estilo mejorado */}
                        <div className="mb-4 w-full px-3">
                          <p className="text-blue-600 text-sm sm:text-base font-medium line-clamp-1">
                            {investigador.ultimoGradoEstudios || investigador.nivel || 'Investigador'}
                          </p>
                        </div>

                        {/* Badge principal de área - Rediseñado */}
                        {investigador.area && (
                          <div className="w-full mb-5 px-3">
                            <div className="inline-block w-full">
                              <AnimatedBadge 
                                variant="secondary" 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2 w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                              >
                                <span className="block truncate uppercase tracking-wide">{investigador.area}</span>
                              </AnimatedBadge>
                            </div>
                          </div>
                        )}

                        {/* Información de contacto - Rediseñada */}
                        <div className="w-full space-y-2.5 sm:space-y-3 text-xs sm:text-sm mb-4 px-3 min-h-[88px] flex flex-col justify-center">
                          {investigador.institucion && investigador.institucion.trim() !== '' ? (
                            <div className="flex items-center justify-center gap-2 text-blue-700 max-w-full bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100">
                              <Building className="h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span className="text-xs font-semibold text-center truncate min-w-0 flex-1">{investigador.institucion}</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 ml-1 flex-shrink-0 font-bold border border-green-200">
                                ✓
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-400 max-w-full bg-gray-50/50 rounded-lg px-3 py-2 border border-gray-200">
                              <Building className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs font-medium text-center truncate min-w-0 flex-1">Sin institución</span>
                            </div>
                          )}

                          {investigador.telefono ? (
                            <div className="flex items-center justify-center gap-2 text-blue-700 max-w-full bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100">
                              <Phone className="h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span className="text-xs font-semibold text-center truncate min-w-0 flex-1">{investigador.telefono}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-400 max-w-full bg-gray-50/50 rounded-lg px-3 py-2 border border-gray-200">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs font-medium text-center truncate min-w-0 flex-1">Sin teléfono</span>
                            </div>
                          )}
                        </div>

                        {/* Badge de líneas de investigación - Rediseñado */}
                        {investigador.lineaInvestigacion && (
                          <div className="w-full mt-2 px-3">
                            <div className="inline-block w-full">
                              <AnimatedBadge 
                                variant="outline" 
                                interactive 
                                className="border-2 border-indigo-200 text-indigo-700 bg-indigo-50/70 px-4 py-2 w-full overflow-hidden hover:bg-indigo-100/70 transition-colors shadow-sm"
                              >
                                <span className="block truncate text-[11px] sm:text-xs font-semibold uppercase tracking-wide">{investigador.lineaInvestigacion}</span>
                              </AnimatedBadge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {/* Footer con email - Rediseñado */}
                    <CardFooter className="border-t-2 border-blue-100 flex justify-center py-4 sm:py-5 px-5 sm:px-6 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-blue-50/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-center w-full max-w-full overflow-hidden relative z-10">
                        <p className="text-xs sm:text-sm text-blue-600 px-2 truncate font-semibold flex items-center justify-center gap-2">
                          <span className="text-blue-400">✉</span>
                          <span>{investigador.email || 'Sin email'}</span>
                        </p>
                      </div>
                    </CardFooter>
                  </AnimatedCard>
                </Link>
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
                    Mostrando {startIndex + 1} - {Math.min(endIndex, filteredInvestigadores.length)} de {filteredInvestigadores.length} investigadores
                  </p>
                </div>
              )}
            </>
          ) : (
            <AnimatedCard className="glass-effect" delay={500}>
              <CardContent className="pt-4 sm:pt-6 text-center py-8 sm:py-12 px-3 sm:px-6">
                <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-blue-300 mb-3 sm:mb-4 animate-float" />
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-900">No se encontraron investigadores</h3>
                <p className="text-xs sm:text-sm text-blue-600 mb-4 sm:mb-6 px-2">
                  {investigadores.length === 0
                    ? "No hay investigadores registrados aún."
                    : "Intenta ajustar los filtros de búsqueda."}
                </p>
                {(searchTerm || selectedField !== "all" || selectedInstitution !== "all" || selectedLocation !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedField("all")
                      setSelectedInstitution("all")
                      setSelectedLocation("all")
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-4 sm:px-6 py-2"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  )
}