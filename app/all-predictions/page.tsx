/**
 * My Predictions Page - All Matches with Expandable Predictions
 * 
 * Shows all matches with search/filter functionality
 * Each match can be expanded to view all predictions and points
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MatchWithPredictionsCard } from '@/components/match-with-predictions-card'
import { Trophy, ChevronLeft, Target, Search } from 'lucide-react'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface PredictionWithUser extends Prediction {
  profiles: Profile
}

interface MatchWithPredictions extends Match {
  predictions: PredictionWithUser[]
}

export default function MyPredictionsPage() {
  const [matches, setMatches] = useState<MatchWithPredictions[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        window.location.href = '/login'
        return
      }

      setUserId(user.id)

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if ((profile as { role: string } | null)?.role === 'admin') {
        window.location.href = '/admin'
        return
      }

      // Fetch all matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .order('kickoff_time', { ascending: true })

      // Fetch all predictions
      const { data: allPredictions } = await supabase
        .from('predictions')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url,
            full_name
          )
        `)

      // Group predictions by match_id
      const predictionsByMatch: Record<string, PredictionWithUser[]> = {}
      if (allPredictions) {
        for (const pred of allPredictions as unknown as PredictionWithUser[]) {
          if (!predictionsByMatch[pred.match_id]) {
            predictionsByMatch[pred.match_id] = []
          }
          predictionsByMatch[pred.match_id].push(pred)
        }
      }

      // Combine matches with their predictions
      const matchesWithPredictions: MatchWithPredictions[] = (matchesData || []).map(match => ({
        ...match,
        predictions: predictionsByMatch[match.id] || []
      }))

      setMatches(matchesWithPredictions)
      setLoading(false)
    }

    loadData()
  }, [])

  // Filter matches by search term
  const filteredMatches = matches.filter(match =>
    match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.away_team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group by round
  const groupedMatches: Record<string, MatchWithPredictions[]> = filteredMatches.reduce((acc, match) => {
    const round = match.competition_round
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(match)
    return acc
  }, {} as Record<string, MatchWithPredictions[]>)

  const rounds = Object.keys(groupedMatches).sort()

  // Calculate stats
  const totalMatches = matches.length
  const upcomingMatches = matches.filter(m => m.status === 'upcoming').length
  const liveMatches = matches.filter(m => m.status === 'live').length
  const finishedMatches = matches.filter(m => m.status === 'finished').length

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#030306] py-6 md:py-12 flex items-center justify-center">
        <div className="text-[#F3A81D] text-lg font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#030306] py-6 md:py-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-3 md:px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <Link
            href="/dashboard"
            className="btn-tactile btn-tactile-outline text-[10px] md:text-[11px] py-1.5 md:py-2 px-3 md:px-4 flex items-center gap-1 md:gap-1.5 w-max mb-4 md:mb-6"
          >
            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#D80027] to-[#8B0A1E] flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                All Predictions
              </h1>
              <p className="text-[#C1C5D0] text-xs md:text-sm mt-0.5 md:mt-1">
                View all matches and predictions from the community
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          <div className="bg-[#0E0E13] border border-white/5 p-2 md:p-4 rounded-xl">
            <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase mb-0.5 md:mb-1">Total</p>
            <p className="text-base md:text-2xl font-black text-white">{totalMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-2 md:p-4 rounded-xl">
            <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase mb-0.5 md:mb-1">Up</p>
            <p className="text-base md:text-2xl font-black text-white">{upcomingMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-2 md:p-4 rounded-xl">
            <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase mb-0.5 md:mb-1">Live</p>
            <p className="text-base md:text-2xl font-black text-white">{liveMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-2 md:p-4 rounded-xl">
            <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase mb-0.5 md:mb-1">Done</p>
            <p className="text-base md:text-2xl font-black text-white">{finishedMatches}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8A92A6]" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-3 bg-[#0E0E13] border border-white/10 rounded-lg text-white placeholder-[#8A92A6] focus:border-[#F3A81D] focus:outline-none transition-colors text-sm"
            />
          </div>
        </div>

        {/* Matches by Round */}
        <div className="space-y-6 md:space-y-12">
          {rounds.length > 0 ? (
            rounds.map(round => (
              <div key={round} className="space-y-3 md:space-y-6">
                {/* Round Title */}
                <div className="flex items-center gap-2 md:gap-4">
                  <h2 className="text-sm md:text-xl lg:text-2xl font-black text-[#F3A81D] tracking-widest uppercase font-heading">
                    {round.replace(/_/g, ' ')}
                  </h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-[#F3A81D]/30 to-transparent" />
                </div>

                {/* Match Cards */}
                <div className="space-y-2 md:space-y-4">
                  {groupedMatches[round].map(match => (
                    <MatchWithPredictionsCard
                      key={match.id}
                      match={match}
                      predictions={match.predictions}
                      currentUserId={userId || undefined}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-8 md:p-12 rounded-xl">
              <Trophy className="w-8 h-8 md:w-12 md:h-12 text-[#8A92A6]/40 mx-auto mb-3 md:mb-4" />
              <p className="text-[#8A92A6] text-sm md:text-lg font-black uppercase">No matches yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
