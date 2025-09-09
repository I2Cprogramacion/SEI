"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Calendar, Users, ExternalLink, FileText } from "lucide-react"
import Link from "next/link"

// Interfaces para tipos de datos
interface Proyecto {
  id: number
  title: string
  description: string
  image?: string
  startDate: string
  endDate: string
  status: string
  category: string
  tags: string[]
  researchers: Array<{
    id: number
    name: string
    role: string
    avatar?: string
    slug: string
  }>
  institution: string
  funding?: string
  fundingAmount?: string
  slug: string
}

export default function ProyectosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedInstitution, setSelectedInstitution] = useState("all")
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: Conectar con API real
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        setLoading(true)
        // const response = await fetch('/api/proyectos')
        // const data = await response.json()
        // setProyectos(data)

        // Por ahora, datos vacíos
        setProyectos([])
      } catch (error) {
        console.error("Error fetching proyectos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProyectos()
  }, [])

  // Filtrar proyectos
  const filteredProyectos = proyectos.filter((proyecto) => {
    const matchesSearch =
      proyecto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      proyecto.researchers.some((researcher) => researcher.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || proyecto.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || proyecto.status === selectedStatus
    const matchesInstitution = selectedInstitution === "all" || proyecto.institution === selectedInstitution

    return matchesSearch && matchesCategory && matchesStatus && matchesInstitution
  })

  // TODO: Obtener opciones únicas desde la API
  const categories: string[] = []
  const statuses: string[] = []
  const institutions: string[] = []

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-blue-900">Proyectos de Investigación</h1>
          <p className="text-blue-600">Explora los proyectos de investigación activos y completados en Chihuahua</p>
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
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avanzados
            </Button>
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
              {filteredProyectos.map((proyecto) => (
                <Card key={proyecto.id} className="bg-white border-blue-100">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className="mb-2 bg-blue-700 text-white">{proyecto.category}</Badge>
                        <Badge variant="outline" className="ml-2 border-blue-200 text-blue-700">
                          {proyecto.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-blue-900">{proyecto.title}</CardTitle>
                    <CardDescription className="text-blue-600">{proyecto.institution}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 mb-4">{proyecto.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-blue-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {proyecto.startDate} - {proyecto.endDate}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-blue-600">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{proyecto.researchers.length} investigadores</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {proyecto.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                          {tag}
                        </Badge>
                      ))}
                      {proyecto.tags.length > 3 && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          +{proyecto.tags.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-blue-100 flex justify-between">
                    <div className="flex gap-2">
                      {proyecto.researchers.slice(0, 3).map((researcher, index) => (
                        <Avatar key={index} className="h-6 w-6">
                          <AvatarImage src={researcher.avatar || "/placeholder.svg"} alt={researcher.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {researcher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                      asChild
                    >
                      <Link href={`/proyectos/${proyecto.slug}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-blue-900">No se encontraron proyectos</h3>
                <p className="text-sm text-blue-600 mb-6">
                  {proyectos.length === 0
                    ? "Aún no hay proyectos registrados en la plataforma."
                    : "Intenta ajustar los filtros de búsqueda para encontrar más resultados."}
                </p>
                {proyectos.length > 0 && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                      setSelectedInstitution("all")
                    }}
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
