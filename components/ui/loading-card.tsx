"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoadingCardProps {
  variant?: 'default' | 'profile' | 'list'
  className?: string
}

export function LoadingCard({ variant = 'default', className }: LoadingCardProps) {
  if (variant === 'profile') {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-blue-100 rounded w-3/4"></div>
              <div className="h-3 bg-blue-50 rounded w-1/2"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 bg-blue-50 rounded"></div>
            <div className="h-3 bg-blue-50 rounded w-5/6"></div>
            <div className="h-3 bg-blue-50 rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                  <div className="h-3 bg-blue-50 rounded w-full"></div>
                  <div className="h-3 bg-blue-50 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader>
        <div className="h-4 bg-blue-100 rounded w-3/4"></div>
        <div className="h-3 bg-blue-50 rounded w-1/2 mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 bg-blue-50 rounded"></div>
          <div className="h-3 bg-blue-50 rounded w-5/6"></div>
          <div className="h-3 bg-blue-50 rounded w-4/6"></div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para texto que está cargando
export function LoadingText({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 bg-blue-100 rounded animate-pulse", className)} />
  )
}

// Componente para avatar que está cargando
export function LoadingAvatar({ className }: { className?: string }) {
  return (
    <div className={cn("w-10 h-10 bg-blue-100 rounded-full animate-pulse", className)} />
  )
}
