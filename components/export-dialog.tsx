"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileSpreadsheet, FileText } from "lucide-react"

interface ExportDialogProps {
  title: string
  description: string
  dataType: "investigadores" | "proyectos" | "instituciones" | "eventos"
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ title, description, dataType, open, onOpenChange }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState("csv")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Campos disponibles según el tipo de datos
  const availableFields = {
    investigadores: [
      { id: "nombre_completo", label: "Nombre completo" },
      { id: "curp", label: "CURP" },
      { id: "rfc", label: "RFC" },
      { id: "correo", label: "Correo electrónico" },
      { id: "institucion", label: "Institución" },
      { id: "linea_investigacion", label: "Línea de investigación" },
    ],
    proyectos: [
      { id: "titulo", label: "Título" },
      { id: "descripcion", label: "Descripción" },
      { id: "investigador_principal", label: "Investigador principal" },
      { id: "institucion", label: "Institución" },
      { id: "fecha_inicio", label: "Fecha de inicio" },
      { id: "fecha_fin", label: "Fecha de fin" },
    ],
    instituciones: [
      { id: "nombre", label: "Nombre" },
      { id: "tipo", label: "Tipo" },
      { id: "ubicacion", label: "Ubicación" },
      { id: "investigadores", label: "Número de investigadores" },
      { id: "proyectos", label: "Número de proyectos" },
    ],
    eventos: [
      { id: "nombre", label: "Nombre" },
      { id: "fecha", label: "Fecha" },
      { id: "ubicacion", label: "Ubicación" },
      { id: "organizador", label: "Organizador" },
      { id: "participantes", label: "Número de participantes" },
    ],
  }

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const handleSelectAll = () => {
    const allFields = availableFields[dataType].map((field) => field.id)
    setSelectedFields(allFields)
  }

  const handleClearAll = () => {
    setSelectedFields([])
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un campo para exportar.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulación de exportación
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mostrar notificación de éxito
      toast({
        title: "Exportación completada",
        description: `Los datos han sido exportados en formato ${exportFormat.toUpperCase()}.`,
        variant: "default",
      })

      // Cerrar el diálogo
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border-blue-100">
        <DialogHeader>
          <DialogTitle className="text-blue-900">{title}</DialogTitle>
          <DialogDescription className="text-blue-600">{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-blue-900">Formato de exportación</h3>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="text-blue-900">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    CSV
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="text-blue-900">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    Excel
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="text-blue-900">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-blue-900">Campos a exportar</h3>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Seleccionar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Limpiar
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableFields[dataType].map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <Label htmlFor={field.id} className="text-blue-900 text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isSubmitting || selectedFields.length === 0}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            {isSubmitting ? (
              "Exportando..."
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
