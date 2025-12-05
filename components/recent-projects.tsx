"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Calendar } from "lucide-react"
import Link from "next/link"

// Interface para proyectos recientes
interface RecentProject {
  id: number
  title: string
  status: string
  category: string
  startDate: string
  slug: string
}

export function RecentProjects() {
  const [projects, setProjects] = useState<RecentProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/proyectos/recent')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error("Error fetching recent projects:", error)
        // En caso de error, establecer array vacío para mostrar mensaje
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProjects()
  }, [])

  return (
    <Card className="glass-effect card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-900">Proyectos recientes</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
            <Link href="/proyectos">Ver todos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse p-4 bg-blue-50/50 rounded-lg">
                <div className="h-5 bg-blue-100 rounded w-3/4"></div>
                <div className="h-3 bg-blue-100 rounded w-full"></div>
                <div className="h-3 bg-blue-100 rounded w-2/3"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-5 bg-blue-100 rounded w-20"></div>
                  <div className="h-5 bg-blue-100 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="border border-blue-100 rounded-lg p-4 transition-all hover:shadow-md hover:border-blue-300 bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-900 mb-3 text-base leading-tight">
                      {project.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className="bg-blue-700 text-white text-xs hover:bg-blue-800 px-2.5 py-0.5">
                        {project.category}
                      </Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs px-2.5 py-0.5">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-blue-600">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span className="font-medium">{project.startDate}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-700 hover:bg-blue-100 hover:text-blue-800 shrink-0 h-9 w-9 p-0" 
                    asChild
                  >
                    <Link href={`/proyectos/${project.slug}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-blue-50/30 rounded-lg">
            <p className="text-blue-600 text-sm">No hay proyectos recientes aún.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
