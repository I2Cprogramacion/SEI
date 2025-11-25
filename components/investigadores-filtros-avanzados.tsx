"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { AREAS_SNII, NIVELES_SNII } from "@/lib/snii-parametros"

interface FiltrosAvanzadosProps {
  onFiltrosChange: (filtros: FiltrosInvestigador) => void
  filtrosActivos: FiltrosInvestigador
}

export interface FiltrosInvestigador {
  area?: string
  nivel?: string
  estado?: "bajo" | "medio" | "alto" | null
  institucion?: string
}

export function InvestigadoresFiltrosAvanzados({ onFiltrosChange, filtrosActivos }: FiltrosAvanzadosProps) {
  const [filtrosTemp, setFiltrosTemp] = useState<FiltrosInvestigador>(filtrosActivos)
  const [open, setOpen] = useState(false)

  const handleAplicarFiltros = () => {
    onFiltrosChange(filtrosTemp)
    setOpen(false)
  }

  const handleLimpiarFiltros = () => {
    const filtrosVacios: FiltrosInvestigador = {}
    setFiltrosTemp(filtrosVacios)
    onFiltrosChange(filtrosVacios)
    setOpen(false)
  }

  const contarFiltrosActivos = () => {
    return Object.values(filtrosActivos).filter(v => v !== undefined && v !== null && v !== "").length
  }

  const filtrosCount = contarFiltrosActivos()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-sm hover:shadow-md transition-all relative"
        >
          <Filter className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {filtrosCount > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-2 px-1.5 py-0 h-5 min-w-[20px] text-xs"
            >
              {filtrosCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avanzados</SheetTitle>
          <SheetDescription>
            Filtra investigadores por área, nivel y estado de cumplimiento SNII
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Filtro por Área */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Área de Conocimiento
            </label>
            <Select 
              value={filtrosTemp.area || "todas"} 
              onValueChange={(value) => 
                setFiltrosTemp({ ...filtrosTemp, area: value === "todas" ? undefined : value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas las áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {Object.values(AREAS_SNII).map((area) => (
                  <SelectItem key={area.id} value={area.nombre}>
                    {area.nombre.length > 50 
                      ? area.nombre.substring(0, 50) + "..." 
                      : area.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Nivel */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Nivel SNII
            </label>
            <Select 
              value={filtrosTemp.nivel || "todos"} 
              onValueChange={(value) => 
                setFiltrosTemp({ ...filtrosTemp, nivel: value === "todos" ? undefined : value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los niveles</SelectItem>
                {NIVELES_SNII.map((nivel) => (
                  <SelectItem key={nivel.id} value={nivel.nombre}>
                    {nivel.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Estado de Cumplimiento */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Estado vs Parámetros SNII
            </label>
            <Select 
              value={filtrosTemp.estado || "todos"} 
              onValueChange={(value) => 
                setFiltrosTemp({ 
                  ...filtrosTemp, 
                  estado: value === "todos" ? null : value as "bajo" | "medio" | "alto"
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="alto">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Por encima (Alto)
                  </div>
                </SelectItem>
                <SelectItem value="medio">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    En rango (Medio)
                  </div>
                </SelectItem>
                <SelectItem value="bajo">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Por debajo (Bajo)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Basado en comparación con cuartiles Q1-Q3 del SNII
            </p>
          </div>

          {/* Filtros activos */}
          {filtrosCount > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Filtros activos ({filtrosCount})
              </h4>
              <div className="flex flex-wrap gap-2">
                {filtrosActivos.area && (
                  <Badge variant="secondary" className="text-xs">
                    Área: {filtrosActivos.area.length > 25 
                      ? filtrosActivos.area.substring(0, 25) + "..." 
                      : filtrosActivos.area}
                  </Badge>
                )}
                {filtrosActivos.nivel && (
                  <Badge variant="secondary" className="text-xs">
                    Nivel: {filtrosActivos.nivel}
                  </Badge>
                )}
                {filtrosActivos.estado && (
                  <Badge variant="secondary" className="text-xs">
                    Estado: {filtrosActivos.estado === "alto" ? "Por encima" : filtrosActivos.estado === "medio" ? "En rango" : "Por debajo"}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleLimpiarFiltros} 
              variant="outline"
              className="flex-1"
              disabled={filtrosCount === 0}
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
            <Button 
              onClick={handleAplicarFiltros}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
            >
              <Filter className="mr-2 h-4 w-4" />
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

