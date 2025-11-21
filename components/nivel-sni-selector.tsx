"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Award, ChevronDown, ChevronUp } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Niveles SNI con descripciones detalladas
export const NIVELES_SNI = [
  {
    id: "candidato",
    nombre: "Candidato a Investigador Nacional",
    descripcion: "Doctores que acaban de obtener el grado o investigadores en el inicio de su carrera de investigación que muestran un desarrollo prometedor en la generación de conocimientos científicos o tecnológicos originales."
  },
  {
    id: "nivel_1",
    nombre: "Investigador Nacional Nivel I",
    descripcion: "Investigadores que han realizado trabajos que demuestran que su desarrollo académico y su calidad científica se han consolidado, con contribuciones originales que constituyen avances en el conocimiento de un campo específico."
  },
  {
    id: "nivel_2",
    nombre: "Investigador Nacional Nivel II",
    descripcion: "Investigadores con una obra científica o tecnológica reconocida a nivel nacional e internacional, quienes han contribuido de manera significativa en la formación de recursos humanos especializados y en la creación y consolidación de grupos de investigación."
  },
  {
    id: "nivel_3",
    nombre: "Investigador Nacional Nivel III",
    descripcion: "Investigadores que han realizado contribuciones científicas o tecnológicas que han llegado a trascender, además de haber desarrollado trabajos científicos o tecnológicos de alto nivel de calidad y trascendencia. Líderes en sus campos de conocimiento."
  },
  {
    id: "emerito",
    nombre: "Investigador Nacional Emérito",
    descripcion: "Distinción reservada a aquellos investigadores que se hayan distinguido por su contribución excepcional al avance de la ciencia y la tecnología, y a la formación de investigadores."
  }
] as const

interface NivelSNISelectorProps {
  value: string
  onChange: (value: string) => void
  areaSNII?: string
  required?: boolean
  error?: boolean
  disabled?: boolean
}

export function NivelSNISelector({
  value,
  onChange,
  areaSNII,
  required = false,
  error = false,
  disabled = false
}: NivelSNISelectorProps) {
  const [expandedNivel, setExpandedNivel] = useState<string | null>(null)
  const [selectedNivel, setSelectedNivel] = useState<string>(value)

  useEffect(() => {
    setSelectedNivel(value)
  }, [value])

  const handleSelectNivel = (nivelId: string) => {
    setSelectedNivel(nivelId)
    onChange(nivelId)
  }

  return (
    <div className="space-y-3">
      <Label className="text-blue-900 text-sm font-medium flex items-center gap-2">
        <Award className="h-4 w-4" />
        Nivel SNI {required && "*"}
      </Label>
      
      {areaSNII && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-blue-700">
            <strong>Área seleccionada:</strong> {areaSNII}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Los criterios de evaluación varían según el área. Revisa las descripciones de cada nivel.
          </p>
        </div>
      )}

      <div className={`space-y-2 border-2 rounded-lg p-2 ${error ? "border-red-300 bg-red-50" : "border-blue-100"}`}>
        {NIVELES_SNI.map((nivel) => (
          <Collapsible
            key={nivel.id}
            open={expandedNivel === nivel.id}
            onOpenChange={(isOpen) => setExpandedNivel(isOpen ? nivel.id : null)}
          >
            <Card
              className={`transition-all ${
                selectedNivel === nivel.id
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border border-gray-200 hover:border-blue-300"
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="radio"
                      name="nivel_sni"
                      value={nivel.id}
                      checked={selectedNivel === nivel.id}
                      onChange={() => handleSelectNivel(nivel.id)}
                      disabled={disabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      aria-label={nivel.nombre}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-blue-900">
                        {nivel.nombre}
                      </p>
                      {selectedNivel === nivel.id && (
                        <Badge className="mt-1 bg-blue-600 text-white text-xs">
                          Seleccionado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={disabled}
                    >
                      {expandedNivel === nivel.id ? (
                        <ChevronUp className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="mt-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {nivel.descripcion}
                    </p>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {!selectedNivel && error && (
        <p className="text-xs text-red-600 mt-2">
          Por favor, selecciona un nivel SNI
        </p>
      )}

      <p className="text-xs text-blue-600">
        Haz clic en las flechas para ver la descripción de cada nivel
      </p>
    </div>
  )
}
