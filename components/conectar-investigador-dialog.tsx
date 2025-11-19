"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserPlus, CheckCircle } from "lucide-react"

interface ConectarInvestigadorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investigadorId: string
  investigadorClerkId: string
  investigadorNombre: string
  onSuccess?: () => void
}

export function ConectarInvestigadorDialog({
  open,
  onOpenChange,
  investigadorId,
  investigadorClerkId,
  investigadorNombre,
  onSuccess,
}: ConectarInvestigadorDialogProps) {
  const { userId } = useAuth()
  const { toast } = useToast()
  const [mensaje, setMensaje] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleConectar = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para conectar con investigadores",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/conexiones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinatarioId: investigadorId,
          mensaje: mensaje || `Hola ${investigadorNombre}, me gustaría conectar contigo.`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Error al enviar solicitud")
      }

      setSuccess(true)
      toast({
        title: "¡Solicitud enviada!",
        description: `Se ha enviado una solicitud de conexión a ${investigadorNombre}`,
      })

      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setMensaje("")
      }, 2000)
    } catch (error) {
      console.error('Error enviando conexión:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar la solicitud. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                ¡Solicitud Enviada!
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-blue-600" />
                Conectar con {investigadorNombre}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {success
              ? `Tu solicitud de conexión ha sido enviada a ${investigadorNombre}`
              : "Envía una solicitud para conectar y colaborar con este investigador"}
          </DialogDescription>
        </DialogHeader>

        {!success && (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje personalizado (opcional)</Label>
                <Textarea
                  id="mensaje"
                  placeholder={`Hola ${investigadorNombre}, me gustaría conectar contigo...`}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Agrega un mensaje para presentarte y explicar por qué te gustaría conectar
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConectar}
                disabled={isLoading}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {success && (
          <div className="flex items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
