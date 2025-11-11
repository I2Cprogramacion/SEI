"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface ContactFormProps {
  recipientName: string
  recipientId: number
  recipientType: "investigador" | "proyecto" | "equipo"
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactForm({ recipientName, recipientId, recipientType, open, onOpenChange }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulación de envío de mensaje
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mostrar notificación de éxito
      toast({
        title: "Mensaje enviado",
        description: `Tu mensaje ha sido enviado a ${recipientName}.`,
        variant: "default",
      })

      // Cerrar el diálogo y limpiar el formulario
      onOpenChange(false)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border-blue-100">
        <DialogHeader>
          <DialogTitle className="text-blue-900">Contactar a {recipientName}</DialogTitle>
          <DialogDescription className="text-blue-600">
            {recipientType === "investigador"
              ? "Envía un mensaje al investigador para consultas o posibles colaboraciones."
              : recipientType === "proyecto"
                ? "Envía un mensaje al equipo del proyecto para consultas o posibles colaboraciones."
                : "Envía un mensaje al equipo para consultas o posibles colaboraciones."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-blue-900">
              Tu nombre
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-900">
              Tu correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-blue-900">
              Asunto
            </Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-blue-900">
              Mensaje
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              rows={5}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-700 text-white hover:bg-blue-800">
              {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
