"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"

interface ExportEvaluacionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportEvaluacionDialog({ open, onOpenChange }: ExportEvaluacionDialogProps) {
  const [formato, setFormato] = useState<"pdf" | "excel">("pdf")
  const [incluirGraficos, setIncluirGraficos] = useState(true)
  const [incluirAlertas, setIncluirAlertas] = useState(true)
  const [incluirComparativa, setIncluirComparativa] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportar = async () => {
    setIsExporting(true)
    
    try {
      // Aquí implementarías la lógica real de exportación
      // Por ahora, solo simularemos un delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // En producción, llamarías a una API para generar el reporte
      // const response = await fetch("/api/exportar-evaluacion", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     formato,
      //     incluirGraficos,
      //     incluirAlertas,
      //     incluirComparativa,
      //   }),
      // })
      
      // const blob = await response.blob()
      // const url = window.URL.createObjectURL(blob)
      // const a = document.createElement("a")
      // a.href = url
      // a.download = `reporte-evaluacion-snii.${formato === "pdf" ? "pdf" : "xlsx"}`
      // document.body.appendChild(a)
      // a.click()
      // window.URL.revokeObjectURL(url)
      // document.body.removeChild(a)
      
      onOpenChange(false)
      
      // Mostrar notificación de éxito
      alert("Reporte exportado exitosamente (funcionalidad en desarrollo)")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al exportar el reporte")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Exportar Reporte de Evaluación
          </DialogTitle>
          <DialogDescription>
            Configura las opciones de exportación para el reporte de evaluaciones SNII
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Formato */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Formato del archivo</Label>
            <RadioGroup value={formato} onValueChange={(value) => setFormato(value as "pdf" | "excel")}>
              <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label
                  htmlFor="pdf"
                  className="flex-1 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium">PDF</div>
                    <div className="text-xs text-gray-500">
                      Documento completo con gráficos y tablas
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="excel" id="excel" />
                <Label
                  htmlFor="excel"
                  className="flex-1 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">Excel</div>
                    <div className="text-xs text-gray-500">
                      Hoja de cálculo con datos tabulados
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Contenido a incluir */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Contenido a incluir</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 border rounded-lg p-3">
                <Checkbox
                  id="graficos"
                  checked={incluirGraficos}
                  onCheckedChange={(checked) => setIncluirGraficos(checked as boolean)}
                />
                <Label
                  htmlFor="graficos"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">Gráficos estadísticos</div>
                  <div className="text-xs text-gray-500">
                    Distribución por área y nivel
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-3">
                <Checkbox
                  id="alertas"
                  checked={incluirAlertas}
                  onCheckedChange={(checked) => setIncluirAlertas(checked as boolean)}
                />
                <Label
                  htmlFor="alertas"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">Sistema de alertas</div>
                  <div className="text-xs text-gray-500">
                    Investigadores que requieren atención
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-3">
                <Checkbox
                  id="comparativa"
                  checked={incluirComparativa}
                  onCheckedChange={(checked) => setIncluirComparativa(checked as boolean)}
                />
                <Label
                  htmlFor="comparativa"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">Análisis comparativo</div>
                  <div className="text-xs text-gray-500">
                    Comparación con parámetros SNII
                  </div>
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExportar}
            disabled={isExporting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

