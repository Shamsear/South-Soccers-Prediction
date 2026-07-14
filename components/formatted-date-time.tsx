'use client'

/**
 * Formatted Date Time Component
 * 
 * Safely handles timezone conversions on the client side
 * while preventing Next.js hydration mismatches.
 */

import { useEffect, useState } from 'react'

interface FormattedDateTimeProps {
  isoString: string
  mode?: 'full' | 'date' | 'time' | 'custom' | 'short-date'
  customOptions?: Intl.DateTimeFormatOptions
  className?: string
}

export function FormattedDateTime({
  isoString,
  mode = 'full',
  customOptions,
  className
}: FormattedDateTimeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isoString) return null

  const date = new Date(isoString)

  let options: Intl.DateTimeFormatOptions = {}

  if (mode === 'full') {
    options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  } else if (mode === 'date') {
    options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  } else if (mode === 'short-date') {
    options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
  } else if (mode === 'time') {
    options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  } else if (mode === 'custom' && customOptions) {
    options = customOptions
  }

  // On the server, we render using UTC to ensure a consistent, mismatch-free initial render.
  // Once mounted on the client, we format using the user's browser locale/timezone.
  const formatOptions = mounted ? options : { ...options, timeZone: 'UTC' }
  const formattedString = date.toLocaleString(undefined, formatOptions)
  const serverSuffix = mounted ? '' : ' UTC'

  return (
    <span className={className} suppressHydrationWarning>
      {formattedString}{serverSuffix}
    </span>
  )
}
