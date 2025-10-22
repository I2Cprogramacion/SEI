"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, FileText, Building2, Lightbulb } from "lucide-react"
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
          variant="outline" 
          className="relative h-9 w-full justify-start rounded-md bg-muted/50 px-3 text-sm text-muted-foreground sm:pr-12"
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar investigadores, proyectos...
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
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
          />
          <CommandList>
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Buscando...
              </div>
            )}
            {!loading && query.length < 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Escribe al menos 2 caracteres para buscar
              </div>
            )}
            {!loading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty>No se encontraron resultados para "{query}"</CommandEmpty>
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
                          className="flex items-center gap-3 p-3"
                        >
                          <div className={cn("p-2 rounded-full", typeInfo.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{result.title}</div>
                            <div className="text-sm text-muted-foreground">{result.description}</div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
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
