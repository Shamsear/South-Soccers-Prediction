/**
 * Team Logo Badge Component
 * 
 * Modern asymmetrical rounded badge for displaying team logos/flags
 * Features: top-left and bottom-right rounded, top-right and bottom-left sharp
 */

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface TeamLogoBadgeProps {
  src: string | null
  alt: string
  teamName: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function TeamLogoBadge({ 
  src, 
  alt, 
  teamName, 
  size = 'md',
  className 
}: TeamLogoBadgeProps) {
  const sizeClass = {
    sm: 'team-logo-badge-sm',
    md: 'team-logo-badge-md',
    lg: 'team-logo-badge-lg',
    xl: 'team-logo-badge-xl',
  }[size]

  const dimensions = {
    sm: { width: 48, height: 32 },
    md: { width: 64, height: 44 },
    lg: { width: 80, height: 56 },
    xl: { width: 100, height: 72 },
  }[size]

  return (
    <div className={cn('team-logo-badge', sizeClass, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="team-logo-badge-fallback">
          {teamName[0]}
        </span>
      )}
    </div>
  )
}
