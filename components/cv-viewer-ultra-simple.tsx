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

  console.log('🎯 CvViewer renderizado con URL:', cvUrl)

  const handleDownload = async () => {
    try {
      window.open(cvUrl, "_blank")
    } catch (error) {
      console.error('Error al descargar:', error)
    }
  }

  if (showAsCard) {
    return (
      <>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all">
          <div className="p-6">
            {/* Header */}
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
                {/* BOTÓN PRINCIPAL - SÚPER VISIBLE */}
                <Button 
                  onClick={() => {
                    console.log('🚀 CLICK EN VER PDF - Abriendo overlay...')
                    console.log('CV URL:', cvUrl)
                    setShowOverlay(true)
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  VER PDF COMPLETO
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-blue-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Vista previa simple */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <span className="text-sm font-medium text-gray-700">Vista previa del PDF</span>
              </div>
              <div className="relative" style={{ height: '400px' }}>
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* OVERLAY SÚPER SIMPLE */}
        {showOverlay && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOverlay(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b bg-green-50 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-green-800">📄 CV COMPLETO</h2>
                  <Button 
                    onClick={() => setShowOverlay(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* PDF */}
              <div className="flex-1 p-4">
                <div className="h-full bg-gray-100 rounded">
                  {cvUrl && (
                    <iframe
                      src={cvUrl}
                      className="w-full h-full border-0 rounded"
                      title="CV Completo"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Versión botón simple
  return (
    <>
      <Button 
        onClick={() => setShowOverlay(true)}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Eye className="h-4 w-4 mr-2" />
        VER CV COMPLETO
      </Button>

      {/* Overlay versión botón */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOverlay(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b bg-green-50 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-800">📄 CV COMPLETO</h2>
                <Button 
                  onClick={() => setShowOverlay(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="h-full bg-gray-100 rounded">
                {cvUrl && (
                  <iframe
                    src={cvUrl}
                    className="w-full h-full border-0 rounded"
                    title="CV Completo"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

