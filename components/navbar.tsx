"use client"

import React from "react"
import { useEffect } from "react"
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
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [user, setUser] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Función para cargar usuario desde localStorage
    const loadUser = () => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem("user") : null
        if (stored) {
          const parsed = JSON.parse(stored)
          setUser(parsed)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }

    // Cargar usuario inicialmente
    loadUser()

    // Listener para cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUser()
      }
    }

    // Listener para cambios en la misma pestaña (cuando se actualiza localStorage desde el mismo tab)
    const handleCustomStorageChange = () => {
      loadUser()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('userUpdated', handleCustomStorageChange)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('userUpdated', handleCustomStorageChange)
      }
    }
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem("user")
      // Disparar evento personalizado para notificar el cambio
      window.dispatchEvent(new CustomEvent('userUpdated'))
    } catch {}
    setUser(null)
    router.push("/iniciar-sesion")
  }

  const getDisplayName = (): string => {
    const fullName = user?.nombre || user?.nombreCompleto
    const email = user?.email
    if (fullName && fullName.length <= 35) return fullName
    return email || ""
  }

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down and past 100px
          setIsVisible(false)
        } else {
          // Scrolling up
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
      <div className="pt-[60px] sm:pt-[65px] lg:pt-[73px]">
        <header
          className={`border-b border-blue-100 fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center gap-1 sm:gap-2">
                <div className="relative h-8 w-8 sm:h-10 sm:w-10">
                  <Image
                    src="/images/sei-logo.png"
                    alt="Sistema Estatal de Investigadores Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-sm sm:text-lg text-gray-800 hidden sm:inline">
                  Sistema Estatal de Investigadores
                </span>
                <span className="font-bold text-sm sm:text-lg text-gray-800 sm:hidden">SEI</span>
              </Link>

              <NavigationMenu className="hidden md:flex ml-4">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-blue-700">Explorar</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2 bg-white">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-gray-50 to-gray-100 p-6 no-underline outline-none focus:shadow-md"
                              href="/explorar"
                            >
                              <div className="mb-2 mt-4 text-lg font-medium text-blue-900">Explorar</div>
                              <p className="text-sm leading-tight text-blue-600">
                                Descubre investigadores, proyectos e instituciones en Chihuahua.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <ListItem href="/investigadores" title="Investigadores">
                          Explora perfiles de investigadores destacados.
                        </ListItem>
                        <ListItem href="/proyectos" title="Proyectos">
                          Descubre los últimos proyectos de investigación.
                        </ListItem>
                        <ListItem href="/instituciones" title="Instituciones">
                          Explora universidades y centros de investigación.
                        </ListItem>
                        <ListItem href="/campos" title="Campos de estudio">
                          Navega por diferentes áreas de conocimiento.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/proyectos" legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-blue-700")}>
                        Proyectos
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/publicaciones" legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-blue-700")}>
                        Publicaciones
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button className="hidden lg:flex bg-blue-700 text-white hover:bg-blue-800 px-2 sm:px-3 py-1 h-8 sm:h-9" asChild>
                <a href="https://i2c.com.mx/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <div className="flex items-baseline">
                    <span className="text-sm sm:text-lg font-bold tracking-tight">I</span>
                    <span className="text-xs font-bold relative top-[-5px]">2</span>
                    <span className="text-sm sm:text-lg font-bold tracking-tight">C</span>
                  </div>
                </a>
              </Button>
              {user ? (
                <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                  <div className="flex items-center gap-1 xl:gap-2">
                    <span className="max-w-[180px] xl:max-w-[260px] truncate text-blue-900 font-medium text-sm xl:text-base" title={getDisplayName()}>
                      {getDisplayName()}
                    </span>
                    {user.isAdmin && (
                      <span className="px-1.5 xl:px-2 py-0.5 xl:py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                        ADMIN
                      </span>
                    )}
                  </div>
                  {user.isAdmin && (
                    <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 hidden xl:flex" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleLogout}>
                    <span className="hidden xl:inline">Cerrar sesión</span>
                    <span className="xl:hidden">Salir</span>
                  </Button>
                </div>
              ) : (
                <div className="hidden lg:flex gap-1 xl:gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50">
                    <Link href="/iniciar-sesion">
                      <span className="hidden xl:inline">Iniciar sesión</span>
                      <span className="xl:hidden">Entrar</span>
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="bg-blue-700 text-white hover:bg-blue-800">
                    <Link href="/registro">
                      <span className="hidden xl:inline">Registrarse</span>
                      <span className="xl:hidden">Registro</span>
                    </Link>
                  </Button>
                </div>
              )}

              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-blue-700 hover:bg-blue-50 h-8 w-8 sm:h-9 sm:w-9">
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white text-blue-900 border-blue-100 w-80 sm:w-96">
                  <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 sm:h-8 sm:w-8">
                        <Image
                          src="/images/sei-logo.png"
                          alt="Sistema Estatal de Investigadores Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold text-sm sm:text-lg">Sistema Estatal de Investigadores</span>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                        <Link href="/explorar">Explorar</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                        <Link href="/investigadores">Investigadores</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                        <Link href="/proyectos">Proyectos</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                        <Link href="/publicaciones">Publicaciones</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                        <Link href="/instituciones">Instituciones</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                        <Link href="/campos">Campos</Link>
                      </Button>
                      <Button size="sm" className="justify-start bg-blue-700 text-white hover:bg-blue-800 h-9 sm:h-10" asChild>
                        <a
                          href="https://i2c.com.mx/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <div className="flex items-baseline">
                            <span className="text-sm sm:text-lg font-bold tracking-tight">I</span>
                            <span className="text-xs font-bold relative top-[-5px]">2</span>
                            <span className="text-sm sm:text-lg font-bold tracking-tight">C</span>
                          </div>
                        </a>
                      </Button>
                      {user ? (
                        <>
                          <div className="flex items-center gap-2 px-1 py-2">
                            <div className="text-blue-900 font-medium truncate text-sm" title={getDisplayName()}>
                              {getDisplayName()}
                            </div>
                            {user.isAdmin && (
                              <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                                ADMIN
                              </span>
                            )}
                          </div>
                          {user.isAdmin && (
                            <Button variant="ghost" size="sm" className="justify-start text-green-700 hover:bg-green-50 h-9 sm:h-10" asChild>
                              <Link href="/dashboard">Dashboard</Link>
                            </Button>
                          )}
                          <Button size="sm" className="mt-2 bg-blue-700 text-white hover:bg-blue-800 justify-start h-9 sm:h-10" onClick={handleLogout}>
                            Cerrar sesión
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                            <Link href="/iniciar-sesion">Iniciar sesión</Link>
                          </Button>
                          <Button size="sm" className="mt-2 bg-blue-700 text-white hover:bg-blue-800 h-9 sm:h-10" asChild>
                            <Link href="/registro">Registrarse</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      </div>
    </>
  )
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 text-blue-900",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-blue-600">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"
