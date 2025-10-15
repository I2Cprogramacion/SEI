"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, X } from "lucide-react"
import { Card } from "@/components/ui/card"

interface CvViewerProps {
  cvUrl: string
  investigadorNombre?: string
  showAsCard?: boolean
}

export function CvViewer({ 
  cvUrl, 
  investigadorNombre, 
  showAsCard = false 
}: CvViewerProps) {
  const [showOverlay, setShowOverlay] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(cvUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `CV_${investigadorNombre?.replace(/\s+/g, '_') || 'documento'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar:', error)
      window.open(cvUrl, "_blank")
    }
  }

  if (showAsCard) {
    return (
      <>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all">
          <div className="p-6">
            {/* Header con botones */}
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Curriculum Vitae
                </h3>
                <p className="text-sm text-blue-600">
                  {investigadorNombre ? `CV de ${investigadorNombre}` : "Ver curriculum completo"}
                </p>
              </div>
              <div className="flex gap-2">
                {/* Botón de ojo para abrir overlay */}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔍 CLICK EN OJO - Abriendo overlay...')
                    console.log('CV URL:', cvUrl)
                    setShowOverlay(true)
                  }}
                  className="text-blue-700 hover:bg-blue-100 bg-blue-50 border-blue-300"
                  title="Ver PDF en pantalla completa - HAZ CLIC AQUÍ"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver PDF
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDownload}
                  className="text-blue-700 hover:bg-blue-100"
                  title="Descargar PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* PDF Viewer en la tarjeta */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Vista previa del PDF</span>
                <span className="text-xs text-gray-500">Haz clic en el ojo para ver completo</span>
              </div>
              <div className="relative" style={{ height: '500px' }}>
                {cvUrl ? (
                  <iframe
                    src={cvUrl}
                    className="w-full h-full border-0"
                    title={`CV de ${investigadorNombre || "Investigador"}`}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No hay CV disponible</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Sube tu CV desde el dashboard para verlo aquí
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* OVERLAY SIMPLE - Tarjeta flotante */}
        {showOverlay && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOverlay(false)}
          >
            <Card 
              className="w-full max-w-6xl h-[90vh] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del overlay */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">Curriculum Vitae - Vista Completa</h2>
                    {investigadorNombre && (
                      <p className="text-blue-600 mt-1">{investigadorNombre}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOverlay(false)}
                      className="text-gray-500 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Contenido del PDF */}
              <div className="flex-1 overflow-hidden p-4">
                <div className="h-full bg-gray-100 rounded-lg overflow-hidden">
                  {cvUrl ? (
                    <iframe
                      src={cvUrl}
                      className="w-full h-full border-0"
                      title={`CV de ${investigadorNombre || "Investigador"} - Vista Completa`}
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No hay CV disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </>
    )
  }

  // Versión simple (botón)
  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={() => setShowOverlay(true)}
      >
        <Eye className="h-4 w-4" />
        Ver Curriculum Vitae
      </Button>

      {/* OVERLAY SIMPLE - Versión botón */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOverlay(false)}
        >
          <Card 
            className="w-full max-w-6xl h-[90vh] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del overlay */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">Curriculum Vitae</h2>
                  {investigadorNombre && (
                    <p className="text-blue-600 mt-1">{investigadorNombre}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="text-blue-700 hover:bg-blue-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOverlay(false)}
                    className="text-gray-500 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Contenido del PDF */}
            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full bg-gray-100 rounded-lg overflow-hidden">
                {cvUrl ? (
                  <iframe
                    src={cvUrl}
                    className="w-full h-full border-0"
                    title={`CV de ${investigadorNombre || "Investigador"} - Vista Completa`}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No hay CV disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
