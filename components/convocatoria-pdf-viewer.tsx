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
import { FileText, Download, ExternalLink, Smartphone } from "lucide-react"

interface ConvocatoriaPdfViewerProps {
  pdfUrl: string
  titulo: string
  triggerText?: string
  triggerVariant?: "default" | "outline" | "ghost" | "link"
}

export function ConvocatoriaPdfViewer({ 
  pdfUrl, 
  titulo,
  triggerText = "Descargar bases",
  triggerVariant = "outline"
}: ConvocatoriaPdfViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${titulo.replace(/\s+/g, '_')}_bases.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenNewTab = () => {
    window.open(pdfUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={triggerVariant} 
          className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
        >
          <FileText className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Bases de la Convocatoria</DialogTitle>
              <DialogDescription className="mt-1">
                {titulo}
              </DialogDescription>
            </div>
            {!isMobile && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenNewTab}
                  className="text-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en nueva pestaña
                </Button>
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
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isMobile ? (
            <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
              <div className="text-center space-y-2">
                <Smartphone className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Visualización en Dispositivo Móvil
                </h3>
                <p className="text-sm text-blue-600">
                  Los PDFs no se pueden mostrar directamente en dispositivos móviles.
                  Por favor, descarga el archivo o ábrelo en una nueva pestaña.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-sm">
                <Button
                  onClick={handleOpenNewTab}
                  className="w-full bg-blue-700 text-white hover:bg-blue-800"
                  size="lg"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Abrir en nueva pestaña
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={`Bases de ${titulo}`}
              style={{ minHeight: '600px' }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

