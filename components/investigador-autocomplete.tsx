"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, X, Loader2, ChevronsUpDown, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Investigador {
  id: number
  nombre: string
  email: string
  foto: string | null
  slug: string
}

interface InvestigadorAutocompleteProps {
  value?: Investigador | null
  onSelect: (investigador: Investigador | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  excludeIds?: number[] // IDs de investigadores a excluir
}

export function InvestigadorAutocomplete({
  value,
  onSelect,
  placeholder = "Buscar investigador...",
  className,
  disabled = false,
  excludeIds = []
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
      // Buscar solo investigadores conectados con el usuario actual
      const queryParam = term.length >= 2 ? term : ""
      const response = await fetch(`/api/investigadores/conexiones?q=${encodeURIComponent(queryParam)}&limit=20`)
      const data = await response.json()
      
      if (response.ok) {
        // Filtrar los investigadores excluidos (ya seleccionados en otro campo)
        const investigadoresFiltrados = (data.investigadores || []).filter(
          (inv: Investigador) => !excludeIds.includes(inv.id)
        )
        setInvestigadores(investigadoresFiltrados)
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
          <Badge variant="secondary" className="flex items-center gap-2 px-2 py-1.5 pr-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={value.foto || undefined} alt={value.nombre} />
              <AvatarFallback className="text-[10px]">
                {value.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{value.nombre}</span>
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 h-5 w-5 flex items-center justify-center transition-colors"
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
                <Avatar className="h-5 w-5">
                  <AvatarImage src={value.foto || undefined} alt={value.nombre} />
                  <AvatarFallback className="text-[10px]">
                    {value.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{value.nombre}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {value && (
              <X 
                className="absolute right-8 h-4 w-4 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors" 
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
              placeholder="Buscar por nombre o correo..."
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
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">No se encontraron conexiones con ese nombre</p>
                    <p className="text-xs text-muted-foreground">Solo puedes seleccionar investigadores conectados</p>
                  </div>
                </CommandEmpty>
              )}
              
              {!isLoading && !error && investigadores.length === 0 && searchTerm.length < 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p className="mb-2">No tienes conexiones aún</p>
                  <p className="text-xs">Conecta con otros investigadores primero</p>
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
                      value={`${investigador.nombre} ${investigador.email}`}
                      onSelect={() => handleSelect(investigador)}
                      className="flex items-center gap-3 cursor-pointer py-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          value?.id === investigador.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={investigador.foto || undefined} alt={investigador.nombre} />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {investigador.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm">{investigador.nombre}</span>
                        <span className="text-xs text-muted-foreground truncate">{investigador.email}</span>
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

