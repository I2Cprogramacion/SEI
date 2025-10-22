"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm text-blue-600", className)}
    >
      <Link 
        href="/" 
        className="flex items-center hover:text-blue-800 transition-colors"
        aria-label="Ir al inicio"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-blue-400" />
          {item.current ? (
            <span 
              className="font-medium text-blue-900"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : item.href ? (
            <Link 
              href={item.href}
              className="hover:text-blue-800 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-blue-600">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
