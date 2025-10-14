"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Activity, UserPlus, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface UsuarioActivo {
  id: number
  nombre_completo: string
  correo: string
  ultima_actividad: string
  fotografia_url?: string
}

interface UsuariosStats {
  totalUsuarios: number
  usuariosActivos: number
  usuariosNuevosHoy: number
  usuariosNuevosSemana: number
  usuariosActivosDetalle: UsuarioActivo[]
  timestamp: string
}

export function UsuariosActivosWidget() {
  const [stats, setStats] = useState<UsuariosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/usuarios-stats')
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }
      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError('No se pudieron cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatearTiempoActividad = (fecha: string) => {
    const ahora = new Date()
    const actividad = new Date(fecha)
    const diferenciaMs = ahora.getTime() - actividad.getTime()
    const minutos = Math.floor(diferenciaMs / 60000)

    if (minutos < 1) return 'Ahora mismo'
    if (minutos === 1) return 'Hace 1 minuto'
    if (minutos < 60) return `Hace ${minutos} minutos`
    
    const horas = Math.floor(minutos / 60)
    if (horas === 1) return 'Hace 1 hora'
    return `Hace ${horas} horas`
  }

  const getIniciales = (nombre: string) => {
    const partes = nombre.split(' ')
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
    }
    return nombre.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-3 w-[120px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-4">
      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">
              Registrados en la plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Activos
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.usuariosActivos}
            </div>
            <p className="text-xs text-muted-foreground">
              Activos en los últimos 5 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevos Hoy
            </CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.usuariosNuevosHoy}
            </div>
            <p className="text-xs text-muted-foreground">
              Registrados hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Esta Semana
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.usuariosNuevosSemana}
            </div>
            <p className="text-xs text-muted-foreground">
              Nuevos en 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios activos */}
      {stats.usuariosActivos > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Usuarios Activos Ahora
              <Badge variant="secondary" className="ml-auto">
                {stats.usuariosActivos} en línea
              </Badge>
            </CardTitle>
            <CardDescription>
              Usuarios con actividad en los últimos 5 minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.usuariosActivosDetalle.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={usuario.fotografia_url} alt={usuario.nombre_completo} />
                    <AvatarFallback>{getIniciales(usuario.nombre_completo)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {usuario.nombre_completo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {usuario.correo}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                      {formatearTiempoActividad(usuario.ultima_actividad)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
