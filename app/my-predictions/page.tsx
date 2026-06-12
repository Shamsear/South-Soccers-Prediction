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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Award, Calendar, ChevronLeft, CalendarDays, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

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
    <div className="relative min-h-screen bg-[#030306] py-12 overflow-hidden">
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/matches"
            className="btn-tactile btn-tactile-outline text-[11px] py-2 px-4 flex items-center gap-1.5 w-max"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Matches
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-2 tracking-tight font-heading">
            My Predictions
          </h1>
          <p className="text-[#8A92A6] text-sm font-bold">
            Track your prediction history and performance statistics
          </p>
        </div>

        {/* Summary Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          
          {/* Total Points */}
          <div className="bg-[#0E0E13] border-2 border-[#F3A81D]/20 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-[#F3A81D]/5 select-none">
              <Trophy className="w-16 h-16" />
            </div>
            <p className="text-[#8A92A6] text-[10px] font-black uppercase tracking-wider mb-2">
              Total Points
            </p>
            <p className="text-4xl font-black text-[#F3A81D] font-heading relative z-10">
              {totalPoints}
            </p>
          </div>

          {/* Total Predictions */}
          <div className="bg-[#0E0E13] border-2 border-white/5 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-white/5 select-none">
              <CalendarDays className="w-16 h-16" />
            </div>
            <p className="text-[#8A92A6] text-[10px] font-black uppercase tracking-wider mb-2">
              Submitted
            </p>
            <p className="text-4xl font-black text-white font-heading relative z-10">
              {totalPredictions}
            </p>
          </div>

          {/* Exact Scores */}
          <div className="bg-[#0E0E13] border-2 border-emerald-500/20 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-emerald-500/5 select-none">
              <Award className="w-16 h-16" />
            </div>
            <p className="text-[#8A92A6] text-[10px] font-black uppercase tracking-wider mb-2">
              Exact Scores
            </p>
            <p className="text-4xl font-black text-emerald-400 font-heading relative z-10">
              {exactScores}
            </p>
          </div>

          {/* Success Rate */}
          <div className="bg-[#0E0E13] border-2 border-[#0052B4]/20 rounded-xl p-5 relative overflow-hidden">
            <p className="text-[#8A92A6] text-[10px] font-black uppercase tracking-wider mb-2">
              Success Rate
            </p>
            <p className="text-4xl font-black text-[#0052B4] font-heading relative z-10">
              {successRate}%
            </p>
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

              let badgeStyle = "bg-zinc-800 text-zinc-400 border border-zinc-700"
              let badgeText = "Pending"
              let badgeIcon = <Clock className="w-3.5 h-3.5" />

              if (isExactScore) {
                badgeStyle = "bg-green-950/40 text-green-400 border border-green-500/30"
                badgeText = "Exact Score"
                badgeIcon = <CheckCircle2 className="w-3.5 h-3.5" />
              } else if (isCorrectResult) {
                badgeStyle = "bg-blue-950/40 text-blue-400 border border-blue-500/30"
                badgeText = "Correct Result"
                badgeIcon = <CheckCircle2 className="w-3.5 h-3.5" />
              } else if (isIncorrect) {
                badgeStyle = "bg-red-950/40 text-red-400 border border-red-500/30"
                badgeText = "Incorrect"
                badgeIcon = <XCircle className="w-3.5 h-3.5" />
              }

              return (
                <Link
                  key={prediction.id}
                  href={`/matches/${match.id}`}
                  className="block group"
                >
                  <div className="glass-card glass-card-hover rounded-xl p-5 border-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-[#FFD700] font-black uppercase tracking-wider bg-[#FFD700]/10 px-2 py-0.5 rounded">
                          {match.competition_round}
                        </span>
                        {match.group_name && (
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            {match.group_name}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${badgeStyle}`}>
                          {badgeIcon}
                          {badgeText}
                        </span>
                      </div>

                      {/* Teams & Scores Visual */}
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center justify-between gap-8">
                          <span className="font-bold text-sm text-white/90 group-hover:text-[#FFD700] transition-colors">{match.home_team}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#FFD700]">{prediction.predicted_home}</span>
                            {match.status === 'finished' && match.home_score !== null && (
                              <span className="text-xs text-muted-foreground">({match.home_score})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <span className="font-bold text-sm text-white/90 group-hover:text-[#FFD700] transition-colors">{match.away_team}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#FFD700]">{prediction.predicted_away}</span>
                            {match.status === 'finished' && match.away_score !== null && (
                              <span className="text-xs text-muted-foreground">({match.away_score})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#FFD700]/70" />
                        <span>{formatDate(match.kickoff_time)}</span>
                      </div>
                    </div>

                    {/* Right: Points awarded */}
                    {!isPending && (
                      <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-xl p-3 min-w-[76px] self-end sm:self-center">
                        <span className="text-2xl font-black text-[#FFD700] font-heading leading-none">
                          +{prediction.points_awarded}
                        </span>
                        <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                          Points
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="glass-card rounded-xl p-12 text-center border-white/10">
              <p className="text-muted-foreground mb-4">
                You haven't made any predictions yet.
              </p>
              <Link href="/matches">
                <Button className="bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] text-white font-bold cursor-pointer rounded-lg">
                  Start Predicting Matches
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
