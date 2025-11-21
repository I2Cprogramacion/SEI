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
      <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-600 to-blue-700 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3" onClick={onItemClick}>
          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white block">SECCTI</span>
            <span className="text-xs text-blue-100">Panel Admin</span>
          </div>
        </Link>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto min-h-0">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
              )} />
              <span className={isActive ? "font-semibold" : ""}>{item.title}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-white"></div>
              )}
            </Link>
          )
        })}
      </div>
      <div className="p-3 border-t border-gray-200 space-y-1 bg-gray-50 flex-shrink-0">
        <Link
          href="/"
          onClick={onItemClick}
          className="flex items-center py-2.5 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
        >
          <Home className="mr-3 h-5 w-5 text-gray-500" />
          Volver al sitio
        </Link>
        <button
          onClick={() => {
            onItemClick?.()
            handleLogout()
          }}
          className="w-full flex items-center py-2.5 px-4 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
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
      <div className="md:hidden fixed top-20 left-4 z-50 shadow-lg">
        <Button
          variant="outline"
          size="icon"
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-lg h-10 w-10"
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
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm min-h-screen fixed left-0 top-16">
        <SidebarContent />
      </div>

      {/* Sidebar Móvil */}
      <div
        className={cn(
          "md:hidden fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex flex-col h-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      </div>
    </>
  )
}
