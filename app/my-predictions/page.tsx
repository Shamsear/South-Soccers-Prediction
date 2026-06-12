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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#0F0F16] to-[#050508] relative py-12">
      <div className="absolute inset-0 background-grid opacity-[0.08] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* Navigation Action header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/matches"
            className="inline-flex items-center gap-1.5 text-[#FFD700] hover:text-white font-bold transition-colors group text-sm"
          >
            <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            Back to Matches
          </Link>
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            Prediction Dashboard
          </span>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] uppercase mb-3 tracking-tight">
            My Predictions
          </h1>
          <p className="text-foreground/75 text-lg">
            Track your predictions history, scores, and performance statistics
          </p>
        </div>

        {/* Summary Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {/* Total Points */}
          <Card className="glass-card border-[#FFD700]/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-[#FFD700]/5 select-none"><Trophy className="w-12 h-12" /></div>
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Total Points</CardDescription>
              <CardTitle className="text-3xl font-black text-[#FFD700] font-heading">
                {totalPoints}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Total Predictions */}
          <Card className="glass-card border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-white/5 select-none"><CalendarDays className="w-12 h-12" /></div>
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Submitted</CardDescription>
              <CardTitle className="text-3xl font-black text-white font-heading">
                {totalPredictions}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Exact Scores */}
          <Card className="glass-card border-green-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-green-500/5 select-none"><Award className="w-12 h-12" /></div>
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Exact Scores</CardDescription>
              <CardTitle className="text-3xl font-black text-green-400 font-heading">
                {exactScores}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Success Rate */}
          <Card className="glass-card border-white/10 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Success Rate</CardDescription>
              <CardTitle className="text-3xl font-black text-white font-heading">
                {successRate}%
              </CardTitle>
            </CardHeader>
          </Card>
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
