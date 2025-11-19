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
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageCircle, Send, CheckCircle, AlertCircle } from "lucide-react"

interface EnviarMensajeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investigadorId: string
  investigadorClerkId: string
  investigadorNombre: string
  investigadorEmail: string
}

export function EnviarMensajeDialog({
  open,
  onOpenChange,
  investigadorId,
  investigadorClerkId,
  investigadorNombre,
  investigadorEmail,
}: EnviarMensajeDialogProps) {
  const { userId } = useAuth()
  const { toast } = useToast()
  const [asunto, setAsunto] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleEnviar = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para enviar mensajes",
        variant: "destructive",
      })
      return
    }

    if (!asunto.trim() || !mensaje.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa el asunto y el mensaje",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/mensajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinatarioId: investigadorId,
          asunto,
          mensaje,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar mensaje")
      }

      setSuccess(true)
      toast({
        title: "¡Mensaje enviado!",
        description: `Tu mensaje ha sido enviado a ${investigadorNombre}`,
      })

      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setAsunto("")
        setMensaje("")
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                ¡Mensaje Enviado!
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Enviar mensaje a {investigadorNombre}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {success
              ? `Tu mensaje ha sido enviado exitosamente`
              : "Escribe tu mensaje y se enviará a su correo"}
          </DialogDescription>
        </DialogHeader>

        {!success && (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="destinatario">Para:</Label>
                <Input
                  id="destinatario"
                  value={`${investigadorNombre} (${investigadorEmail})`}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asunto">Asunto *</Label>
                <Input
                  id="asunto"
                  placeholder="Asunto del mensaje"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje *</Label>
                <Textarea
                  id="mensaje"
                  placeholder="Escribe tu mensaje aquí..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  El mensaje se enviará al correo del investigador
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
                onClick={handleEnviar}
                disabled={isLoading || !asunto.trim() || !mensaje.trim()}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {success && (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
            <p className="text-center text-muted-foreground">
              Tu mensaje ha sido enviado a {investigadorEmail}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
