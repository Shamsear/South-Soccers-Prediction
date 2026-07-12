/**
 * Player Detail Page (Admin)
 * 
 * Shows detailed prediction history for a specific user
 * Only shows completed matches
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { Trophy, Target, Calendar, TrendingUp, CheckCircle, XCircle, MinusCircle, ArrowLeft } from 'lucide-react'
import { TeamLogoBadge } from '@/components/team-logo-badge'
import { formatCompetitionRound } from '@/lib/format-text'

export const metadata: Metadata = {
  title: 'Player Details | Admin | South Soccers',
  description: 'View player prediction history',
}

type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  correct_predictions: number
  role: string
  created_at: string
}

type Match = {
  id: string
  home_team: string
  away_team: string
  home_team_logo: string | null
  away_team_logo: string | null
  home_score: number
  away_score: number
  kickoff_time: string
  competition_round: string
  status: string
}

type Prediction = {
  id: string
  predicted_home: number
  predicted_away: number
  predicted_penalty_winner?: string | null
  points_awarded: number | null
  created_at: string
  match: Match
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const typedAdminProfile = adminProfile as { role: string } | null
  if (!typedAdminProfile || typedAdminProfile.role !== 'admin') {
    redirect('/matches')
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  const typedProfile = profile as Profile

  // Fetch predictions for completed matches only
  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select(`
      *,
      matches:match_id (
        id,
        home_team,
        away_team,
        home_team_logo,
        away_team_logo,
        home_score,
        away_score,
        kickoff_time,
        competition_round,
        status
      )
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  if (predictionsError) {
    console.error('Error fetching predictions:', predictionsError)
  }

  // Filter only completed matches and type cast
  const allPredictions = (predictions || []) as any[]
  const completedPredictions = allPredictions
    .filter(p => p.matches?.status === 'finished')
    .map(p => ({
      ...p,
      match: p.matches
    })) as Prediction[]

  // Calculate stats
  const totalPredictions = completedPredictions.length
  const exactPredictions = completedPredictions.filter(p => p.points_awarded !== null && p.points_awarded >= 5).length
  const correctOutcome = completedPredictions.filter(p => p.points_awarded !== null && p.points_awarded >= 1 && p.points_awarded < 5).length
  const wrongPredictions = completedPredictions.filter(p => p.points_awarded === 0).length
  const accuracy = totalPredictions > 0 
    ? Math.round(((exactPredictions + correctOutcome) / totalPredictions) * 100)
    : 0

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-[#F3A81D] hover:text-[#FFD700] font-bold mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users List
          </Link>

          {/* Player Card */}
          <div className="bg-[#0E0E13] border-2 border-white/5 p-8 rounded-xl mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-[#F3A81D]/30 bg-black/30 flex items-center justify-center overflow-hidden">
                {typedProfile.avatar_url ? (
                  <Image
                    src={typedProfile.avatar_url}
                    alt={typedProfile.username}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-[#F3A81D]">
                    {typedProfile.username[0].toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
                  {typedProfile.username}
                </h1>
                {typedProfile.full_name && (
                  <p className="text-lg text-[#C1C5D0] font-medium mb-3">
                    {typedProfile.full_name}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-[#8A92A6]">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(typedProfile.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-4xl font-black text-[#F3A81D]">{typedProfile.total_points}</p>
                  <p className="text-xs text-[#8A92A6] font-bold uppercase mt-1">Total Points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl text-center">
              <div className="w-10 h-10 rounded-lg bg-[#0052B4]/10 flex items-center justify-center mx-auto mb-3">
                <Target className="w-5 h-5 text-[#0052B4]" />
              </div>
              <p className="text-2xl font-black text-white mb-1">{totalPredictions}</p>
              <p className="text-xs text-[#8A92A6] font-bold uppercase">Completed</p>
            </div>

            <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl text-center">
              <div className="w-10 h-10 rounded-lg bg-[#009A44]/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-[#009A44]" />
              </div>
              <p className="text-2xl font-black text-white mb-1">{exactPredictions}</p>
              <p className="text-xs text-[#8A92A6] font-bold uppercase">Exact Score</p>
            </div>

            <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl text-center">
              <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center mx-auto mb-3">
                <MinusCircle className="w-5 h-5 text-[#F3A81D]" />
              </div>
              <p className="text-2xl font-black text-white mb-1">{correctOutcome}</p>
              <p className="text-xs text-[#8A92A6] font-bold uppercase">Outcome</p>
            </div>

            <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl text-center">
              <div className="w-10 h-10 rounded-lg bg-[#D80027]/10 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-[#D80027]" />
              </div>
              <p className="text-2xl font-black text-white mb-1">{accuracy}%</p>
              <p className="text-xs text-[#8A92A6] font-bold uppercase">Accuracy</p>
            </div>
          </div>
        </div>

        {/* Predictions History */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-[#F3A81D]" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              Prediction History
            </h2>
            <span className="text-sm text-[#8A92A6] font-bold">
              ({completedPredictions.length} completed matches)
            </span>
          </div>

          {completedPredictions.length === 0 ? (
            <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded-xl">
              <Target className="w-16 h-16 text-[#8A92A6] mx-auto mb-4" />
              <p className="text-[#8A92A6] text-lg font-black uppercase">No completed predictions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedPredictions.map(prediction => {
                const isExact = prediction.points_awarded !== null && prediction.points_awarded >= 5
                const isCorrectOutcome = prediction.points_awarded !== null && prediction.points_awarded >= 1 && prediction.points_awarded < 5
                const isWrong = prediction.points_awarded === 0

                let statusColor = 'text-[#8A92A6]'
                let statusBg = 'bg-[#8A92A6]/10'
                let statusBorder = 'border-[#8A92A6]/30'
                let statusIcon = <XCircle className="w-4 h-4" />

                if (isExact) {
                  statusColor = 'text-emerald-400'
                  statusBg = 'bg-emerald-950/50'
                  statusBorder = 'border-emerald-500/35'
                  statusIcon = <CheckCircle className="w-4 h-4" />
                } else if (isCorrectOutcome) {
                  statusColor = 'text-emerald-400'
                  statusBg = 'bg-emerald-950/50'
                  statusBorder = 'border-emerald-500/35'
                  statusIcon = <CheckCircle className="w-4 h-4" />
                } else if (isWrong) {
                  statusColor = 'text-rose-400'
                  statusBg = 'bg-rose-950/50'
                  statusBorder = 'border-rose-500/35'
                  statusIcon = <XCircle className="w-4 h-4" />
                }

                return (
                  <div
                    key={prediction.id}
                    className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl hover:border-[#F3A81D]/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Match Info */}
                      <div className="flex-1">
                        <p className="text-xs text-[#F3A81D] font-black uppercase tracking-wider mb-2">
                          {formatCompetitionRound(prediction.match.competition_round)}
                        </p>
                        <div className="flex items-center gap-4 mb-3">
                          {/* Home Team */}
                          <div className="flex items-center gap-2">
                            <TeamLogoBadge
                              src={prediction.match.home_team_logo}
                              alt={prediction.match.home_team}
                              teamName={prediction.match.home_team}
                              size="sm"
                            />
                            <span className="text-sm font-bold text-white">{prediction.match.home_team}</span>
                          </div>

                          <span className="text-lg font-black text-[#8A92A6]">vs</span>

                          {/* Away Team */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{prediction.match.away_team}</span>
                            <TeamLogoBadge
                              src={prediction.match.away_team_logo}
                              alt={prediction.match.away_team}
                              teamName={prediction.match.away_team}
                              size="sm"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-[#8A92A6]">
                          {new Date(prediction.match.kickoff_time).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Scores */}
                      <div className="flex items-center gap-6">
                        {/* Actual Score */}
                        <div className="text-center">
                          <p className="text-xs text-[#8A92A6] font-bold uppercase mb-1">Actual</p>
                          <p className="text-2xl font-black text-white">
                            {prediction.match.home_score} - {prediction.match.away_score}
                          </p>
                        </div>

                        {/* Predicted Score */}
                        <div className="text-center">
                          <p className="text-xs text-[#8A92A6] font-bold uppercase mb-1">Predicted</p>
                          <p className="text-2xl font-black text-[#F3A81D]">
                            {prediction.predicted_home} - {prediction.predicted_away}
                            {prediction.predicted_penalty_winner && (
                              <span className="text-[10px] text-[#F3A81D]/80 block mt-0.5 font-bold">
                                Pens: {prediction.predicted_penalty_winner === 'home' ? prediction.match.home_team : prediction.match.away_team}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Points */}
                        <div className={`px-4 py-3 rounded-lg border ${statusBg} ${statusBorder} flex flex-col items-center gap-1 min-w-[80px]`}>
                          <div className={statusColor}>
                            {statusIcon}
                          </div>
                          <p className={`text-xl font-black ${statusColor}`}>
                            +{prediction.points_awarded} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
