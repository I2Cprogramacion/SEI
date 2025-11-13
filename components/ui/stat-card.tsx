"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  value: string | number
  label: string
  icon: LucideIcon
  gradient?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({
  value,
  label,
  icon: Icon,
  gradient = "from-blue-500 to-blue-600",
  trend,
  className
}: StatCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200",
      className
    )}>
      {/* Ícono de fondo decorativo */}
      <div className="absolute right-0 top-0 w-32 h-32 opacity-10 transform rotate-12 transition-transform group-hover:rotate-6 group-hover:scale-110">
        <Icon className="w-full h-full text-blue-600" />
      </div>
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-3xl md:text-4xl font-bold text-blue-900 mt-1 transition-transform group-hover:scale-105">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium mt-2 flex items-center gap-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% este mes
              </p>
            )}
          </div>
          <div className={cn(
            "w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6",
            gradient
          )}>
            <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
