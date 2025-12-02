"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState, createContext, useContext } from "react"

// Context para compartir el slug del usuario actual entre todos los InvestigadorLink
interface PerfilContextType {
  miSlug: string | null
  cargando: boolean
}

const PerfilContext = createContext<PerfilContextType>({
  miSlug: null,
  cargando: true,
})

/**
 * Provider que carga el slug del usuario autenticado una sola vez
 * y lo comparte con todos los InvestigadorLink
 */
export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [miSlug, setMiSlug] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Esperar a que Clerk termine de cargar
    if (!isLoaded) {
      return
    }

    // Si no hay usuario autenticado
    if (!user) {
      setCargando(false)
      return
    }

    const cargarMiSlug = async () => {
      try {
        const response = await fetch('/api/investigadores/perfil')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.slug) {
            setMiSlug(result.data.slug)
            console.log('✅ [PerfilProvider] Mi slug cargado:', result.data.slug)
          }
        }
      } catch (error) {
        console.error('❌ [PerfilProvider] Error cargando slug del usuario:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarMiSlug()
  }, [user, isLoaded])

  return (
    <PerfilContext.Provider value={{ miSlug, cargando }}>
      {children}
    </PerfilContext.Provider>
  )
}

interface InvestigadorLinkProps {
  slug: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

/**
 * Componente que envuelve enlaces a perfiles de investigadores.
 * Si el slug corresponde al usuario autenticado, redirige al dashboard.
 * De lo contrario, muestra el perfil público.
 */
export function InvestigadorLink({ slug, children, className, onClick }: InvestigadorLinkProps) {
  const { miSlug } = useContext(PerfilContext)
  const esMiPerfil = miSlug && miSlug === slug

  // Si es el perfil del usuario, redirigir al dashboard
  if (esMiPerfil) {
    return (
      <Link 
        href="/dashboard" 
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    )
  }

  // De lo contrario, mostrar el perfil público
  return (
    <Link 
      href={`/investigadores/${slug}`} 
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
