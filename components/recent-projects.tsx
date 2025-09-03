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

  // TODO: Conectar con API real
  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setLoading(true)
        // const response = await fetch('/api/admin/recent-projects')
        // const data = await response.json()
        // setProjects(data)

        // Por ahora, datos vacíos
        setProjects([])
      } catch (error) {
        console.error("Error fetching recent projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProjects()
  }, [])

  return (
    <Card className="bg-white border-blue-100">
      <CardHeader>
        <CardTitle className="text-blue-900">Proyectos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                <div className="h-3 bg-blue-100 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-blue-100 rounded w-16"></div>
                  <div className="h-5 bg-blue-100 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border-b border-blue-100 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">{project.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-700 text-white text-xs">{project.category}</Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-blue-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {project.startDate}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" asChild>
                    <Link href={`/proyectos/${project.slug}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-blue-600">No hay proyectos recientes aún.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
