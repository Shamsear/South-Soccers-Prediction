/**
 * Global Error Boundary
 * 
 * Requirements:
 * - 23 (Error Handling)
 * 
 * Client component for handling unhandled errors globally.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#13131A] to-[#0A0A0F] flex items-center justify-center p-4">
      <Card className="border-2 border-[#C8102E]/30 bg-[#13131A] max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <CardTitle className="text-3xl font-black text-[#C8102E]">
            Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-foreground/70 mt-2">
            We encountered an unexpected error. Don't worry, your data is safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error message (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-[#0A0A0F] border border-border/30 rounded-lg p-4">
              <p className="text-xs text-red-400 font-mono break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] hover:from-[#8B0A1E] hover:to-[#C8102E] text-white font-bold"
            >
              🔄 Try Again
            </Button>
            
            <Link href="/" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                🏠 Return to Home
              </Button>
            </Link>

            <Link href="/matches" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                ⚽ View Matches
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
