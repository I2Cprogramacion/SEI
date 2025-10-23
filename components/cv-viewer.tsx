"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Download, ExternalLink, X } from "lucide-react"
import { Card } from "@/components/ui/card"

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
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = () => {
    // Crear un elemento <a> temporal para forzar la descarga
    const link = document.createElement('a')
    link.href = cvUrl
    link.download = `${investigadorNombre?.replace(/\s+/g, '_') || 'documento'}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenNewTab = () => {
    window.open(cvUrl, "_blank")
  }

  if (showAsCard) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all cursor-pointer">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="p-6">
              <div className="flex items-center gap-4">
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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload()
                  }}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl h-[90vh] p-0">
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
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe
                src={cvUrl}
                className="w-full h-full border-0"
                title={`CV de ${investigadorNombre || "Investigador"}`}
                style={{ minHeight: '600px' }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="gap-2">
          <FileText className="h-4 w-4" />
          Ver Perfil Único
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Perfil Único del Registro</DialogTitle>
              {investigadorNombre && (
                <DialogDescription className="mt-1">
                  {investigadorNombre} - Documento procesado automáticamente durante el registro
                </DialogDescription>
              )}
            </div>
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
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-gray-100">
          <iframe
            src={cvUrl}
            className="w-full h-full border-0"
            title={`Perfil Único de ${investigadorNombre || "Investigador"}`}
            style={{ minHeight: '600px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

