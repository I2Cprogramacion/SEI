"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, GraduationCap, Home, LayoutDashboard, LogOut, Users, Award, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Investigadores",
    href: "/admin/investigadores",
    icon: Users,
  },
  {
    title: "Proyectos",
    href: "/admin/proyectos",
    icon: FileText,
  },
  {
    title: "Publicaciones",
    href: "/admin/publicaciones",
    icon: Award,
  },
  {
    title: "Instituciones",
    href: "/admin/instituciones",
    icon: GraduationCap,
  },
  {
    title: "Estadísticas",
    href: "/admin/estadisticas",
    icon: BarChart3,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/iniciar-sesion")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <div className="p-4 border-b border-blue-100">
        <Link href="/admin" className="flex items-center" onClick={onItemClick}>
          <span className="text-xl font-bold text-blue-900">SECCTI Admin</span>
        </Link>
      </div>
      <div className="flex-1 py-6 px-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
              pathname === item.href ? "bg-blue-700 text-white" : "text-blue-700 hover:bg-blue-50",
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-blue-100 space-y-1">
        <Link
          href="/"
          onClick={onItemClick}
          className="flex items-center py-2 px-3 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Home className="mr-3 h-5 w-5" />
          Volver al sitio
        </Link>
        <button
          onClick={() => {
            onItemClick?.()
            handleLogout()
          }}
          className="w-full flex items-center py-2 px-3 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Botón de menú móvil */}
      <div className="md:hidden fixed top-4 left-4 z-50 shadow-lg">
        <Button
          variant="outline"
          size="icon"
          className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 h-10 w-10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay móvil */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-blue-100 min-h-screen fixed left-0 top-0">
        <SidebarContent />
      </div>

      {/* Sidebar Móvil */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-blue-100 transform transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
      </div>

      {/* Espaciador para contenido cuando sidebar está fijo */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  )
}
