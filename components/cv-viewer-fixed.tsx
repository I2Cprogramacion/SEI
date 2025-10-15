"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Download, ExternalLink, AlertCircle, Loader2, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CvViewerProps {
  cvUrl: string
  investigadorNombre?: string
  triggerVariant?: "default" | "outline" | "ghost" | "link"
  showAsCard?: boolean
}

export function CvViewer({ 
  cvUrl, 
  investigadorNombre, 
  triggerVariant = "outline",
  showAsCard = false 
}: CvViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const handleOpenModal = () => {
    console.log('Abriendo modal...')
    setIsModalOpen(true)
    setIsLoading(true)
    setHasError(false)
    setUseGoogleViewer(false)
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
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se pudo cargar el PDF directamente.
              </AlertDescription>
            </Alert>
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

  const renderPdfInModal = () => {
    if (!cvUrl) return null;

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
        
        <iframe
          key={`modal-${useGoogleViewer}`}
          src={iframeUrl}
          className="w-full h-full border-0"
          title={`CV de ${investigadorNombre || "Investigador"} - Vista Completa`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    )
  }

  if (showAsCard) {
    return (
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
              {/* Botón de ojo para abrir modal */}
              <Button 
                variant="outline"
                size="sm"
                onClick={handleOpenModal}
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

        {/* Modal separado - fuera de la tarjeta */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-7xl h-[95vh] p-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl">Curriculum Vitae - Vista Completa</DialogTitle>
                  {investigadorNombre && (
                    <DialogDescription className="mt-1">
                      {investigadorNombre}
                    </DialogDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="text-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenNewTab}
                    className="text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Nueva pestaña
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {renderPdfInModal()}
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    )
  }

  // Versión simple (botón)
  return (
    <div className="space-y-2">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant={triggerVariant} className="gap-2" onClick={handleOpenModal}>
            <Eye className="h-4 w-4" />
            Ver Curriculum Vitae
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl h-[95vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Curriculum Vitae</DialogTitle>
                {investigadorNombre && (
                  <DialogDescription className="mt-1">
                    {investigadorNombre}
                  </DialogDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenNewTab}
                  className="text-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Nueva pestaña
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {renderPdfInModal()}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Botones adicionales */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="text-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </Button>
      </div>
    </div>
  )
}

