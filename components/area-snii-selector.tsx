"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Beaker } from "lucide-react"

// 9 Áreas del SNII según el documento oficial
export const AREAS_SNII = [
  "I. Físico Matemáticas y Ciencias de la Tierra",
  "II. Biología y Química",
  "III. Medicina y Ciencias de la Salud",
  "IV. Ciencias de la Conducta y la Educación",
  "V. Humanidades",
  "VI. Ciencias Sociales",
  "VII. Ciencias de la Agricultura, Agropecuarias, Forestales y de Ecosistemas",
  "VIII. Ingenierías y Desarrollo Tecnológico",
  "IX. Multidisciplinaria"
] as const

interface AreaSNIISelectorProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: boolean
  disabled?: boolean
}

export function AreaSNIISelector({
  value,
  onChange,
  required = false,
  error = false,
  disabled = false
}: AreaSNIISelectorProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="area_investigacion"
        className="text-blue-900 text-sm font-medium flex items-center gap-2"
      >
        <Beaker className="h-4 w-4" />
        Área de Investigación {required && "*"}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="area_investigacion"
          className={`bg-white border-blue-200 text-blue-900 ${
            error ? "border-red-300 bg-red-50" : ""
          }`}
          aria-label="Seleccionar área de investigación"
        >
          <SelectValue placeholder="Selecciona tu área de investigación" />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {AREAS_SNII.map((area) => (
            <SelectItem key={area} value={area} className="text-sm py-3">
              {area}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-blue-600">
        Selecciona tu área según la clasificación del Sistema Nacional de Investigadores e Investigadoras
      </p>
    </div>
  )
}
