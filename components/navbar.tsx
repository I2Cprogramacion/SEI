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
import { Menu, User, LogOut, LayoutDashboard } from "lucide-react"
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
                    <NavigationMenuLink asChild>
                      <Link href="/proyectos" className={cn(navigationMenuTriggerStyle(), "text-blue-700")}> 
                        Proyectos
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/publicaciones" className={cn(navigationMenuTriggerStyle(), "text-blue-700")}> 
                        Publicaciones
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/instituciones" className={cn(navigationMenuTriggerStyle(), "text-blue-700")}> 
                        Instituciones
                      </Link>
                    </NavigationMenuLink>
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
              {isSignedIn && user ? (
                <>
                  {/* Desktop: Dropdown Menu con Avatar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="hidden md:flex items-center gap-2 hover:bg-blue-50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={fotografiaUrl || user.imageUrl} 
                            alt={getDisplayName()} 
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {(getDisplayName().charAt(0) || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-blue-900 max-w-[120px] truncate">
                          {getDisplayName()}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-blue-900">{getDisplayName()}</p>
                          <p className="text-xs text-blue-600">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/dashboard/editar-perfil")} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Editar Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
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
                <SheetContent side="right" className="bg-white text-blue-900 border-blue-100">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menú de Navegación</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-6">
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
                      {isSignedIn && user ? (
                        <>
                          <div className="flex items-center gap-3 px-1 py-2 border-t border-b border-blue-100">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.imageUrl} alt={getDisplayName()} />
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {(getDisplayName().charAt(0) || "U").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-blue-900 truncate" title={getDisplayName()}>
                                {getDisplayName()}
                              </div>
                              <div className="text-xs text-blue-600 truncate">
                                {user.primaryEmailAddress?.emailAddress}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                            <Link href="/dashboard">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              Dashboard
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="justify-start text-blue-700 hover:bg-blue-50 h-9 sm:h-10" asChild>
                            <Link href="/dashboard/editar-perfil">
                              <User className="mr-2 h-4 w-4" />
                              Editar Perfil
                            </Link>
                          </Button>
                          <Button variant="outline" className="justify-start border-red-200 text-red-600 hover:bg-red-50 h-9 sm:h-10" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
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
