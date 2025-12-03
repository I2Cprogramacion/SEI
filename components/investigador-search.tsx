"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X, User, Building, Mail, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Investigador {
  id: number
  nombre: string
  email: string
  institucion: string
  area: string
  slug: string
}

interface InvestigadorSearchProps {
  selectedInvestigadores: Investigador[]
  onSelectionChange: (investigadores: Investigador[]) => void
  placeholder?: string
  className?: string
}

export function InvestigadorSearch({ 
  selectedInvestigadores, 
  onSelectionChange, 
  placeholder = "Buscar investigadores registrados...",
  className 
}: InvestigadorSearchProps) {
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
      // Buscar solo investigadores conectados con el usuario actual
      const queryParam = term.length >= 2 ? term : ""
      const response = await fetch(`/api/investigadores/conexiones?q=${encodeURIComponent(queryParam)}&limit=20`)
      const data = await response.json()
      
      if (response.ok) {
        setInvestigadores(data.investigadores || [])
        // Mostrar mensaje si no tiene conexiones
        if (data.mensaje) {
          setError(data.mensaje)
        }
      } else if (response.status === 401) {
        setError("Debes iniciar sesión para ver tus conexiones")
        setInvestigadores([])
      } else {
        setError("Error al buscar conexiones")
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
    const isSelected = selectedInvestigadores.some(inv => inv.id === investigador.id)
    
    if (isSelected) {
      // Remover de la selección
      onSelectionChange(selectedInvestigadores.filter(inv => inv.id !== investigador.id))
    } else {
      // Agregar a la selección
      onSelectionChange([...selectedInvestigadores, investigador])
    }
    
    setSearchTerm("")
    setOpen(false)
  }

  const handleRemove = (investigadorId: number) => {
    onSelectionChange(selectedInvestigadores.filter(inv => inv.id !== investigadorId))
  }

  const isSelected = (investigador: Investigador) => {
    return selectedInvestigadores.some(inv => inv.id === investigador.id)
    
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Investigadores seleccionados */}
      {selectedInvestigadores.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedInvestigadores.map((investigador) => (
            <Badge
              key={investigador.id}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1.5"
            >
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="text-sm">{investigador.nombre}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(investigador.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Búsqueda */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedInvestigadores.length > 0 
              ? `${selectedInvestigadores.length} investigador${selectedInvestigadores.length !== 1 ? 'es' : ''} seleccionado${selectedInvestigadores.length !== 1 ? 's' : ''}`
              : placeholder
            }
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
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">No se encontraron conexiones con ese nombre</p>
                    <p className="text-xs text-muted-foreground">Solo puedes agregar investigadores con los que estés conectado</p>
                  </div>
                </CommandEmpty>
              )}
              
              {!isLoading && !error && investigadores.length === 0 && searchTerm.length < 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p className="mb-2">No tienes conexiones aún</p>
                  <p className="text-xs">Conecta con otros investigadores para poder agregarlos como autores</p>
                </div>
              )}
              
              {investigadores.length > 0 && (
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {searchTerm.length >= 2 
                      ? `${investigadores.length} conexión${investigadores.length !== 1 ? 'es' : ''} encontrada${investigadores.length !== 1 ? 's' : ''}`
                      : `${investigadores.length} conexión${investigadores.length !== 1 ? 'es' : ''} disponible${investigadores.length !== 1 ? 's' : ''}`
                    }
                  </div>
                  {investigadores.map((investigador) => (
                    <CommandItem
                      key={investigador.id}
                      value={`${investigador.nombre} ${investigador.email} ${investigador.institucion}`}
                      onSelect={() => handleSelect(investigador)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isSelected(investigador) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium">{investigador.nombre}</span>
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
