"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState, createContext, useContext } from "react"

// Context para compartir el correo del usuario actual entre todos los InvestigadorLink
interface PerfilContextType {
  miCorreo: string | null
  cargando: boolean
}

const PerfilContext = createContext<PerfilContextType>({
  miCorreo: null,
  cargando: true,
})

/**
 * Provider que obtiene el correo del usuario autenticado una sola vez
 * y lo comparte con todos los InvestigadorLink
 */
export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [miCorreo, setMiCorreo] = useState<string | null>(null)
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

    // Obtener el correo directamente de Clerk (no necesita API)
    const email = user.emailAddresses?.[0]?.emailAddress
    if (email) {
      setMiCorreo(email.toLowerCase())
      console.log('✅ [PerfilProvider] Email del usuario:', email)
    }
    setCargando(false)
  }, [user, isLoaded])

  return (
    <PerfilContext.Provider value={{ miCorreo, cargando }}>
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
 * Si el correo del slug corresponde al usuario autenticado, redirige al dashboard.
 * De lo contrario, muestra el perfil público.
 */
export function InvestigadorLink({ slug, children, className, onClick }: InvestigadorLinkProps) {
  const { miCorreo } = useContext(PerfilContext)
  const [esMiPerfil, setEsMiPerfil] = useState(false)
  const [verificado, setVerificado] = useState(false)

  useEffect(() => {
    if (!miCorreo || !slug) {
      setVerificado(true)
      return
    }

    // Consultar el correo del perfil por su slug
    const verificarPerfil = async () => {
      try {
        const response = await fetch(`/api/investigadores/${slug}`)
        if (response.ok) {
          const data = await response.json()
          const perfilData = data.perfil || data
          const perfilEmail = perfilData.correo?.toLowerCase()
          
          if (perfilEmail === miCorreo) {
            setEsMiPerfil(true)
            console.log('✅ [InvestigadorLink] Es tu perfil, redirigirá a dashboard')
          }
        }
      } catch (error) {
        console.error('Error verificando perfil:', error)
      } finally {
        setVerificado(true)
      }
    }

    verificarPerfil()
  }, [miCorreo, slug])

  // Mientras verifica, mostrar el enlace normal
  if (!verificado) {
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
