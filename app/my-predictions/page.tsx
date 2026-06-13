/**
 * My Predictions Page - All Matches with Expandable Predictions
 * 
 * Shows all matches with search/filter functionality
 * Each match can be expanded to view all predictions and points
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { MatchWithPredictionsCard } from '@/components/match-with-predictions-card'
import { Trophy, ChevronLeft, Target } from 'lucide-react'
import type { Database } from '@/types/database'

export const metadata: Metadata = {
  title: 'My Predictions | South Soccers Prediction League',
  description: 'View all matches and predictions',
}

type Match = Database['public']['Tables']['matches']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface PredictionWithUser extends Prediction {
  profiles: Profile
}

interface MatchWithPredictions extends Match {
  predictions: PredictionWithUser[]
}

export default async function MyPredictionsPage() {
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check if user is admin - admins don't participate in predictions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role: string } | null)?.role === 'admin') {
    redirect('/admin')
  }

  // Fetch all matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  // Fetch all predictions for all matches
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
  const matchesWithPredictions: MatchWithPredictions[] = (matches || []).map(match => ({
    ...match,
    predictions: predictionsByMatch[match.id] || []
  }))

  // Group by round
  const groupedMatches: Record<string, MatchWithPredictions[]> = matchesWithPredictions.reduce((acc, match) => {
    const round = match.competition_round
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(match)
    return acc
  }, {} as Record<string, MatchWithPredictions[]>)

  const rounds = Object.keys(groupedMatches).sort()

  // Calculate stats
  const totalMatches = matchesWithPredictions.length
  const upcomingMatches = matchesWithPredictions.filter(m => m.status === 'upcoming').length
  const liveMatches = matchesWithPredictions.filter(m => m.status === 'live').length
  const finishedMatches = matchesWithPredictions.filter(m => m.status === 'finished').length

  return (
    <div className="relative min-h-screen bg-[#030306] py-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="btn-tactile btn-tactile-outline text-[11px] py-2 px-4 flex items-center gap-1.5 w-max mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D80027] to-[#8B0A1E] flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                All Predictions
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                View all matches and predictions from the community
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <p className="text-[10px] font-black text-[#8A92A6] uppercase mb-1">Total</p>
            <p className="text-2xl font-black text-white">{totalMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <p className="text-[10px] font-black text-[#8A92A6] uppercase mb-1">Upcoming</p>
            <p className="text-2xl font-black text-white">{upcomingMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <p className="text-[10px] font-black text-[#8A92A6] uppercase mb-1">Live</p>
            <p className="text-2xl font-black text-white">{liveMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <p className="text-[10px] font-black text-[#8A92A6] uppercase mb-1">Finished</p>
            <p className="text-2xl font-black text-white">{finishedMatches}</p>
          </div>
        </div>

        {/* Matches by Round */}
        <div className="space-y-12">
          {rounds.length > 0 ? (
            rounds.map(round => (
              <div key={round} className="space-y-6">
                {/* Round Title */}
                <div className="flex items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-black text-[#F3A81D] tracking-widest uppercase font-heading">
                    {round.replace(/_/g, ' ')}
                  </h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-[#F3A81D]/30 to-transparent" />
                </div>

                {/* Match Cards */}
                <div className="space-y-4">
                  {groupedMatches[round].map(match => (
                    <MatchWithPredictionsCard
                      key={match.id}
                      match={match}
                      predictions={match.predictions}
                      currentUserId={user.id}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded-xl">
              <Trophy className="w-12 h-12 text-[#8A92A6]/40 mx-auto mb-4" />
              <p className="text-[#8A92A6] text-lg font-black uppercase">No matches yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
