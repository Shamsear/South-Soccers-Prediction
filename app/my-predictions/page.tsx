/**
 * User Prediction History Page
 * 
 * Displays list of user's predictions with calculated statistics
 * and premium status badges.
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Trophy, Award, Calendar, ChevronLeft, CalendarDays, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Predictions | South Soccers Prediction League',
  description: 'View your prediction history and statistics',
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

  // Query all predictions for current user with JOIN to matches table
  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select(`
      *,
      matches (
        id,
        home_team,
        away_team,
        home_score,
        away_score,
        status,
        kickoff_time,
        competition_round,
        group_name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (predictionsError) {
    console.error('Error fetching predictions:', predictionsError)
  }

  // Calculate summary statistics
  const totalPredictions = predictions?.length || 0
  const scoredPredictions = predictions?.filter(p => p.points_awarded !== null) || []
  const totalPoints = scoredPredictions.reduce((sum, p) => sum + (p.points_awarded || 0), 0)
  const exactScores = scoredPredictions.filter(p => p.points_awarded === 3).length
  const correctResults = scoredPredictions.filter(p => p.points_awarded === 1).length
  const successRate = scoredPredictions.length > 0
    ? Math.round(((exactScores + correctResults) / scoredPredictions.length) * 100)
    : 0

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 text-[#F3A81D] hover:text-[#FFD700] font-bold mb-4 transition-colors text-sm"
          >
            ← Back to Matches
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#FFA500] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                My Predictions
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                {totalPredictions} total predictions • Track your performance history
              </p>
            </div>
          </div>
        </div>

        {/* Summary Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          
          {/* Total Points */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F3A81D]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-black/40 backdrop-blur-sm border border-[#F3A81D]/20 rounded-2xl p-6 hover:border-[#F3A81D]/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#F3A81D]" />
                </div>
              </div>
              <p className="text-[#C1C5D0] text-xs font-bold uppercase tracking-wider mb-1">
                Total Points
              </p>
              <p className="text-4xl font-black text-white leading-none">
                {totalPoints}
              </p>
            </div>
          </div>

          {/* Total Predictions */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-white/70" />
                </div>
              </div>
              <p className="text-[#C1C5D0] text-xs font-bold uppercase tracking-wider mb-1">
                Submitted
              </p>
              <p className="text-4xl font-black text-white leading-none">
                {totalPredictions}
              </p>
            </div>
          </div>

          {/* Exact Scores */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-black/40 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-[#C1C5D0] text-xs font-bold uppercase tracking-wider mb-1">
                Exact Scores
              </p>
              <p className="text-4xl font-black text-emerald-400 leading-none">
                {exactScores}
              </p>
            </div>
          </div>

          {/* Success Rate */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0052B4]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-black/40 backdrop-blur-sm border border-[#0052B4]/20 rounded-2xl p-6 hover:border-[#0052B4]/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#0052B4]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#0052B4]" />
                </div>
              </div>
              <p className="text-[#C1C5D0] text-xs font-bold uppercase tracking-wider mb-1">
                Success Rate
              </p>
              <p className="text-4xl font-black text-[#0052B4] leading-none">
                {successRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Prediction List */}
        <div className="space-y-4">
          {predictions && predictions.length > 0 ? (
            predictions.map((prediction) => {
              const match = prediction.matches as any
              const isPending = prediction.points_awarded === null
              const isExactScore = prediction.points_awarded === 3
              const isCorrectResult = prediction.points_awarded === 1
              const isIncorrect = prediction.points_awarded === 0

              let badgeStyle = "bg-zinc-800/60 text-zinc-400 border border-zinc-700/50"
              let badgeText = "Pending"
              let badgeIcon = <Clock className="w-3.5 h-3.5" />

              if (isExactScore) {
                badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                badgeText = "Exact Score"
                badgeIcon = <CheckCircle2 className="w-3.5 h-3.5" />
              } else if (isCorrectResult) {
                badgeStyle = "bg-[#0052B4]/10 text-[#0052B4] border border-[#0052B4]/30"
                badgeText = "Correct Result"
                badgeIcon = <CheckCircle2 className="w-3.5 h-3.5" />
              } else if (isIncorrect) {
                badgeStyle = "bg-[#D80027]/10 text-[#D80027] border border-[#D80027]/30"
                badgeText = "Incorrect"
                badgeIcon = <XCircle className="w-3.5 h-3.5" />
              }

              return (
                <Link
                  key={prediction.id}
                  href={`/matches/${match.id}`}
                  className="block group"
                >
                  <div className="bg-[#0E0E13] border-2 border-white/5 hover:border-[#F3A81D]/30 transition-all rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    {/* Left: Match Info */}
                    <div className="flex-1 space-y-3">
                      
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-[#F3A81D] font-black uppercase tracking-wider bg-[#F3A81D]/10 px-2 py-1 rounded border border-[#F3A81D]/20">
                          {match.competition_round?.replace(/_/g, ' ')}
                        </span>
                        {match.group_name && (
                          <span className="text-[10px] text-[#8A92A6] uppercase font-black tracking-wider">
                            {match.group_name.replace(/_/g, ' ')}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${badgeStyle}`}>
                          {badgeIcon}
                          {badgeText}
                        </span>
                      </div>

                      {/* Teams & Scores */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-8 max-w-sm">
                          <span className="font-black text-sm text-white group-hover:text-[#F3A81D] transition-colors uppercase tracking-wide">
                            {match.home_team}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-lg text-[#F3A81D]">
                              {prediction.predicted_home}
                            </span>
                            {match.status === 'finished' && match.home_score !== null && (
                              <span className="text-sm text-[#8A92A6] font-bold">
                                ({match.home_score})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-8 max-w-sm">
                          <span className="font-black text-sm text-white group-hover:text-[#F3A81D] transition-colors uppercase tracking-wide">
                            {match.away_team}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-lg text-[#F3A81D]">
                              {prediction.predicted_away}
                            </span>
                            {match.status === 'finished' && match.away_score !== null && (
                              <span className="text-sm text-[#8A92A6] font-bold">
                                ({match.away_score})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-[10px] text-[#8A92A6] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#F3A81D]" />
                        <span>{formatDate(match.kickoff_time)}</span>
                      </div>
                    </div>

                    {/* Right: Points Badge */}
                    {!isPending && (
                      <div className="flex flex-col items-center justify-center bg-black/40 border-2 border-[#F3A81D]/20 rounded-xl p-4 min-w-[80px] self-end sm:self-center">
                        <span className="text-3xl font-black text-[#F3A81D] font-heading leading-none">
                          +{prediction.points_awarded}
                        </span>
                        <span className="text-[8px] text-[#8A92A6] uppercase font-black tracking-widest mt-1.5">
                          Points
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="bg-[#0E0E13] border-2 border-white/5 rounded-xl p-12 text-center">
              <p className="text-[#8A92A6] text-lg font-black uppercase mb-6">
                No predictions yet
              </p>
              <Link href="/matches">
                <button className="btn-tactile btn-tactile-red text-xs py-3 px-6">
                  Start Predicting Matches
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
