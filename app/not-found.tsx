/**
 * 404 Not Found Page
 * 
 * Requirements:
 * - User experience consistency
 * 
 * Page displayed when a route is not found.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#13131A] to-[#0A0A0F] flex items-center justify-center p-4">
      <Card className="border-2 border-[#FFD700]/30 bg-[#13131A] max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="text-8xl mb-4 font-black text-[#FFD700]">404</div>
          <CardTitle className="text-3xl font-black text-foreground">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-foreground/70 mt-2">
            Sorry, we couldn't find the page you're looking for.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground mb-6">
            The page may have been moved or doesn't exist.
          </div>

          {/* Navigation links */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full">
              <Button className="w-full bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] hover:from-[#8B0A1E] hover:to-[#C8102E] text-white font-bold">
                🏠 Go to Home
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

            <Link href="/leaderboard" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                🏆 View Leaderboard
              </Button>
            </Link>
          </div>

          {/* Branding */}
          <div className="text-center mt-8 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              <span className="text-[#FFD700] font-bold">South Soccers</span>
              {' '}Prediction League
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
