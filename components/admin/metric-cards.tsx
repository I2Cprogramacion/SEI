"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {change && (
          <Badge 
            variant={change.isPositive ? "default" : "secondary"}
            className="mt-2"
          >
            {change.isPositive ? "+" : ""}{change.value}% {change.label}
          </Badge>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{current.toLocaleString()}</div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
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
