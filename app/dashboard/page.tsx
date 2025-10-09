"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, LogOut, Building, Award, FileText } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-blue-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
            <p className="text-blue-600">Bienvenido a tu panel de investigador</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        {/* Información del usuario */}
        <Card className="mb-8 bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Perfil del Investigador
            </CardTitle>
            <CardDescription className="text-blue-600">
              Información básica de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-700">Nombre completo</label>
                <p className="text-blue-900">{user.fullName || user.firstName || "Usuario"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-700">Correo electrónico</label>
                <p className="text-blue-900">{user.primaryEmailAddress?.emailAddress || "No disponible"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Mi Institución
              </CardTitle>
              <CardDescription className="text-blue-600">
                Gestiona tu información institucional
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Reconocimientos
              </CardTitle>
              <CardDescription className="text-blue-600">
                Ver tus premios y distinciones
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Publicaciones
              </CardTitle>
              <CardDescription className="text-blue-600">
                Gestiona tu producción científica
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="mt-8">
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Resumen de Actividad</CardTitle>
              <CardDescription className="text-blue-600">
                Estadísticas de tu perfil de investigador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">0</div>
                  <div className="text-sm text-blue-600">Publicaciones</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">0</div>
                  <div className="text-sm text-green-600">Proyectos</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">0</div>
                  <div className="text-sm text-purple-600">Colaboraciones</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">0</div>
                  <div className="text-sm text-orange-600">Premios</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
