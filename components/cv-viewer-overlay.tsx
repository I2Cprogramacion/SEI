"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, ExternalLink, AlertCircle, Loader2, Eye, X } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [useGoogleViewer, setUseGoogleViewer] = useState(false)

  // URL del visor de Google Docs para PDFs (fallback)
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}&embedded=true`

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

  const handleOpenNewTab = () => {
    window.open(cvUrl, "_blank")
  }

  const handleOpenOverlay = () => {
    console.log('Abriendo overlay...')
    setShowOverlay(true)
    setIsLoading(true)
    setHasError(false)
    setUseGoogleViewer(false)
  }

  const handleCloseOverlay = () => {
    setShowOverlay(false)
  }

  const handleIframeLoad = () => {
    console.log('Iframe cargado')
    setIsLoading(false)
  }

  const handleIframeError = () => {
    console.log('Error en iframe, usando Google Viewer')
    setHasError(true)
    setIsLoading(false)
    setUseGoogleViewer(true)
  }

  const renderPdfInCard = () => {
    if (!cvUrl) {
      return (
        <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No hay CV disponible</p>
            <p className="text-sm text-gray-500 mt-2">
              Sube tu CV desde el dashboard para verlo aquí
            </p>
          </div>
        </div>
      );
    }

    const iframeUrl = useGoogleViewer ? googleViewerUrl : cvUrl

    return (
      <div className="relative w-full h-full bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-blue-600">Cargando PDF...</p>
            </div>
          </div>
        )}
        
        {hasError && !useGoogleViewer ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="h-4 w-4 text-red-600 mb-2" />
              <p className="text-red-800 text-sm">No se pudo cargar el PDF directamente.</p>
            </div>
          </div>
        ) : (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title={`CV de ${investigadorNombre || "Investigador"}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    )
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
                  onClick={handleOpenOverlay}
                  className="text-blue-700 hover:bg-blue-100"
                  title="Ver PDF en pantalla completa"
                >
                  <Eye className="h-4 w-4" />
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
                {renderPdfInCard()}
              </div>
            </div>
          </div>
        </Card>

        {/* OVERLAY PERSONALIZADO - Tarjeta flotante */}
        {showOverlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl h-[90vh] bg-white shadow-2xl">
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
                      variant="outline"
                      size="sm"
                      onClick={handleOpenNewTab}
                      className="text-blue-700 hover:bg-blue-100"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Nueva pestaña
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseOverlay}
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
                    <div className="relative w-full h-full">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
                          <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-blue-600">Cargando PDF...</p>
                          </div>
                        </div>
                      )}
                      
                      <iframe
                        key={`overlay-${useGoogleViewer}`}
                        src={useGoogleViewer ? googleViewerUrl : cvUrl}
                        className="w-full h-full border-0"
                        title={`CV de ${investigadorNombre || "Investigador"} - Vista Completa`}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
        onClick={handleOpenOverlay}
      >
        <Eye className="h-4 w-4" />
        Ver Curriculum Vitae
      </Button>

      {/* OVERLAY PERSONALIZADO - Versión botón */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl h-[90vh] bg-white shadow-2xl">
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
                    variant="outline"
                    size="sm"
                    onClick={handleOpenNewTab}
                    className="text-blue-700 hover:bg-blue-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Nueva pestaña
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseOverlay}
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
                  <div className="relative w-full h-full">
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
                        <div className="text-center">
                          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-blue-600">Cargando PDF...</p>
                        </div>
                      </div>
                    )}
                    
                    <iframe
                      key={`overlay-${useGoogleViewer}`}
                      src={useGoogleViewer ? googleViewerUrl : cvUrl}
                      className="w-full h-full border-0"
                      title={`CV de ${investigadorNombre || "Investigador"} - Vista Completa`}
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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

