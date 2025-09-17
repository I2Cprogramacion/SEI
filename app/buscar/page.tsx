"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search, User, FileText, Building, Eye } from "lucide-react"
import Link from "next/link"

interface SearchResult {
  investigadores: Array<{
    id: number
    nombre: string
    institucion: string
    area: string
    slug: string
    keywords: string[]
  }>
  proyectos: Array<{
    id: string
    titulo: string
    investigador: string
    institucion: string
    area: string
    slug: string
    keywords: string[]
  }>
  total: number
}

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  
  const [results, setResults] = useState<SearchResult>({
    investigadores: [],
    proyectos: [],
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`)
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Error fetching search results:', error)
        setError('Error al realizar la búsqueda')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, type])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-blue-600">Buscando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Resultados de búsqueda
        </h1>
        <p className="text-blue-600">
          {query && (
            <>
              {results.total} resultado{results.total !== 1 ? 's' : ''} para "{query}"
            </>
          )}
        </p>
      </div>

      {!query.trim() && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-600">Ingresa un término de búsqueda para comenzar</p>
        </div>
      )}

      {query.trim() && results.total === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-600">No se encontraron resultados para "{query}"</p>
        </div>
      )}

      {/* Investigadores */}
      {results.investigadores.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-semibold text-blue-900">
              Investigadores ({results.investigadores.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {results.investigadores.map((investigador) => (
              <Card key={investigador.id} className="bg-white border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {investigador.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-blue-900">{investigador.nombre}</h3>
                        <p className="text-sm text-blue-600">{investigador.institucion}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                            {investigador.area}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" asChild>
                      <Link href={`/investigadores/${investigador.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Proyectos y Publicaciones */}
      {results.proyectos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-semibold text-blue-900">
              Proyectos y Publicaciones ({results.proyectos.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {results.proyectos.map((proyecto) => (
              <Card key={proyecto.id} className="bg-white border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900 mb-2">{proyecto.titulo}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-700 text-white text-xs">
                          {proyecto.area}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-blue-600">
                        <User className="h-4 w-4 mr-1" />
                        {proyecto.investigador}
                      </div>
                      <div className="flex items-center text-sm text-blue-600 mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {proyecto.institucion}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" asChild>
                      <Link href={`/proyectos/${proyecto.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
