/**
 * Match List Page (FIFA World Cup 2026 Edition)
 * 
 * Displays all matches with search, group filters, and date filters
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { AlertTriangle, Trophy, Calendar, Target } from 'lucide-react'
import { MatchFixtureCard } from '@/components/match-fixture-card'
import { MatchesFilter } from '@/components/matches-filter'
import { AutoSyncMatches } from '@/components/auto-sync-matches'
import { BulkPredictButton } from '@/components/bulk-predict-button'

export const metadata: Metadata = {
  title: 'Matches | South Soccers Prediction League',
  description: 'View all FIFA World Cup 2026 matches and make your predictions',
}

type Match = Database['public']['Tables']['matches']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']

interface MatchWithPrediction extends Match {
  userPrediction?: Prediction | null
}

interface GroupedMatches {
  [round: string]: MatchWithPrediction[]
}

export default async function MatchesPage() {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="bg-[#0E0E13] border-2 border-white/5 p-8 rounded shadow-2xl">
          <p className="text-[#C1C5D0] mb-6">Please sign in to view and predict tournament matches.</p>
          <Link href="/login">
            <button className="btn-tactile btn-tactile-gold text-xs w-full py-3">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Trigger sync check (fire and forget)
  fetch(new URL('/api/sync-matches', process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000').href)
    .catch(err => console.error('Background sync failed:', err))

  // Fetch matches
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#D80027] font-black">Failed to load matches. Please reload the page.</p>
      </div>
    )
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const liveMatches = matches?.filter(m => m.status === 'live') || []
  const hasStaleData = liveMatches.some(m => 
    m.api_last_polled_at && new Date(m.api_last_polled_at) < oneHourAgo
  )

  // Fetch predictions
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)

  const predictionMap = new Map<string, Prediction>()
  predictions?.forEach(pred => {
    predictionMap.set(pred.match_id, pred)
  })

  const matchesWithPredictions: MatchWithPrediction[] = matches?.map(match => ({
    ...match,
    userPrediction: predictionMap.get(match.id),
  })) || []

  // Calculate stats
  const totalMatches = matchesWithPredictions.length
  const upcomingMatches = matchesWithPredictions.filter(m => m.status === 'upcoming').length
  const liveMatchesCount = liveMatches.length
  const finishedMatches = matchesWithPredictions.filter(m => m.status === 'finished').length
  const userPredictionsCount = predictions?.length || 0

  // Group by round
  const groupedMatches: GroupedMatches = matchesWithPredictions.reduce((acc, match) => {
    const round = match.competition_round
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(match)
    return acc
  }, {} as GroupedMatches)

  const rounds = Object.keys(groupedMatches).sort()

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      <AutoSyncMatches />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D80027] to-[#8B0A1E] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                  Tournament Fixtures
                </h1>
                <p className="text-[#C1C5D0] text-sm mt-1">
                  {totalMatches} total matches • Lock in predictions before kickoff
                </p>
              </div>
            </div>
            
            {/* Bulk Predict Button */}
            <BulkPredictButton matches={matchesWithPredictions} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#F3A81D]" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Total</p>
            </div>
            <p className="text-2xl font-black text-white">{totalMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#0052B4]" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Upcoming</p>
            </div>
            <p className="text-2xl font-black text-white">{upcomingMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#D80027] animate-pulse" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Live</p>
            </div>
            <p className="text-2xl font-black text-white">{liveMatchesCount}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#009A44]" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Finished</p>
            </div>
            <p className="text-2xl font-black text-white">{finishedMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-[#F3A81D]" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Your Predicts</p>
            </div>
            <p className="text-2xl font-black text-white">{userPredictionsCount}</p>
          </div>
        </div>
        
        {/* Stale Warning */}
        {hasStaleData && liveMatches.length > 0 && (
          <div className="mb-8 bg-[#D80027]/10 border-2 border-[#D80027]/40 rounded-xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-[#D80027] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-black uppercase tracking-wide mb-1">Scores Syncing Warning</h3>
              <p className="text-[#C1C5D0] text-sm">
                Live match updates are temporarily delayed. Refreshing the browser may fetch the latest live scorelines.
              </p>
            </div>
          </div>
        )}

        {matches?.length === 0 && (
          <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded-xl">
            <p className="text-[#8A92A6] text-lg font-black uppercase">No matches loaded yet.</p>
          </div>
        )}

        {/* Filters and Match List */}
        {matches && matches.length > 0 && (
          <MatchesFilter matches={matchesWithPredictions} />
        )}
      </div>
    </div>
  )
}
