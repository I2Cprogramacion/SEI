"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, GraduationCap, Home, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"

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
    title: "Instituciones",
    href: "/admin/instituciones",
    icon: GraduationCap,
  },
  {
    title: "Estadísticas",
    href: "/admin/estadisticas",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-blue-100 min-h-screen">
      <div className="p-4 border-b border-blue-100">
        <Link href="/admin" className="flex items-center">
          <span className="text-xl font-bold text-blue-900">SECCTI Admin</span>
        </Link>
      </div>
      <div className="flex-1 py-6 px-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
      <div className="p-4 border-t border-blue-100">
        <Link
          href="/"
          className="flex items-center py-2 px-3 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Home className="mr-3 h-5 w-5" />
          Volver al sitio
        </Link>
        <Link
          href="/logout"
          className="flex items-center py-2 px-3 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar sesión
        </Link>
      </div>
    </div>
  )
}
