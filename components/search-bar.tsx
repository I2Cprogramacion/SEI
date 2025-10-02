"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"


export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("all")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) return

    // Redirigir a la página de búsqueda con los parámetros correspondientes
    const searchUrl = `/buscar?q=${encodeURIComponent(searchTerm)}&type=${searchType}`
    router.push(searchUrl)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar investigadores, proyectos, publicaciones..."
            className="pl-12 h-12 text-lg bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white border-blue-200 text-blue-900">
            <SelectValue placeholder="Tipo de búsqueda" />
          </SelectTrigger>
          <SelectContent className="bg-white border-blue-100">
            <SelectItem value="all">Todo</SelectItem>
            <SelectItem value="investigadores">Investigadores</SelectItem>
            <SelectItem value="proyectos">Proyectos</SelectItem>
            <SelectItem value="publicaciones">Publicaciones</SelectItem>
            <SelectItem value="instituciones">Instituciones</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="h-12 px-8 bg-blue-700 text-white hover:bg-blue-800">
          <Search className="mr-2 h-5 w-5" />
          Buscar
        </Button>
      </form>
    </div>
  )
}
