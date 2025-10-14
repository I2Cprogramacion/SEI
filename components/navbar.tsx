"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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
import { Menu, User, LogOut, LayoutDashboard, Search, FileText, Building2, Users, Telescope, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useUser, useClerk } from "@clerk/nextjs"


export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [fotografiaUrl, setFotografiaUrl] = useState<string | null>(null)
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()

  const handleLogout = async () => {
    await signOut();
    router.push("/iniciar-sesion");
  }

  const getDisplayName = (): string => {
    if (!user) return ""
    return user.fullName || user.primaryEmailAddress?.emailAddress || ""
  }

  // Cargar foto del investigador desde PostgreSQL
  useEffect(() => {
    const cargarFotoInvestigador = async () => {
      if (!isSignedIn || !user) return
      
      try {
        const response = await fetch("/api/investigadores/perfil")
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.fotografia_url) {
            setFotografiaUrl(result.data.fotografia_url)
          }
        }
      } catch (error) {
        console.error("Error al cargar foto del investigador:", error)
      }
    }

    cargarFotoInvestigador()
  }, [isSignedIn, user])

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
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
  }, [lastScrollY])

  return (
    <>
      <header
        className={`border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          {/* Main Navbar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src="/images/sei-logo.png"
                  alt="SEI Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base lg:text-lg text-gray-900 leading-tight">
                  Sistema Estatal de Investigadores
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">Chihuahua</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-blue-600 font-medium">
                    Explorar
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[500px] grid-cols-2 bg-white shadow-lg">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/explorar"
                            className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-6 no-underline outline-none focus:shadow-md hover:from-blue-700 hover:to-blue-900 transition-all"
                          >
                            <Search className="h-8 w-8 text-white mb-2" />
                            <div className="mb-2 text-lg font-semibold text-white">Explorar Todo</div>
                            <p className="text-sm leading-tight text-blue-100">
                              Descubre investigadores, proyectos e instituciones
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/investigadores" title="Investigadores" icon={<Users className="h-4 w-4" />}>
                        Perfiles de investigadores destacados
                      </ListItem>
                      <ListItem href="/proyectos" title="Proyectos" icon={<Telescope className="h-4 w-4" />}>
                        Proyectos de investigación activos
                      </ListItem>
                      <ListItem href="/instituciones" title="Instituciones" icon={<Building2 className="h-4 w-4" />}>
                        Universidades y centros de investigación
                      </ListItem>
                      <ListItem href="/campos" title="Campos" icon={<BookOpen className="h-4 w-4" />}>
                        Áreas de conocimiento
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/investigadores" className={cn(navigationMenuTriggerStyle(), "text-gray-700 hover:text-blue-600 font-medium")}>
                      Investigadores
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/proyectos" className={cn(navigationMenuTriggerStyle(), "text-gray-700 hover:text-blue-600 font-medium")}> 
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
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* I2C Button */}
              <Button 
                className="hidden lg:flex bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all px-4 h-10" 
                asChild
              >
                <a href="https://i2c.com.mx/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold tracking-tight">I</span>
                    <span className="text-xs font-bold relative top-[-4px]">2</span>
                    <span className="text-lg font-bold tracking-tight">C</span>
                  </div>
                </a>
              </Button>

              {/* User Menu */}
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

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white w-[300px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader className="border-b pb-4">
                    <SheetTitle className="text-left text-gray-900">Menú</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col gap-2 mt-6">
                    {/* Logo en móvil */}
                    <div className="flex items-center gap-3 px-2 mb-4">
                      <div className="relative h-8 w-8">
                        <Image
                          src="/images/sei-logo.png"
                          alt="SEI"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">SEI Chihuahua</span>
                        <span className="text-xs text-gray-500">Sistema Estatal de Investigadores</span>
                      </div>
                    </div>

                    {/* Navegación */}
                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                        <Link href="/explorar">
                          <Search className="mr-2 h-4 w-4" />
                          Explorar
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                        <Link href="/investigadores">
                          <Users className="mr-2 h-4 w-4" />
                          Investigadores
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                        <Link href="/proyectos">
                          <Telescope className="mr-2 h-4 w-4" />
                          Proyectos
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                        <Link href="/publicaciones">
                          <FileText className="mr-2 h-4 w-4" />
                          Publicaciones
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                        <Link href="/instituciones">
                          <Building2 className="mr-2 h-4 w-4" />
                          Instituciones
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                        <Link href="/campos">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Campos
                        </Link>
                      </Button>
                    </div>

                    {/* I2C Button móvil */}
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" asChild>
                      <a href="https://i2c.com.mx/" target="_blank" rel="noopener noreferrer">
                        <div className="flex items-baseline">
                          <span className="text-lg font-bold tracking-tight">I</span>
                          <span className="text-xs font-bold relative top-[-4px]">2</span>
                          <span className="text-lg font-bold tracking-tight">C</span>
                        </div>
                      </a>
                    </Button>

                    {/* User Info o Auth Buttons */}
                    {isSignedIn && user ? (
                      <div className="mt-6 pt-6 border-t space-y-2">
                        <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-gray-50">
                          <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                            <AvatarImage 
                              src={fotografiaUrl || user.imageUrl} 
                              alt={getDisplayName()} 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                              {(getDisplayName().charAt(0) || "U").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {getDisplayName()}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.primaryEmailAddress?.emailAddress}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                          <Link href="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                          <Link href="/dashboard/editar-perfil">
                            <User className="mr-2 h-4 w-4" />
                            Editar Perfil
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50" 
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar sesión
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-6 pt-6 border-t space-y-2">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100" asChild>
                          <Link href="/iniciar-sesion">Iniciar sesión</Link>
                        </Button>
                        <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" asChild>
                          <Link href="/registro">Registrarse</Link>
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
