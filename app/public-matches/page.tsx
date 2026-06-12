/**
 * Public Matches Page (FIFA World Cup 2026 Edition)
 * 
 * Public page showing all matches - same UI as authenticated matches page
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { Trophy, Calendar, Target, Filter } from 'lucide-react'
import { MatchFixtureCard } from '@/components/match-fixture-card'

export const metadata: Metadata = {
  title: 'Matches | South Soccers Prediction League',
  description: 'View all FIFA World Cup 2026 matches',
}

type Match = Database['public']['Tables']['matches']['Row']

interface GroupedMatches {
  [round: string]: Match[]
}

export default async function PublicMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; round?: string }>
}) {
  const supabase = await createServerClient()
  const params = await searchParams
  const filter = params.filter || 'all'
  const selectedRound = params.round || 'all'

  // Build query
  let query = supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  // Apply status filters
  if (filter === 'upcoming') {
    query = query.eq('status', 'upcoming')
  } else if (filter === 'live') {
    query = query.eq('status', 'live')
  } else if (filter === 'finished') {
    query = query.eq('status', 'finished')
  }

  const { data: matches, error: matchesError } = await query

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#D80027] font-black">Failed to load matches. Please reload the page.</p>
      </div>
    )
  }

  const liveMatches = matches?.filter(m => m.status === 'live') || []

  // Calculate stats
  const totalMatches = matches?.length || 0
  const upcomingMatches = matches?.filter(m => m.status === 'upcoming').length || 0
  const liveMatchesCount = liveMatches.length
  const finishedMatches = matches?.filter(m => m.status === 'finished').length || 0

  // Group by round
  const groupedMatches: GroupedMatches = (matches || []).reduce((acc, match) => {
    const round = match.competition_round
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(match)
    return acc
  }, {} as GroupedMatches)

  const rounds = Object.keys(groupedMatches).sort()
  
  // Filter by round if selected
  const filteredRounds = selectedRound === 'all' ? rounds : rounds.filter(r => r === selectedRound)

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D80027] to-[#8B0A1E] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Tournament Fixtures
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                {totalMatches} total matches • Sign in to make predictions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        </div>

        {matches?.length === 0 && (
          <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded-xl">
            <p className="text-[#8A92A6] text-lg font-black uppercase">No matches loaded yet.</p>
          </div>
        )}

        {/* Filters */}
        {matches && matches.length > 0 && (
          <>
            <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-6 mb-8">
              <div className="flex flex-col gap-4">
                {/* Status Filter */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-3">
                    <Filter className="w-4 h-4" />
                    Filter by Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'All Matches', count: totalMatches },
                      { value: 'upcoming', label: 'Upcoming', count: upcomingMatches },
                      { value: 'live', label: 'Live', count: liveMatchesCount },
                      { value: 'finished', label: 'Finished', count: finishedMatches },
                    ].map(f => (
                      <Link
                        key={f.value}
                        href={`/public-matches?filter=${f.value}&round=${selectedRound}`}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                          filter === f.value
                            ? 'bg-[#F3A81D] text-black'
                            : 'bg-[#1A1A24] text-[#C1C5D0] hover:bg-[#2A2A34] border border-white/10'
                        }`}
                      >
                        {f.label} ({f.count})
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Round Filter */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-3">
                    <Target className="w-4 h-4" />
                    Filter by Round
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/public-matches?filter=${filter}&round=all`}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                        selectedRound === 'all'
                          ? 'bg-[#F3A81D] text-black'
                          : 'bg-[#1A1A24] text-[#C1C5D0] hover:bg-[#2A2A34] border border-white/10'
                      }`}
                    >
                      All Rounds
                    </Link>
                    {rounds.map(round => (
                      <Link
                        key={round}
                        href={`/public-matches?filter=${filter}&round=${round}`}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                          selectedRound === round
                            ? 'bg-[#F3A81D] text-black'
                            : 'bg-[#1A1A24] text-[#C1C5D0] hover:bg-[#2A2A34] border border-white/10'
                        }`}
                      >
                        {round}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Match List */}
            <div className="space-y-10">
              {filteredRounds.map(round => (
                <div key={round} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <h2 className="text-xl font-black text-[#F3A81D] uppercase tracking-wide px-4">
                      {round}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groupedMatches[round].map(match => (
                      <MatchFixtureCard
                        key={match.id}
                        match={match}
                        userPrediction={null}
                        isPublic={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA signup */}
        <div className="mt-16 text-center bg-[#0E0E13] border-2 border-white/5 max-w-2xl mx-auto p-8 rounded-xl shadow-2xl">
          <h3 className="text-2xl font-black text-[#F3A81D] mb-3 uppercase tracking-wide">
            Ready to Make Predictions?
          </h3>
          <p className="text-[#C1C5D0] mb-8 text-sm max-w-md mx-auto">
            Create an account, submit predictions for all matches, and compete for the top spot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="btn-tactile btn-tactile-gold text-xs px-8">
                Register Free
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-tactile btn-tactile-outline text-xs px-8">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
