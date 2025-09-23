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
import { Checkbox } from "@/components/ui/checkbox"

interface JoinNetworkDialogProps {
  networkName: string
  networkId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinNetworkDialog({ networkName, networkId, open, onOpenChange }: JoinNetworkDialogProps) {
  const [formData, setFormData] = useState({
    institution: "",
    position: "",
    researchArea: "",
    motivation: "",
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
      // Simulación de envío de solicitud
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mostrar notificación de éxito
      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud para unirte a la red "${networkName}" ha sido enviada. Te contactaremos pronto.`,
        variant: "default",
      })

      // Cerrar el diálogo y limpiar el formulario
      onOpenChange(false)
      setFormData({
        institution: "",
        position: "",
        researchArea: "",
        motivation: "",
        acceptTerms: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo más tarde.",
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
          <DialogTitle className="text-blue-900">Unirse a {networkName}</DialogTitle>
          <DialogDescription className="text-blue-600">
            Completa el formulario para solicitar unirte a esta red de colaboración.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="position" className="text-blue-900">
              Cargo o posición
            </Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="researchArea" className="text-blue-900">
              Área de investigación
            </Label>
            <Input
              id="researchArea"
              name="researchArea"
              value={formData.researchArea}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivation" className="text-blue-900">
              Motivación para unirse
            </Label>
            <Textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              className="bg-white border-blue-200 text-blue-900"
              rows={3}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={handleCheckboxChange} required />
            <Label htmlFor="acceptTerms" className="text-blue-900 text-sm">
              Acepto los términos y condiciones de la red de colaboración
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
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
