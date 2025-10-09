"use client"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { forwardRef } from "react"

interface AnimatedBadgeProps extends BadgeProps {
  interactive?: boolean
}

export const AnimatedBadge = forwardRef<HTMLDivElement, AnimatedBadgeProps>(
  ({ children, className = "", interactive = false, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        className={`
          ${className}
          ${interactive ? "badge-hover cursor-pointer" : ""}
          smooth-transition
          animate-in
          fade-in
          zoom-in-95
          duration-200
        `}
        {...props}
      >
        {children}
      </Badge>
    )
  }
)

AnimatedBadge.displayName = "AnimatedBadge"

