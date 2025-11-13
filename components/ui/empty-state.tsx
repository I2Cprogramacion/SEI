"use client"

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed border-2", className)}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          {/* Ícono con animación */}
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 animate-pulse">
            <Icon className="w-10 h-10 text-blue-400" />
          </div>
          
          {/* Título */}
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {title}
          </h3>
          
          {/* Descripción */}
          <p className="text-sm text-blue-600 mb-6">
            {description}
          </p>
          
          {/* Acción opcional */}
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
