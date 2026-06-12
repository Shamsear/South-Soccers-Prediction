/**
 * Force Sync Button Component
 * 
 * Client-side button that triggers force sync for admin users.
 * Shows loading state and result messages.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export function ForceSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  async function handleSync() {
    setSyncing(true)
    setResult({ type: null, message: '' })

    try {
      const response = await fetch('/api/sync-matches?force=true')
      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          type: 'success',
          message: `✅ Successfully synced ${data.count} matches!`,
        })
        
        // Refresh the page after 2 seconds to show new matches
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setResult({
          type: 'error',
          message: `❌ ${data.error || data.message || 'Failed to sync matches'}`,
        })
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={syncing}
        className="bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] hover:from-[#8B0A1E] hover:to-[#C8102E] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : '🔄 Force Sync All Matches'}
      </Button>

      {result.type && (
        <div
          className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded border ${
            result.type === 'success'
              ? 'bg-green-950/30 border-green-500/30 text-green-400'
              : 'bg-red-950/30 border-red-500/30 text-red-400'
          }`}
        >
          {result.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
