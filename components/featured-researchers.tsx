"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

// Interface para investigadores destacados
interface FeaturedResearcher {
  id: number
  name: string
  title: string
  institution: string
  field: string
  avatar?: string
  slug: string
}

export function FeaturedResearchers() {
  const [researchers, setResearchers] = useState<FeaturedResearcher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedResearchers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/investigadores/featured')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setResearchers(data)
      } catch (error) {
        console.error("Error fetching featured researchers:", error)
        // En caso de error, establecer array vacío para mostrar mensaje
        setResearchers([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedResearchers()
  }, [])

  return (
    <Card className="bg-white border-blue-100">
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-blue-100 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                  <div className="h-3 bg-blue-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : researchers.length > 0 ? (
          <div className="space-y-4">
            {researchers.map((researcher) => (
              <div key={researcher.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={researcher.avatar || "/placeholder.svg"} alt={researcher.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {researcher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/investigadores/${researcher.slug}`} className="hover:underline">
                      <p className="font-medium text-blue-900 hover:text-blue-700 cursor-pointer">{researcher.name}</p>
                    </Link>
                    <p className="text-sm text-blue-600">{researcher.title}</p>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                      {researcher.field}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" asChild>
                  <Link href={`/investigadores/${researcher.slug}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-blue-600">No hay investigadores aún.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
