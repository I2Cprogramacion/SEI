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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface EventRegistrationDialogProps {
  eventName: string
  eventId: number
  eventDate: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventRegistrationDialog({
  eventName,
  eventId,
  eventDate,
  open,
  onOpenChange,
}: EventRegistrationDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    role: "",
    participationType: "asistente",
    specialNeeds: "",
    acceptTerms: false,
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      acceptTerms: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulación de envío de registro
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mostrar notificación de éxito
      toast({
        title: "Registro completado",
        description: `Te has registrado exitosamente para el evento "${eventName}". Recibirás un correo de confirmación.`,
        variant: "default",
      })

      // Cerrar el diálogo y limpiar el formulario
      onOpenChange(false)
      setFormData({
        name: "",
        email: "",
        institution: "",
        role: "",
        participationType: "asistente",
        specialNeeds: "",
        acceptTerms: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el registro. Inténtalo de nuevo más tarde.",
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
          <DialogTitle className="text-blue-900">Inscripción a {eventName}</DialogTitle>
          <DialogDescription className="text-blue-600">
            Completa el formulario para inscribirte al evento que se realizará el {eventDate}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-blue-900">
              Nombre completo
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
              Correo electrónico
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
            <Label htmlFor="institution" className="text-blue-900">
              Institución
            </Label>
            <Input
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-blue-900">
              Cargo o rol
            </Label>
            <Input
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="participationType" className="text-blue-900">
              Tipo de participación
            </Label>
            <Select
              value={formData.participationType}
              onValueChange={(value) => handleSelectChange("participationType", value)}
            >
              <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                <SelectValue placeholder="Selecciona tipo de participación" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-100">
                <SelectItem value="asistente">Asistente</SelectItem>
                <SelectItem value="ponente">Ponente</SelectItem>
                <SelectItem value="poster">Presentación de póster</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialNeeds" className="text-blue-900">
              Necesidades especiales (opcional)
            </Label>
            <Textarea
              id="specialNeeds"
              name="specialNeeds"
              value={formData.specialNeeds}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              rows={2}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={handleCheckboxChange} required />
            <Label htmlFor="acceptTerms" className="text-blue-900 text-sm">
              Acepto los términos y condiciones del evento
            </Label>
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
            <Button
              type="submit"
              disabled={isSubmitting || !formData.acceptTerms}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              {isSubmitting ? "Procesando..." : "Completar inscripción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
