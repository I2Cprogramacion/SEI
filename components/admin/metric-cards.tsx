"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: number | string
  change?: {
    value: number
    isPositive: boolean
    label: string
  }
  icon: LucideIcon
  iconColor?: string
  description?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-blue-600",
  description
}: MetricCardProps) {
  return (
    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30`}>
          <Icon className={`h-6 w-6 text-white`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</div>
        {change && (
          <Badge 
            className={cn(
              "mt-2 text-xs font-semibold",
              change.isPositive 
                ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" 
                : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
            )}
          >
            {change.isPositive ? "+" : ""}{change.value} {change.label}
          </Badge>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface ProgressCardProps {
  title: string
  current: number
  total: number
  icon: LucideIcon
  iconColor?: string
}

export function ProgressCard({
  title,
  current,
  total,
  icon: Icon,
  iconColor = "text-blue-600"
}: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30`}>
          <Icon className={`h-6 w-6 text-white`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-3">{current.toLocaleString()}</div>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {percentage}% de {total.toLocaleString()} total
        </p>
      </CardContent>
    </Card>
  )
}

interface SimpleListCardProps {
  title: string
  items: Array<{
    label: string
    value: number | string
    color?: string
  }>
  icon: LucideIcon
  iconColor?: string
}

export function SimpleListCard({
  title,
  items,
  icon: Icon,
  iconColor = "text-blue-600"
}: SimpleListCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
              <span 
                className={`text-sm font-semibold ${item.color || 'text-foreground'}`}
              >
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
