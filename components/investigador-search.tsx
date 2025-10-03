"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X, User, Building, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface Investigador {
  id: number
  nombre: string
  email: string
  institucion: string
  area: string
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

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (searchTerm.length < 2) {
      setInvestigadores([])
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
  }, [searchTerm])

  const searchInvestigadores = async (term: string) => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch(`/api/investigadores/search?q=${encodeURIComponent(term)}&limit=10`)
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
              className="flex items-center gap-2 px-3 py-1"
            >
              <User className="h-3 w-3" />
              <span className="text-sm">{investigador.nombre}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(investigador.id)}
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
              
              {!isLoading && !error && searchTerm.length < 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar
                </div>
              )}
              
              {!isLoading && !error && searchTerm.length >= 2 && investigadores.length === 0 && (
                <CommandEmpty>No se encontraron investigadores</CommandEmpty>
              )}
              
              {investigadores.length > 0 && (
                <CommandGroup>
                  {investigadores.map((investigador) => (
                    <CommandItem
                      key={investigador.id}
                      value={`${investigador.nombre} ${investigador.email} ${investigador.institucion}`}
                      onSelect={() => handleSelect(investigador)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            isSelected(investigador) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span className="font-medium">{investigador.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{investigador.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span>{investigador.institucion}</span>
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
