"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

interface AuthorProfile {
  nombreCompleto: string
  slug?: string
  fotografiaUrl?: string
  institucion?: string
}

interface AuthorAvatarGroupProps {
  authors: string[] | string
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  showNames?: boolean
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base"
}

export function AuthorAvatarGroup({ 
  authors, 
  maxVisible = 3,
  size = 'md',
  showNames = false
}: AuthorAvatarGroupProps) {
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, AuthorProfile>>(new Map())
  const [loading, setLoading] = useState(true)
  
  // Convertir a array si es string
  const authorArray = typeof authors === 'string' 
    ? authors.split(/[,;]/).map(a => a.trim()).filter(Boolean)
    : Array.isArray(authors) ? authors : []
  
  const visibleAuthors = authorArray.slice(0, maxVisible)
  const remainingCount = Math.max(0, authorArray.length - maxVisible)

  useEffect(() => {
    async function fetchAuthorProfiles() {
      if (authorArray.length === 0) {
        setLoading(false)
        return
      }

      try {
        const profiles = new Map<string, AuthorProfile>()
        
        await Promise.all(
          authorArray.map(async (author) => {
            try {
              const response = await fetch(`/api/buscar-investigador-por-nombre?nombre=${encodeURIComponent(author)}`)
              
              if (!response.ok) {
                console.warn(`Failed to fetch profile for ${author}`)
                profiles.set(author, { nombreCompleto: author })
                return
              }
              
              const data = await response.json()
              
              if (data.investigadores && data.investigadores.length > 0) {
                const match = data.investigadores[0]
                profiles.set(author, {
                  nombreCompleto: match.nombreCompleto,
                  slug: match.slug,
                  fotografiaUrl: match.fotografiaUrl,
                  institucion: match.institucion
                })
              } else {
                profiles.set(author, { nombreCompleto: author })
              }
            } catch (error) {
              console.warn(`Error fetching profile for ${author}:`, error)
              profiles.set(author, { nombreCompleto: author })
            }
          })
        )
        
        setAuthorProfiles(profiles)
      } catch (error) {
        console.error('Error fetching author profiles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuthorProfiles()
  }, [JSON.stringify(authorArray)])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        {[...Array(Math.min(maxVisible, authorArray.length))].map((_, i) => (
          <div 
            key={i} 
            className={`${sizeClasses[size]} rounded-full bg-blue-100 animate-pulse`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <div className="flex -space-x-2">
          {visibleAuthors.map((author, index) => {
            const profile = authorProfiles.get(author)
            const hasProfile = profile?.slug
            
            const avatarContent = (
              <Avatar className={`${sizeClasses[size]} border-2 border-white ${hasProfile ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
                <AvatarImage src={profile?.fotografiaUrl} alt={profile?.nombreCompleto || author} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {getInitials(profile?.nombreCompleto || author)}
                </AvatarFallback>
              </Avatar>
            )

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  {hasProfile ? (
                    <Link href={`/investigadores/${profile.slug}`} className="hover:scale-110 transition-transform">
                      {avatarContent}
                    </Link>
                  ) : (
                    <div>{avatarContent}</div>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-semibold">{profile?.nombreCompleto || author}</p>
                    {profile?.institucion && (
                      <p className="text-xs text-blue-600">{profile.institucion}</p>
                    )}
                    {hasProfile && (
                      <p className="text-xs text-green-600 mt-1">✓ Perfil en SEI</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
      
      {remainingCount > 0 && (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
          +{remainingCount} más
        </Badge>
      )}
      
      {showNames && visibleAuthors.length > 0 && (
        <div className="flex flex-wrap gap-1 text-xs text-blue-600">
          {visibleAuthors.map((author, index) => {
            const profile = authorProfiles.get(author)
            const hasProfile = profile?.slug
            
            return (
              <span key={index}>
                {hasProfile ? (
                  <Link 
                    href={`/investigadores/${profile.slug}`}
                    className="hover:underline font-medium text-blue-700"
                  >
                    {profile.nombreCompleto}
                  </Link>
                ) : (
                  <span>{profile?.nombreCompleto || author}</span>
                )}
                {index < visibleAuthors.length - 1 && ', '}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
