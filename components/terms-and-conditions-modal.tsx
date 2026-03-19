'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TERMS_AND_CONDITIONS } from '@/constants/terms-and-conditions'

interface TermsAndConditionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  onDecline: () => void
  isLoading?: boolean
}

/**
 * Modal para Términos y Condiciones
 * 
 * ARQUITECTURA:
 * - Contenido centralizado en constants/terms-and-conditions.ts
 * - Validación de aceptación requerida
 * - Tracking de compliance
 * - No permite cerrar sin aceptar o declinar explícitamente
 */
export function TermsAndConditionsModal({
  open,
  onOpenChange,
  onAccept,
  onDecline,
  isLoading = false
}: TermsAndConditionsModalProps) {
  const [accepted, setAccepted] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  // ============================================
  // Detector de scroll - solo activar botón cuando lea todo
  // ============================================
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const isAtBottom =
      Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50

    setScrolledToBottom(isAtBottom)
  }

  // ============================================
  // Handler - Aceptar T&C
  // ============================================
  const handleAccept = () => {
    if (!accepted) return

    console.log(`✅ [REGISTRO] Usuario aceptó Términos y Condiciones`)
    console.log(`   - Versión: ${TERMS_AND_CONDITIONS.version}`)
    console.log(`   - Timestamp: ${new Date().toISOString()}`)

    onAccept()
  }

  // ============================================
  // Handler - Rechazar T&C
  // ============================================
  const handleDecline = () => {
    console.log(`❌ [REGISTRO] Usuario rechazó Términos y Condiciones`)
    setAccepted(false)
    onDecline()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            Términos y Condiciones
          </DialogTitle>
          <DialogDescription>
            Por favor, lee detenidamente nuestros términos antes de continuar
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>Versión {TERMS_AND_CONDITIONS.version}</span>
            <span>•</span>
            <span>Actualizado: {TERMS_AND_CONDITIONS.lastUpdated}</span>
          </div>
        </DialogHeader>

        {/* Content - Scrollable with proper height */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
          onScroll={handleScroll}
        >
          <div className="space-y-4 pr-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {TERMS_AND_CONDITIONS.content}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t px-6 py-4 space-y-4 bg-muted/30 flex-shrink-0">
          {/* Alert si no ha leído todo */}
          {!scrolledToBottom && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Por favor, desplázate hasta el final para aceptar los términos
              </AlertDescription>
            </Alert>
          )}

          {/* Checkbox - Acceptance */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              disabled={!scrolledToBottom || isLoading}
              className="h-5 w-5 border-2 border-gray-400"
            />
            <Label htmlFor="accept-terms" className="text-sm cursor-pointer">
              Acepto los Términos y Condiciones y he leído toda la información
            </Label>
          </div>

          {/* Success message */}
          {accepted && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Listo para continuar con el registro</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isLoading}
              className="px-6 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-200"
            >
              Rechazar
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!accepted || !scrolledToBottom || isLoading}
              className="px-6 bg-green-600 hover:bg-green-700 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400"
            >
              {isLoading ? 'Procesando...' : 'Aceptar y Continuar'}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Debes aceptar los términos para usar la plataforma
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
