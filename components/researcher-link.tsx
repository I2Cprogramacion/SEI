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
        console.log(`🔍 [ResearcherLink] Buscando investigador: "${nombre}"`)
        const response = await fetch(`/api/buscar-investigador-por-nombre?nombre=${encodeURIComponent(nombre.trim())}`)
        if (!response.ok) {
          console.log(`⚠️ [ResearcherLink] Respuesta no OK para "${nombre}"`)
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log(`📦 [ResearcherLink] Datos recibidos para "${nombre}":`, data)
        if (data.investigadores && data.investigadores.length > 0) {
          const investigador = data.investigadores[0]
          console.log(`✅ [ResearcherLink] Investigador encontrado:`, investigador)
          if (investigador.slug) {
            setProfile({
              slug: investigador.slug,
              nombreCompleto: investigador.nombreCompleto || nombre
            })
          }
        } else {
          console.log(`❌ [ResearcherLink] No se encontró investigador para "${nombre}"`)
        }
      } catch (error) {
        console.warn(`❌ [ResearcherLink] Error al buscar investigador "${nombre}":`, error)
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
        className={`text-blue-600 hover:text-blue-800 hover:underline cursor-pointer ${className}`}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {profile.nombreCompleto || nombre}
      </Link>
    )
  }

  return <span className={className}>{nombre}</span>
}

