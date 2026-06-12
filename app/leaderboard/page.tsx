/**
 * Leaderboard Page (FIFA World Cup 2026 Edition)
 * 
 * Table layout showing user rankings with search functionality
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { Trophy, Award, Target, TrendingUp, Users } from 'lucide-react'
import { AutoSyncMatches } from '@/components/auto-sync-matches'

export const metadata: Metadata = {
  title: 'Leaderboard | South Soccers Prediction League',
  description: 'View the top predictors in the FIFA World Cup 2026 competition',
}

type LeaderboardEntry = {
  id: string
  rank: number
  username: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  correct_predictions: number
  scored_count: number
}

export default async function LeaderboardPage() {
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = (profile as { role: string } | null)?.role === 'admin'
  const homeLink = isAdmin ? '/admin' : '/matches'

  // Query full leaderboard
  const { data: leaderboard, error: leaderboardError } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  if (leaderboardError) {
    console.error('Error fetching leaderboard:', leaderboardError)
  }

  const typedLeaderboard = (leaderboard as LeaderboardEntry[]) || []

  // Calculate stats
  const totalPlayers = typedLeaderboard.length
  const activePlayers = typedLeaderboard.filter(u => u.total_points > 0).length
  const totalPredictions = typedLeaderboard.reduce((sum, u) => sum + u.scored_count, 0)
  const totalExact = typedLeaderboard.reduce((sum, u) => sum + u.correct_predictions, 0)

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      <AutoSyncMatches />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            href={homeLink}
            className="inline-flex items-center gap-2 text-[#F3A81D] hover:text-[#FFD700] font-bold mb-4 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#FFA500] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Leaderboard
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                {totalPlayers} total players • Rankings based on total points earned
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#F3A81D]" />
              <p className="text-xs font-black text-[#8A92A6] uppercase">Total Players</p>
            </div>
            <p className="text-3xl font-black text-white">{totalPlayers}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[#009A44]" />
              <p className="text-xs font-black text-[#8A92A6] uppercase">Active Players</p>
            </div>
            <p className="text-3xl font-black text-white">{activePlayers}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-[#0052B4]" />
              <p className="text-xs font-black text-[#8A92A6] uppercase">Total Predictions</p>
            </div>
            <p className="text-3xl font-black text-white">{totalPredictions}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-[#D80027]" />
              <p className="text-xs font-black text-[#8A92A6] uppercase">Exact Scores</p>
            </div>
            <p className="text-3xl font-black text-white">{totalExact}</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable leaderboard={typedLeaderboard} currentUserId={user.id} />

      </div>
    </div>
  )
}
