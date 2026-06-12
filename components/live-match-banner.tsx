/**
 * Live Match Banner Component
 * 
 * Requirements:
 * - 12 (Live Match Banner)
 * - 12.2-12.5 (Display requirements)
 * 
 * Server component displaying all currently live matches in a sticky header.
 */

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export async function LiveMatchBanner() {
  const supabase = await createServerClient()

  // Query matches with status = 'live' ordered by kickoff time
  const { data: liveMatches, error } = await supabase
    .from('matches')
    .select('id, home_team, away_team, home_score, away_score, status')
    .eq('status', 'live')
    .order('kickoff_time', { ascending: true })

  if (error) {
    console.error('Error fetching live matches:', error)
    return null
  }

  // Hide component when no live matches exist
  if (!liveMatches || liveMatches.length === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-50 bg-[#C8102E] border-b-2 border-[#FFD700] shadow-lg overflow-hidden">
      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-[#8B0A1E]">
        <div className="flex items-center gap-6 px-4 py-3 min-w-max">
          {/* LIVE indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-white font-black text-sm uppercase tracking-wider">
              LIVE
            </span>
          </div>

          {/* Live matches */}
          {liveMatches.map((match, index) => (
            <div key={match.id} className="flex items-center gap-4">
              {index > 0 && (
                <div className="w-px h-6 bg-white/30" />
              )}
              <Link
                href={`/matches/${match.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-white font-bold text-sm">
                  {match.home_team}
                </span>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white font-black text-lg">
                    {match.home_score ?? 0}
                  </span>
                  <span className="text-white/70 font-bold">-</span>
                  <span className="text-white font-black text-lg">
                    {match.away_score ?? 0}
                  </span>
                </div>
                <span className="text-white font-bold text-sm">
                  {match.away_team}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient edges for scroll indication */}
      <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-[#C8102E] to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-[#C8102E] to-transparent pointer-events-none" />
    </div>
  )
}
