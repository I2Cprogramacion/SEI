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
import { Search, Filter, Calendar, Users, ExternalLink, FileText, Upload } from "lucide-react"
import Link from "next/link"

// Interfaces para tipos de datos
interface Proyecto {
  id: number
  titulo: string
  descripcion: string
  autor: {
    nombre: string
    institucion: string
    email?: string
    telefono?: string
  }
  categoria: string
  estado: string
  fechaInicio?: string
  fechaFin?: string
  presupuesto?: string
  palabrasClave: string[]
  objetivos?: string[]
  resultados?: string[]
  metodologia?: string
  impacto?: string
  colaboradores?: Array<{
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
    const matchesSearch =
      proyecto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.palabrasClave.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      proyecto.autor.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || proyecto.categoria === selectedCategory
    const matchesStatus = selectedStatus === "all" || proyecto.estado === selectedStatus
    const matchesInstitution = selectedInstitution === "all" || proyecto.autor.institucion === selectedInstitution

    return matchesSearch && matchesCategory && matchesStatus && matchesInstitution
  })

  // Usar filtros de la API
  const categories = categorias
  const statuses = estados
  const institutions = instituciones

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <AnimatedHeader 
            title="Proyectos de Investigación"
            subtitle="Explora los proyectos de investigación activos y completados en Chihuahua"
          />
          <AnimatedButton 
            asChild
            className="bg-blue-700 hover:bg-blue-800 text-white animate-glow"
          >
            <Link href="/proyectos/nuevo">
              <Upload className="mr-2 h-4 w-4" />
              Subir Nuevo Proyecto
            </Link>
          </AnimatedButton>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, descripción o investigador..."
                    className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
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
          <div className="flex justify-between items-center">
            <p className="text-blue-600">
              {loading
                ? "Cargando..."
                : `${filteredProyectos.length} proyecto${filteredProyectos.length !== 1 ? "s" : ""} encontrado${filteredProyectos.length !== 1 ? "s" : ""}`}
            </p>
            <AnimatedButton variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avanzados
            </AnimatedButton>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white border-blue-100">
                  <CardHeader>
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-blue-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProyectos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProyectos.map((proyecto, index) => (
                <AnimatedCard key={proyecto.id} className="bg-white border-blue-100" delay={index * 100}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <AnimatedBadge className="mb-2 bg-blue-700 text-white">{proyecto.categoria}</AnimatedBadge>
                        <AnimatedBadge variant="outline" className="ml-2 border-blue-200 text-blue-700">
                          {proyecto.estado}
                        </AnimatedBadge>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-blue-900">{proyecto.titulo}</CardTitle>
                    <CardDescription className="text-blue-600">{proyecto.autor.institucion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 mb-4">{proyecto.descripcion}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-blue-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {proyecto.fechaInicio} - {proyecto.fechaFin}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-blue-600">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{proyecto.colaboradores?.length || 1} investigadores</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {proyecto.palabrasClave.slice(0, 3).map((keyword: string, kwIndex: number) => (
                        <AnimatedBadge key={kwIndex} variant="secondary" interactive className="bg-blue-50 text-blue-700 stagger-item">
                          {keyword}
                        </AnimatedBadge>
                      ))}
                      {proyecto.palabrasClave.length > 3 && (
                        <AnimatedBadge variant="secondary" className="bg-blue-50 text-blue-700">
                          +{proyecto.palabrasClave.length - 3} más
                        </AnimatedBadge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-blue-100 flex justify-between">
                    <div className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" alt={proyecto.autor.nombre} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {proyecto.autor.nombre
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {proyecto.colaboradores?.slice(0, 2).map((colaborador: any, colabIndex: number) => (
                        <Avatar key={colabIndex} className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg" alt={colaborador.nombre} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {colaborador.nombre
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <AnimatedButton
                      variant="outline"
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
          ) : (
            <AnimatedCard className="bg-white border-blue-100" delay={500}>
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
  )
}
