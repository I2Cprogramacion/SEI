"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, X, User, Building, Mail, ExternalLink, Loader2, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Investigador {
  id: number
  nombre: string
  email: string
  institucion: string
  area: string
  slug: string
}

interface InvestigadorAutocompleteProps {
  value?: Investigador | null
  onSelect: (investigador: Investigador | null) => void
  placeholder?: string
  className?: string
  showInstitucion?: boolean
  disabled?: boolean
}

export function InvestigadorAutocomplete({
  value,
  onSelect,
  placeholder = "Buscar investigador...",
  className,
  showInstitucion = true,
  disabled = false
}: InvestigadorAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [investigadores, setInvestigadores] = useState<Investigador[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const debounceRef = useRef<NodeJS.Timeout>()

  // Cargar investigadores cuando se abre el popover
  useEffect(() => {
    if (open) {
      // Cargar todos los investigadores cuando se abre
      if (!searchTerm || searchTerm.length < 2) {
        searchInvestigadores("")
      } else {
        searchInvestigadores(searchTerm)
      }
    } else {
      // Limpiar cuando se cierra
      setInvestigadores([])
    }
  }, [open])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!open) {
      return
    }

    debounceRef.current = setTimeout(async () => {
      await searchInvestigadores(searchTerm)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm, open])

  const searchInvestigadores = async (term: string) => {
    setIsLoading(true)
    setError("")
    
    try {
      // Si el término está vacío o tiene menos de 2 caracteres, buscar todos (sin filtro)
      const queryParam = term.length >= 2 ? term : ""
      const response = await fetch(`/api/investigadores/search?q=${encodeURIComponent(queryParam)}&limit=20`)
      const data = await response.json()
      
      if (response.ok) {
        setInvestigadores(data.investigadores || [])
      } else {
        setError("Error al buscar investigadores")
        setInvestigadores([])
      }
    } catch (error) {
      console.error("Error en búsqueda:", error)
      setError("Error de conexión")
      setInvestigadores([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (investigador: Investigador) => {
    onSelect(investigador)
    setSearchTerm("")
    setOpen(false)
  }

  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    onSelect(null)
    setSearchTerm("")
    setInvestigadores([])
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Investigador seleccionado */}
      {value && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 group">
            <User className="h-3 w-3 flex-shrink-0" />
            <Link
              href={`/investigadores/${value.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
            >
              {value.nombre}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            {showInstitucion && value.institucion && (
              <span className="text-xs text-muted-foreground ml-1">
                • {value.institucion}
              </span>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 hover:bg-transparent p-0 h-4 w-4 flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Búsqueda */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between relative"
            disabled={disabled}
          >
            {value ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{value.nombre}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {value && (
              <X 
                className="absolute right-8 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }} 
              />
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nombre, email o institución..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Buscando...
                </div>
              )}
              
              {error && (
                <div className="p-4 text-center text-sm text-red-500">
                  {error}
                </div>
              )}
              
              {!isLoading && !error && investigadores.length === 0 && searchTerm.length >= 2 && (
                <CommandEmpty>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-2">No se encontraron investigadores</p>
                    <p className="text-xs text-muted-foreground">Puedes escribir el nombre manualmente</p>
                  </div>
                </CommandEmpty>
              )}
              
              {!isLoading && !error && investigadores.length === 0 && searchTerm.length < 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <p className="mb-2">Escribe para buscar o selecciona de la lista</p>
                  <p className="text-xs">Mostrando todos los investigadores disponibles</p>
                </div>
              )}
              
              {investigadores.length > 0 && (
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {searchTerm.length >= 2 
                      ? `${investigadores.length} resultado${investigadores.length !== 1 ? 's' : ''} encontrado${investigadores.length !== 1 ? 's' : ''}`
                      : `${investigadores.length} investigador${investigadores.length !== 1 ? 'es' : ''} disponible${investigadores.length !== 1 ? 's' : ''}`
                    }
                  </div>
                  {investigadores.map((investigador) => (
                    <CommandItem
                      key={investigador.id}
                      value={`${investigador.nombre} ${investigador.email} ${investigador.institucion}`}
                      onSelect={() => handleSelect(investigador)}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            value?.id === investigador.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <Link
                              href={`/investigadores/${investigador.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors truncate"
                            >
                              {investigador.nombre}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{investigador.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{investigador.institucion}</span>
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

