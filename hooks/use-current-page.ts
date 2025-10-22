"use client"

import { usePathname } from "next/navigation"

export function useCurrentPage() {
  const pathname = usePathname()
  
  const getPageInfo = () => {
    // Páginas principales
    if (pathname === '/') return { name: 'Inicio', section: 'home' }
    if (pathname.startsWith('/investigadores')) return { name: 'Investigadores', section: 'investigadores' }
    if (pathname.startsWith('/proyectos')) return { name: 'Proyectos', section: 'proyectos' }
    if (pathname.startsWith('/campos')) return { name: 'Campos', section: 'campos' }
    if (pathname.startsWith('/convocatorias')) return { name: 'Convocatorias', section: 'convocatorias' }
    if (pathname.startsWith('/dashboard')) return { name: 'Dashboard', section: 'dashboard' }
    if (pathname.startsWith('/explorar')) return { name: 'Explorar', section: 'explorar' }
    if (pathname.startsWith('/buscar')) return { name: 'Buscar', section: 'buscar' }
    if (pathname.startsWith('/admin')) return { name: 'Administración', section: 'admin' }
    
    // Páginas secundarias
    if (pathname.startsWith('/registro')) return { name: 'Registro', section: 'auth' }
    if (pathname.startsWith('/iniciar-sesion')) return { name: 'Iniciar Sesión', section: 'auth' }
    if (pathname.startsWith('/terminos')) return { name: 'Términos', section: 'legal' }
    if (pathname.startsWith('/privacidad')) return { name: 'Privacidad', section: 'legal' }
    
    return { name: 'Página', section: 'other' }
  }
  
  return {
    pathname,
    ...getPageInfo()
  }
}
