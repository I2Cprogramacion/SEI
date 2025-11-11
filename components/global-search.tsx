"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, FileText, Building2, Lightbulb, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'investigador' | 'proyecto' | 'institucion' | 'campo'
  href: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const searchTypes = {
    investigador: { icon: User, label: "Investigadores", color: "bg-blue-100 text-blue-800" },
    proyecto: { icon: FileText, label: "Proyectos", color: "bg-green-100 text-green-800" },
    institucion: { icon: Building2, label: "Instituciones", color: "bg-purple-100 text-purple-800" },
    campo: { icon: Lightbulb, label: "Campos", color: "bg-orange-100 text-orange-800" }
  }

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    router.push(result.href)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Buscar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Búsqueda Global</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput 
            placeholder="Buscar investigadores, proyectos, instituciones, campos..."
            value={query}
            onValueChange={setQuery}
            className="h-12"
          />
          <CommandList className="max-h-96">
            {loading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            )}
            {!loading && query.length < 2 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p>Escribe al menos 2 caracteres para buscar</p>
              </div>
            )}
            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p>No se encontraron resultados para "{query}"</p>
              </div>
            )}
            {results.length > 0 && (
              <>
                {Object.entries(
                  results.reduce((acc, result) => {
                    if (!acc[result.type]) acc[result.type] = []
                    acc[result.type].push(result)
                    return acc
                  }, {} as Record<string, SearchResult[]>)
                ).map(([type, items]) => {
                  const typeInfo = searchTypes[type as keyof typeof searchTypes]
                  const Icon = typeInfo.icon
                  
                  return (
                    <CommandGroup key={type} heading={typeInfo.label}>
                      {items.map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50"
                        >
                          <div className={cn("p-2 rounded-full flex-shrink-0", typeInfo.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{result.title}</div>
                            <div className="text-sm text-gray-500 truncate">{result.description}</div>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {typeInfo.label}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                })}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
