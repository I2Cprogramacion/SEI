"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface ResearcherLinkProps {
  nombre: string
  className?: string
}

interface ResearcherProfile {
  slug: string
  nombreCompleto: string
}

export function ResearcherLink({ nombre, className = "" }: ResearcherLinkProps) {
  const [profile, setProfile] = useState<ResearcherProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!nombre || nombre.trim() === '') {
      setLoading(false)
      return
    }

    const buscarInvestigador = async () => {
      try {
        const response = await fetch(`/api/buscar-investigador-por-nombre?nombre=${encodeURIComponent(nombre)}`)
        if (!response.ok) {
          setLoading(false)
          return
        }

        const data = await response.json()
        if (data.investigadores && data.investigadores.length > 0) {
          const investigador = data.investigadores[0]
          setProfile({
            slug: investigador.slug,
            nombreCompleto: investigador.nombreCompleto
          })
        }
      } catch (error) {
        console.warn(`Error al buscar investigador "${nombre}":`, error)
      } finally {
        setLoading(false)
      }
    }

    buscarInvestigador()
  }, [nombre])

  if (loading) {
    return <span className={className}>{nombre}</span>
  }

  if (profile?.slug) {
    return (
      <Link 
        href={`/investigadores/${profile.slug}`}
        className={`text-blue-600 hover:text-blue-800 hover:underline ${className}`}
      >
        {profile.nombreCompleto || nombre}
      </Link>
    )
  }

  return <span className={className}>{nombre}</span>
}

