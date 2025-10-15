"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, X, ExternalLink, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CvViewerEnhancedProps {
  cvUrl: string
  investigadorNombre?: string
  showAsCard?: boolean
}

export function CvViewerEnhanced({ 
  cvUrl, 
  investigadorNombre, 
  showAsCard = false 
}: CvViewerEnhancedProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'iframe' | 'object' | 'embed'>('iframe')
  const [zoom, setZoom] = useState<number>(150)

  // Log para verificar que se está usando el CV correcto del usuario
  console.log('📄 CvViewerEnhanced cargado para:', investigadorNombre)
  console.log('🔗 CV URL:', cvUrl)

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const resetZoom = () => {
    setZoom(150)
  }

  // Renderiza el PDF con el método seleccionado
  const renderPdf = (className: string = "") => {
    if (!cvUrl) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center p-6">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No hay CV disponible</p>
            <p className="text-sm text-gray-500 mt-2">
              Sube tu CV desde el dashboard para verlo aquí
            </p>
          </div>
        </div>
      )
    }

    const commonProps = {
      className: `w-full h-full border-0 ${className}`,
      title: `CV de ${investigadorNombre || "Investigador"}`,
    }

    // Método 1: iframe con #toolbar=0 para ocultar barra de herramientas
    if (viewMode === 'iframe') {
      return (
        <iframe
          {...commonProps}
          src={`${cvUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      )
    }

    // Método 2: object tag (mejor compatibilidad con algunos navegadores)
    if (viewMode === 'object') {
      return (
        <object
          {...commonProps}
          data={`${cvUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          type="application/pdf"
        >
          <p className="p-4 text-center">
            Tu navegador no soporta la visualización de PDFs.{" "}
            <Button variant="link" onClick={handleOpenNewTab}>
              Haz clic aquí para abrirlo en una nueva pestaña
            </Button>
          </p>
        </object>
      )
    }

    // Método 3: embed tag (fallback adicional)
    return (
      <embed
        {...commonProps}
        src={`${cvUrl}#toolbar=0&navpanes=0&scrollbar=1`}
        type="application/pdf"
      />
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
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  title="Ver PDF en pantalla completa"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                  className="text-blue-700 hover:bg-blue-100"
                  title="Descargar PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Barra de Herramientas de Zoom - AGREGADA AL CARD */}
            <div className="mt-4 px-4 py-2 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">🔍 Zoom:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={zoom <= 50}
                  className="h-8 w-8 p-0"
                  title="Alejar (zoom out)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold text-blue-700 min-w-[55px] text-center bg-blue-50 px-3 py-1 rounded">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={zoom >= 200}
                  className="h-8 w-8 p-0"
                  title="Acercar (zoom in)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetZoom}
                  className="h-8 text-xs px-3"
                  title="Restablecer zoom al 150%"
                >
                  Restablecer
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Usa los controles para ajustar el tamaño del documento
              </div>
            </div>
            
            {/* PDF Viewer en la tarjeta - Vista previa */}
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-inner">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Vista previa del documento
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Haz clic en "Ver PDF" para pantalla completa
                </span>
              </div>
              <div className="p-4 overflow-auto" style={{ height: '500px' }}>
                <div 
                  className="bg-white rounded-lg overflow-hidden shadow-inner transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    width: '100%',
                    minHeight: '400px'
                  }}
                >
                  <div style={{ width: '100%', height: '400px' }}>
                    {renderPdf("rounded-lg")}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de métodos de visualización */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-xs font-medium text-blue-900">
                  Prueba los siguientes métodos en caso de no poder visualizar el PDF correctamente:
                </span>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('iframe')}
                    className={`text-xs h-7 ${viewMode === 'iframe' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-100'}`}
                  >
                    Método 1
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('object')}
                    className={`text-xs h-7 ${viewMode === 'object' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-100'}`}
                  >
                    Método 2
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('embed')}
                    className={`text-xs h-7 ${viewMode === 'embed' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-100'}`}
                  >
                    Método 3
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenNewTab}
                    className="text-xs h-7 hover:bg-blue-100"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Nueva pestaña
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dialog Modal para vista completa */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={`p-0 ${isFullscreen ? 'max-w-[98vw] h-[98vh]' : 'max-w-[95vw] h-[95vh]'}`}>
            <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl text-blue-900">Curriculum Vitae</DialogTitle>
                  {investigadorNombre && (
                    <DialogDescription className="text-blue-600 mt-1">
                      {investigadorNombre}
                    </DialogDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-blue-700 hover:bg-blue-100"
                    title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
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
                </div>
              </div>
            </DialogHeader>
            
            {/* Barra de Herramientas de Zoom - AGREGADA */}
            <div className="px-4 py-2 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">🔍 Zoom:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={zoom <= 50}
                  className="h-8 w-8 p-0"
                  title="Alejar (zoom out)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold text-blue-700 min-w-[55px] text-center bg-blue-50 px-3 py-1 rounded">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={zoom >= 200}
                  className="h-8 w-8 p-0"
                  title="Acercar (zoom in)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetZoom}
                  className="h-8 text-xs px-3"
                  title="Restablecer zoom al 150%"
                >
                  Restablecer
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Usa los controles para ajustar el tamaño del documento
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <div 
                className="bg-white rounded-lg overflow-hidden shadow-inner transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center'
                }}
              >
                {renderPdf("rounded-lg")}
              </div>
            </div>

            {/* Selector de método de visualización en el modal */}
            <div className="px-6 py-3 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
                  <span>💡 Método de visualización actual:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={viewMode === 'iframe' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('iframe')}
                      className="text-xs h-7"
                    >
                      IFrame
                    </Button>
                    <Button
                      variant={viewMode === 'object' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('object')}
                      className="text-xs h-7"
                    >
                      Object
                    </Button>
                    <Button
                      variant={viewMode === 'embed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('embed')}
                      className="text-xs h-7"
                    >
                      Embed
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-blue-600">
                  Prueba los métodos si el PDF no se visualiza correctamente
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Versión simple (botón)
  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={() => setIsDialogOpen(true)}
      >
        <Eye className="h-4 w-4" />
        Ver Curriculum Vitae
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`p-0 ${isFullscreen ? 'max-w-[98vw] h-[98vh]' : 'max-w-[95vw] h-[95vh]'}`}>
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl text-blue-900">CVU</DialogTitle>
                {investigadorNombre && (
                  <DialogDescription className="text-blue-600 mt-1">
                    {investigadorNombre}
                  </DialogDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
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
              </div>
            </div>
          </DialogHeader>
          
          {/* Barra de Herramientas de Zoom */}
          <div className="px-4 py-2 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">🔍 Zoom:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 50}
                className="h-8 w-8 p-0"
                title="Alejar (zoom out)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-blue-700 min-w-[55px] text-center bg-blue-50 px-3 py-1 rounded">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 200}
                className="h-8 w-8 p-0"
                title="Acercar (zoom in)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                className="h-8 text-xs px-3"
                title="Restablecer zoom al 100%"
              >
                Restablecer
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Usa los controles para ajustar el tamaño del documento
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-inner transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center'
              }}
            >
              {renderPdf("rounded-lg")}
            </div>
          </div>

          <div className="px-6 py-3 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
                <span>💡 Método de visualización actual:</span>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'iframe' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('iframe')}
                    className="text-xs h-7"
                  >
                    IFrame
                  </Button>
                  <Button
                    variant={viewMode === 'object' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('object')}
                    className="text-xs h-7"
                  >
                    Object
                  </Button>
                  <Button
                    variant={viewMode === 'embed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('embed')}
                    className="text-xs h-7"
                  >
                    Embed
                  </Button>
                </div>
              </div>
              <p className="text-xs text-blue-600">
                Prueba los métodos si el PDF no se visualiza correctamente
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

