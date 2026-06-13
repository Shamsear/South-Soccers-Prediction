'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AutoRefreshWrapperProps {
  hasLiveMatches: boolean
  children: React.ReactNode
}

/**
 * Auto-Refresh Wrapper Component
 * 
 * Automatically refreshes page data in two scenarios:
 * 1. When user returns to the tab (page focus)
 * 2. Every 60 seconds when there are live matches
 * 
 * This ensures users see fresh data and prevents predictions on started matches
 */
export function AutoRefreshWrapper({ hasLiveMatches, children }: AutoRefreshWrapperProps) {
  const router = useRouter()

  useEffect(() => {
    // Refresh when user returns to the tab
    const handleFocus = () => {
      console.log('🔄 Page focused - refreshing data...')
      router.refresh()
    }

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Page visible - refreshing data...')
        router.refresh()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  useEffect(() => {
    // Poll for updates every 60 seconds when there are live matches
    if (hasLiveMatches) {
      console.log('⚽ Live matches detected - enabling auto-refresh (60s interval)')
      
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing data (live match active)...')
        router.refresh()
      }, 60000) // 60 seconds

      return () => {
        console.log('⏹️ Stopping auto-refresh')
        clearInterval(interval)
      }
    }
  }, [hasLiveMatches, router])

  return <>{children}</>
}
