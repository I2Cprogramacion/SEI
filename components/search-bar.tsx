"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

// Datos de ejemplo para investigadores
const investigadores = [
  {
    id: 1,
    nombre: "Dra. Ana Martínez",
    avatar: "/placeholder.svg?height=100&width=100",
    institucion: "Centro de Investigación en Materiales Avanzados",
    area: "Ciencias Ambientales",
    keywords: ["Cambio Climático", "Ecosistemas Áridos", "Biodiversidad"],
    slug: "ana-martinez",
  },
  {
    id: 2,
    nombre: "Dr. Carlos Méndez",
    avatar: "/placeholder.svg?height=100&width=100",
    institucion: "Instituto Tecnológico de Chihuahua",
    area: "Inteligencia Artificial",
    keywords: ["Machine Learning", "Deep Learning", "Industria 4.0"],
    slug: "carlos-mendez",
  },
  {
    id: 3,
    nombre: "Dr. Javier López",
    avatar: "/placeholder.svg?height=100&width=100",
    institucion: "Universidad Tecnológica de Ciudad Juárez",
    area: "Agricultura",
    keywords: ["Agricultura", "IoT", "Riego Inteligente"],
    slug: "javier-lopez",
  },
  {
    id: 4,
    nombre: "Dra. María Rodríguez",
    avatar: "/placeholder.svg?height=100&width=100",
    institucion: "Universidad Autónoma de Chihuahua",
    area: "Neurociencia",
    keywords: ["Neurociencia", "Sueño", "Neuroimagen"],
    slug: "maria-rodriguez",
  },
  {
    id: 5,
    nombre: "Dr. Miguel Torres",
    avatar: "/placeholder.svg?height=100&width=100",
    institucion: "Centro de Investigación en Materiales Avanzados",
    area: "Nanotecnología",
    keywords: ["Nanotecnología", "Energía Solar", "Materiales"],
    slug: "miguel-torres",
  },
]

// Datos de ejemplo para proyectos
const proyectos = [
  {
    id: 1,
    titulo: "Impacto del cambio climático en ecosistemas del desierto de Chihuahua",
    investigador: "Dra. Ana Martínez",
    institucion: "Centro de Investigación en Materiales Avanzados",
    area: "Ciencias Ambientales",
    keywords: ["Cambio Climático", "Ecosistemas Áridos", "Biodiversidad"],
    slug: "impacto-cambio-climatico-ecosistemas-desierto-chihuahua",
  },
  {
    id: 2,
    titulo: "Desarrollo de algoritmos de aprendizaje profundo para la industria manufacturera local",
    investigador: "Dr. Carlos Méndez",
    institucion: "Instituto Tecnológico de Chihuahua",
    area: "Inteligencia Artificial",
    keywords: ["Machine Learning", "Deep Learning", "Industria 4.0"],
    slug: "algoritmos-aprendizaje-profundo-industria-manufacturera",
  },
  {
    id: 3,
    titulo: "Innovación en sistemas de riego para agricultura en zonas áridas",
    investigador: "Dr. Javier López",
    institucion: "Universidad Tecnológica de Ciudad Juárez",
    area: "Agricultura",
    keywords: ["Agricultura", "IoT", "Riego Inteligente"],
    slug: "innovacion-sistemas-riego-agricultura-zonas-aridas",
  },
  {
    id: 4,
    titulo: "Análisis de patrones neuronales en trastornos del sueño",
    investigador: "Dra. María Rodríguez",
    institucion: "Universidad Autónoma de Chihuahua",
    area: "Neurociencia",
    keywords: ["Neurociencia", "Sueño", "Neuroimagen"],
    slug: "analisis-patrones-neuronales-trastornos-sueno",
  },
  {
    id: 5,
    titulo: "Desarrollo de materiales nanoestructurados para aplicaciones energéticas",
    investigador: "Dr. Miguel Torres",
    institucion: "Centro de Investigación en Materiales Avanzados",
    area: "Nanotecnología",
    keywords: ["Nanotecnología", "Energía Solar", "Materiales"],
    slug: "desarrollo-materiales-nanoestructurados-aplicaciones-energeticas",
  },
]

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("all")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) return

    // TODO: Implementar lógica de búsqueda real
    // Por ahora, redirigir a la página correspondiente según el tipo
    switch (searchType) {
      case "investigadores":
        router.push(`/investigadores?search=${encodeURIComponent(searchTerm)}`)
        break
      case "proyectos":
        router.push(`/proyectos?search=${encodeURIComponent(searchTerm)}`)
        break
      case "publicaciones":
        router.push(`/publicaciones?search=${encodeURIComponent(searchTerm)}`)
        break
      case "instituciones":
        router.push(`/instituciones?search=${encodeURIComponent(searchTerm)}`)
        break
      default:
        // Búsqueda global - implementar cuando esté disponible
        router.push(`/buscar?q=${encodeURIComponent(searchTerm)}`)
        break
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar investigadores, proyectos, publicaciones..."
            className="pl-12 h-12 text-lg bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white border-blue-200 text-blue-900">
            <SelectValue placeholder="Tipo de búsqueda" />
          </SelectTrigger>
          <SelectContent className="bg-white border-blue-100">
            <SelectItem value="all">Todo</SelectItem>
            <SelectItem value="investigadores">Investigadores</SelectItem>
            <SelectItem value="proyectos">Proyectos</SelectItem>
            <SelectItem value="publicaciones">Publicaciones</SelectItem>
            <SelectItem value="instituciones">Instituciones</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="h-12 px-8 bg-blue-700 text-white hover:bg-blue-800">
          <Search className="mr-2 h-5 w-5" />
          Buscar
        </Button>
      </form>
    </div>
  )
}
