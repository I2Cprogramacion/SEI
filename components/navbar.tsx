"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Menu, User, LogOut, LayoutDashboard, FileText, Building2, Users, Telescope, BookOpen, Search, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useUser, useClerk } from "@clerk/nextjs"
import { useCurrentPage } from "@/hooks/use-current-page"


export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [fotografiaUrl, setFotografiaUrl] = useState<string | null>(null)
  const [nombreCompleto, setNombreCompleto] = useState<string | null>(null)
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0)
  const [conexionesPendientes, setConexionesPendientes] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEvaluador, setIsEvaluador] = useState(false)
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { name: currentPageName, section: currentSection } = useCurrentPage()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut();
    router.push("/iniciar-sesion");
  }

  const getDisplayName = (): string => {
    if (!user) return ""
    // Priorizar nombre completo del perfil de investigador
    if (nombreCompleto) return nombreCompleto
    // Luego el nombre completo de Clerk
    if (user.fullName) return user.fullName
    // Finalmente el correo como fallback
    return user.primaryEmailAddress?.emailAddress || ""
  }

  // Cargar contadores de notificaciones
  useEffect(() => {
    if (isSignedIn) {
      const cargarContadores = async () => {
        // Intentar cargar mensajes no leídos - fallar silenciosamente si no existe la tabla
        try {
          const mensajesRes = await fetch("/api/mensajes/no-leidos")
          if (mensajesRes.ok) {
            const data = await mensajesRes.json()
            setMensajesNoLeidos(data.count || 0)
          }
        } catch (mensajesError) {
          // Tabla mensajes no existe aún - no mostrar error
          setMensajesNoLeidos(0)
        }

        // Intentar cargar conexiones pendientes - fallar silenciosamente si no existe la tabla
        try {
          const conexionesRes = await fetch("/api/conexiones/pendientes")
          if (conexionesRes.ok) {
            const data = await conexionesRes.json()
            setConexionesPendientes(data.count || 0)
          }
        } catch (conexionesError) {
          // Tabla conexiones no existe aún - no mostrar error
          setConexionesPendientes(0)
        }
      }

      cargarContadores()
      // Recargar cada 30 segundos
      const interval = setInterval(cargarContadores, 30000)
      return () => clearInterval(interval)
    }
  }, [isSignedIn])

  // Cargar foto del investigador y verificar si es admin desde PostgreSQL
  useEffect(() => {
    const cargarDatosInvestigador = async () => {
      if (!isSignedIn || !user) return
      
      try {
        const response = await fetch("/api/investigadores/perfil")
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            if (result.data.fotografia_url) {
              setFotografiaUrl(result.data.fotografia_url)
            }
            if (result.data.nombre_completo || result.data.nombreCompleto) {
              setNombreCompleto(result.data.nombre_completo || result.data.nombreCompleto)
            }
            if (result.data.es_admin) {
              setIsAdmin(true)
            }
            if (result.data.es_evaluador) {
              setIsEvaluador(true)
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del investigador:", error)
      }
    }

    cargarDatosInvestigador()
  }, [isSignedIn, user])

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        // Siempre mantener navbar visible en rutas de admin
        if (pathname?.startsWith('/admin')) {
          setIsVisible(true)
          return
        }
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar)
      return () => {
        window.removeEventListener("scroll", controlNavbar)
      }
    }
  }, [lastScrollY, pathname])

  return (
    <>
      <header
        className={`border-b border-blue-100 shadow-md fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          {/* Main Navbar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity">
              <div className="relative h-8 w-8 lg:h-10 lg:w-10 flex-shrink-0">
                <Image
                  src="/images/IIC_logo_letras-removebg-preview.png"
                  alt="SEI Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm lg:text-lg text-gray-900 leading-tight">
                  Sistema Estatal de Investigadores
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">Chihuahua</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/investigadores" 
                      className={cn(
                        navigationMenuTriggerStyle(), 
                        "text-gray-700 hover:text-blue-600 font-medium",
                        currentSection === 'investigadores' && "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    > 
                      Investigadores
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/proyectos" 
                      className={cn(
                        navigationMenuTriggerStyle(), 
                        "text-gray-700 hover:text-blue-600 font-medium",
                        currentSection === 'proyectos' && "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    > 
                      Proyectos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/publicaciones" className={cn(navigationMenuTriggerStyle(), "text-gray-700 hover:text-blue-600 font-medium")}> 
                      Publicaciones
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/instituciones"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-gray-700 hover:text-blue-600 font-medium",
                        currentSection === 'instituciones' && "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      Instituciones
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Explorar Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                asChild
              >
                <Link href="/explorar">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Explorar</span>
                </Link>
              </Button>

              {/* Admin Button - Visible para admins (prioridad sobre evaluador) */}
              {isSignedIn && isAdmin && (
                <Button 
                  className="hidden lg:flex bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all px-4 h-10 gap-2" 
                  asChild
                >
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-semibold">Admin</span>
                  </Link>
                </Button>
              )}

              {/* Evaluador Button - Solo visible para evaluadores que NO sean admin */}
              {isSignedIn && isEvaluador && !isAdmin && (
                <Button 
                  className="hidden lg:flex bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all px-4 h-10 gap-2" 
                  asChild
                >
                  <Link href="/admin">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold">Evaluador</span>
                  </Link>
                </Button>
              )}

              {/* IIC Button */}
              <Button 
                className="hidden lg:flex bg-purple-500 text-white hover:bg-purple-600 shadow-md hover:shadow-lg transition-all px-4 h-10" 
                asChild
              >
                <a href="https://i2c.com.mx/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold tracking-tight">I</span>
                    <span className="text-lg font-bold tracking-tight">I</span>
                    <span className="text-lg font-bold tracking-tight">C</span>
                  </div>
                </a>
              </Button>

              {/* Desktop User Menu */}
              {isSignedIn && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden md:flex items-center gap-2 hover:bg-gray-100 h-10 px-3">
                      <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                        <AvatarImage 
                          src={fotografiaUrl || user.imageUrl} 
                          alt={getDisplayName()} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold">
                          {(getDisplayName().charAt(0) || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {getDisplayName()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-gray-900">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/editar-perfil")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Editar Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/mensajes")} className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Mensajes</span>
                      {mensajesNoLeidos > 0 && (
                        <Badge className="ml-auto bg-orange-500 text-white">
                          {mensajesNoLeidos}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/conexiones")} className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Conexiones</span>
                      {conexionesPendientes > 0 && (
                        <Badge className="ml-auto bg-blue-500 text-white">
                          {conexionesPendientes}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden lg:flex gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:bg-gray-100 font-medium">
                    <Link href="/iniciar-sesion">Iniciar sesión</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all font-medium">
                    <Link href="/registro">Registrarse</Link>
                  </Button>
                </div>
              )}

              {/* Mobile User Avatar - Mostrar a la derecha en móvil cuando está autenticado */}
              {isSignedIn && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100">
                      <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                        <AvatarImage 
                          src={fotografiaUrl || user.imageUrl} 
                          alt={getDisplayName()} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-semibold">
                          {(getDisplayName().charAt(0) || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/editar-perfil")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Editar Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/mensajes")} className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Mensajes</span>
                      {mensajesNoLeidos > 0 && (
                        <Badge className="ml-auto bg-orange-500 text-white text-xs">
                          {mensajesNoLeidos}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/conexiones")} className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Conexiones</span>
                      {conexionesPendientes > 0 && (
                        <Badge className="ml-auto bg-blue-500 text-white text-xs">
                          {conexionesPendientes}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="bg-white w-[320px] sm:w-[400px] flex flex-col h-full overflow-hidden"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <SheetHeader className="border-b pb-4 mb-6 flex-shrink-0">
                    <SheetTitle className="text-left text-gray-900 font-bold text-lg">Menú</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col gap-6 overflow-y-auto flex-1 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {/* Navegación Principal */}
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Navegación</h3>
                      <Button 
                        variant="ghost" 
                        size="default" 
                        className={cn(
                          "w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium h-11 rounded-lg",
                          currentSection === 'explorar' && "bg-blue-50 text-blue-700"
                        )}
                        asChild
                      >
                        <Link href="/explorar" onClick={() => setMobileMenuOpen(false)}>
                          <Search className="mr-3 h-5 w-5" />
                          Explorar
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="default" 
                        className={cn(
                          "w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium h-11 rounded-lg",
                          currentSection === 'investigadores' && "bg-blue-50 text-blue-700"
                        )}
                        asChild
                      >
                        <Link href="/investigadores" onClick={() => setMobileMenuOpen(false)}>
                          <Users className="mr-3 h-5 w-5" />
                          Investigadores
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="default" 
                        className={cn(
                          "w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium h-11 rounded-lg",
                          currentSection === 'proyectos' && "bg-blue-50 text-blue-700"
                        )}
                        asChild
                      >
                        <Link href="/proyectos" onClick={() => setMobileMenuOpen(false)}>
                          <Telescope className="mr-3 h-5 w-5" />
                          Proyectos
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="default" 
                        className={cn(
                          "w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium h-11 rounded-lg",
                          currentSection === 'publicaciones' && "bg-blue-50 text-blue-700"
                        )}
                        asChild
                      >
                        <Link href="/publicaciones" onClick={() => setMobileMenuOpen(false)}>
                          <FileText className="mr-3 h-5 w-5" />
                          Publicaciones
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="default" 
                        className={cn(
                          "w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium h-11 rounded-lg",
                          currentSection === 'instituciones' && "bg-blue-50 text-blue-700"
                        )}
                        asChild
                      >
                        <Link href="/instituciones" onClick={() => setMobileMenuOpen(false)}>
                          <Building2 className="mr-3 h-5 w-5" />
                          Instituciones
                        </Link>
                      </Button>
                    </div>

                    {/* Enlaces Externos */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Enlaces</h3>
                      
                      {/* Admin Button móvil - Visible para admins (prioridad sobre evaluador) */}
                      {isSignedIn && isAdmin && (
                        <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md h-11 font-medium rounded-lg" asChild>
                          <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                            <LayoutDashboard className="mr-3 h-5 w-5" />
                            Panel de Administración
                          </Link>
                        </Button>
                      )}

                      {/* Evaluador Button móvil - Solo visible para evaluadores que NO sean admin */}
                      {isSignedIn && isEvaluador && !isAdmin && (
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md h-11 font-medium rounded-lg" asChild>
                          <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                            <Shield className="mr-3 h-5 w-5" />
                            Panel de Evaluador
                          </Link>
                        </Button>
                      )}

                      {/* IIC Button móvil */}
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md h-11 font-medium rounded-lg" asChild>
                        <a href="https://i2c.com.mx/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <div className="flex items-baseline">
                            <span className="text-xl font-bold tracking-tight">I</span>
                            <span className="text-xl font-bold tracking-tight">I</span>
                            <span className="text-xl font-bold tracking-tight">C</span>
                          </div>
                        </a>
                      </Button>
                    </div>

                    {/* User Info o Auth Buttons */}
                    {!isSignedIn && !user && (
                      <div className="pt-4 border-t space-y-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Cuenta</h3>
                        <Button 
                          variant="outline" 
                          size="default" 
                          className="w-full justify-center text-gray-700 hover:bg-gray-100 border-gray-300 h-11 font-medium rounded-lg" 
                          asChild
                        >
                          <Link href="/iniciar-sesion" onClick={() => setMobileMenuOpen(false)}>
                            <User className="mr-2 h-5 w-5" />
                            Iniciar sesión
                          </Link>
                        </Button>
                        <Button 
                          size="default" 
                          className="w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md h-11 font-medium rounded-lg" 
                          asChild
                        >
                          <Link href="/registro" onClick={() => setMobileMenuOpen(false)}>
                            Registrarse
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">, 
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 border border-transparent hover:border-gray-200",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-semibold leading-none text-gray-900">
            {icon && <span className="text-blue-600">{icon}</span>}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-600">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
