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
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"

interface ExportDialogProps {
  title: string
  description?: string
  dataType?: "investigadores" | "proyectos" | "instituciones" | "publicaciones" | "eventos"
  data?: any[]
  filename?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ title, description, dataType, data, filename, open, onOpenChange }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState("csv")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Campos disponibles según el tipo de datos (actualizados para coincidir con la BD)
  const availableFields = {
    investigadores: [
      { id: "nombre_completo", label: "Nombre completo" },
      { id: "curp", label: "CURP" },
      { id: "rfc", label: "RFC" },
      { id: "correo", label: "Correo electrónico" },
      { id: "telefono", label: "Teléfono" },
      { id: "institucion", label: "Institución" },
      { id: "area_investigacion", label: "Área de investigación" },
      { id: "linea_investigacion", label: "Línea de investigación" },
      { id: "nivel_investigador", label: "Nivel investigador" },
      { id: "ultimo_grado_estudios", label: "Último grado de estudios" },
      { id: "municipio", label: "Municipio" },
      { id: "nacionalidad", label: "Nacionalidad" },
      { id: "genero", label: "Género" },
      { id: "fecha_registro", label: "Fecha de registro" },
    ],
    proyectos: [
      { id: "titulo", label: "Título" },
      { id: "descripcion", label: "Descripción" },
      { id: "investigador_principal", label: "Investigador principal" },
      { id: "institucion", label: "Institución" },
      { id: "fecha_inicio", label: "Fecha de inicio" },
      { id: "fecha_fin", label: "Fecha de fin" },
      { id: "estado", label: "Estado" },
      { id: "categoria", label: "Categoría" },
      { id: "area_investigacion", label: "Área de investigación" },
      { id: "presupuesto", label: "Presupuesto" },
    ],
    instituciones: [
      { id: "nombre", label: "Nombre" },
      { id: "siglas", label: "Siglas" },
      { id: "tipo", label: "Tipo" },
      { id: "estado", label: "Estado" },
      { id: "sitio_web", label: "Sitio Web" },
      { id: "direccion", label: "Dirección" },
      { id: "telefono", label: "Teléfono" },
      { id: "activo", label: "Activo" },
    ],
    publicaciones: [
      { id: "titulo", label: "Título" },
      { id: "autor", label: "Autor(es)" },
      { id: "editorial", label: "Editorial/Revista" },
      { id: "año_creacion", label: "Año" },
      { id: "doi", label: "DOI" },
      { id: "tipo", label: "Tipo" },
      { id: "categoria", label: "Categoría" },
      { id: "resumen", label: "Resumen" },
      { id: "palabras_clave", label: "Palabras clave" },
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
    if (!dataType || !availableFields[dataType]) return
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

    if (!dataType) {
      toast({
        title: "Error",
        description: "Tipo de datos no especificado.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const params = new URLSearchParams({
        type: dataType,
        format: exportFormat,
        fields: selectedFields.join(',')
      })

      const response = await fetch(`/api/admin/export?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al exportar')
      }

      if (exportFormat === 'pdf') {
        // Para PDF, generar el documento en el cliente
        const jsonData = await response.json()
        await generatePDF(jsonData, dataType)
      } else {
        // Para CSV y Excel, descargar el archivo directamente
        const blob = await response.blob()
        const extension = exportFormat === 'excel' ? 'xls' : 'csv'
        const fileName = `${dataType}_export_${new Date().toISOString().split('T')[0]}.${extension}`
        
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      // Mostrar notificación de éxito
      toast({
        title: "Exportación completada",
        description: `Los datos han sido exportados en formato ${exportFormat.toUpperCase()}.`,
        variant: "default",
      })

      // Cerrar el diálogo
      onOpenChange(false)
      
    } catch (error) {
      console.error('Error en exportación:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron exportar los datos. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para generar PDF en el cliente
  const generatePDF = async (jsonData: any, type: string) => {
    const { data, headers } = jsonData

    // Crear contenido HTML para el PDF
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión. Verifica que los pop-ups estén habilitados.')
    }

    const typeLabels: Record<string, string> = {
      investigadores: 'Investigadores',
      proyectos: 'Proyectos',
      instituciones: 'Instituciones',
      publicaciones: 'Publicaciones',
      eventos: 'Eventos'
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exportación de ${typeLabels[type] || type}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 40px; 
      color: #1e293b;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      padding-bottom: 20px;
      border-bottom: 3px solid #1e40af;
    }
    .header h1 { 
      color: #1e40af; 
      font-size: 28px; 
      margin-bottom: 8px;
    }
    .header p { 
      color: #64748b; 
      font-size: 14px;
    }
    .logo { 
      font-weight: bold; 
      font-size: 16px; 
      color: #1e40af;
      margin-bottom: 10px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px;
      font-size: 11px;
    }
    th { 
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white; 
      padding: 12px 8px; 
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    td { 
      padding: 10px 8px; 
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) { 
      background-color: #f8fafc; 
    }
    tr:hover { 
      background-color: #f1f5f9; 
    }
    .footer { 
      margin-top: 30px; 
      text-align: center; 
      color: #94a3b8;
      font-size: 11px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 20px 0;
    }
    .stat-item {
      text-align: center;
      padding: 15px 25px;
      background: #f1f5f9;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Sistema Estatal de Investigadores - Chihuahua</div>
    <h1>Reporte de ${typeLabels[type] || type}</h1>
    <p>Generado el ${new Date().toLocaleDateString('es-MX', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
  </div>
  
  <div class="stats">
    <div class="stat-item">
      <div class="stat-value">${data.length}</div>
      <div class="stat-label">Total de registros</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${headers.length}</div>
      <div class="stat-label">Campos exportados</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>#</th>
        ${headers.map((h: string) => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map((row: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          ${selectedFields.map(field => `<td>${row[field] || '-'}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Sistema Estatal de Investigadores de Chihuahua - SEI</p>
    <p>Este documento fue generado automáticamente</p>
  </div>
  
  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    ">
      Imprimir / Guardar como PDF
    </button>
    <button onclick="window.close()" style="
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
      padding: 12px 30px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      margin-left: 10px;
      font-weight: 600;
    ">
      Cerrar
    </button>
  </div>
</body>
</html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white border-blue-100">
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
                <Label htmlFor="csv" className="text-blue-900 cursor-pointer">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />
                    CSV
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="text-blue-900 cursor-pointer">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-1 text-green-700" />
                    Excel
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="text-blue-900 cursor-pointer">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-red-600" />
                    PDF
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-blue-900">
                Campos a exportar 
                <span className="text-blue-500 font-normal ml-2">
                  ({selectedFields.length} seleccionados)
                </span>
              </h3>
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
            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto p-2 border border-blue-100 rounded-lg bg-blue-50/30">
              {dataType && availableFields[dataType] ? (
                availableFields[dataType].map((field) => (
                  <div key={field.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-blue-100/50 transition-colors">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <Label htmlFor={field.id} className="text-blue-900 text-sm cursor-pointer flex-1">
                      {field.label}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-blue-600 py-4">
                  No hay campos disponibles para exportar
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isSubmitting || selectedFields.length === 0}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> 
                Exportar {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
