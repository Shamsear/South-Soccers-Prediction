/**
 * Auto Sync Matches Component
 * 
 * Automatically triggers match sync when users visit match-related pages.
 * This ensures data is fresh without requiring manual admin intervention.
 * 
 * Features:
 * - Runs automatically on mount
 * - Respects 5-minute rate limit (handled by API)
 * - Silent background sync (no UI blocking)
 * - Only syncs when urgent matches exist (handled by API)
 */

'use client'

import { useEffect, useState } from 'react'

export function AutoSyncMatches() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    // Trigger sync on mount
    async function syncMatches() {
      // Check if we've already synced in this session
      const sessionSync = sessionStorage.getItem('lastMatchSync')
      if (sessionSync) {
        const lastSyncTime = new Date(sessionSync)
        const now = new Date()
        const timeSinceSync = now.getTime() - lastSyncTime.getTime()
        
        // Don't sync more than once per 5 minutes in the same session
        if (timeSinceSync < 5 * 60 * 1000) {
          console.log('Skipping sync - recently synced in this session')
          return
        }
      }

      setSyncing(true)

      try {
        const response = await fetch('/api/sync-matches')
        
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          // Not JSON - likely a redirect or HTML error page
          // This is expected for non-authenticated users on public pages
          console.log('⏭️ Skipping sync - authentication required')
          return
        }

        const data = await response.json()

        if (data.synced) {
          console.log('✅ Matches synced:', data.message)
          const syncTime = new Date().toISOString()
          setLastSync(syncTime)
          sessionStorage.setItem('lastMatchSync', syncTime)
        } else if (data.cached) {
          console.log('📦 Using cached matches:', data.message)
        } else if (data.error) {
          console.log('ℹ️ Sync info:', data.message || data.error)
        }
      } catch (error) {
        // Silently fail for auth errors on public pages
        // Only log unexpected errors
        if (error instanceof Error && !error.message.includes('JSON')) {
          console.error('❌ Failed to sync matches:', error)
        }
      } finally {
        setSyncing(false)
      }
    }

    syncMatches()
  }, [])

  // This component doesn't render anything visible
  // It just runs the sync in the background
  return null
}
