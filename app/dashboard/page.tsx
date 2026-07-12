import { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Trophy, Target, Calendar, TrendingUp, CheckCircle, Clock, 
  Zap, Award, Eye, ChevronRight, Medal 
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard | South Soccers Prediction League',
  description: 'Your prediction dashboard',
}

export default async function DashboardPage() {
  const supabase = await createServerClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's leaderboard position
  const { data: leaderboardData } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get upcoming matches count
  const { count: upcomingCount } = await supabase
    .from('matches')
    .select('*', { count: 'only', head: true })
    .eq('status', 'upcoming')

  // Get user's predictions count
  const { count: predictionsCount } = await supabase
    .from('predictions')
    .select('*', { count: 'only', head: true })
    .eq('user_id', user.id)

  // Get recent predictions (last 5)
  const { data: recentPredictions } = await supabase
    .from('predictions')
    .select(`
      *,
      matches:match_id (
        home_team,
        away_team,
        competition_round,
        status,
        home_score,
        away_score,
        kickoff_time
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get next 3 upcoming matches
  const { data: nextMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('kickoff_time', { ascending: true })
    .limit(3)

  const totalPoints = leaderboardData?.total_points || 0
  const correctPredictions = leaderboardData?.correct_predictions || 0
  const rank = leaderboardData?.rank || '-'
  const totalPredictions = predictionsCount || 0

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 lg:py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mb-1 md:mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3A81D] to-[#D80027]">{profile?.username}</span>
          </h1>
          <p className="text-[#8A92A6] text-xs md:text-sm">Your prediction command center</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8">
          
          {/* Total Points */}
          <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-3 md:p-5 relative overflow-hidden group hover:border-[#F3A81D]/40 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#F3A81D]/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                <Trophy className="w-3 h-3 md:w-4 md:h-4 text-[#F3A81D]" />
                <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase tracking-wider">Points</p>
              </div>
              <p className="text-xl md:text-3xl font-black text-white">{totalPoints}</p>
            </div>
          </div>

          {/* Rank */}
          <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-3 md:p-5 relative overflow-hidden group hover:border-[#0052B4]/40 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#0052B4]/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                <Medal className="w-3 h-3 md:w-4 md:h-4 text-[#0052B4]" />
                <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase tracking-wider">Rank</p>
              </div>
              <p className="text-xl md:text-3xl font-black text-white">#{rank}</p>
            </div>
          </div>

          {/* Exact Predictions */}
          <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-3 md:p-5 relative overflow-hidden group hover:border-[#10B981]/40 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#10B981]/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                <Target className="w-3 h-3 md:w-4 md:h-4 text-[#10B981]" />
                <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase tracking-wider">Exact</p>
              </div>
              <p className="text-xl md:text-3xl font-black text-white">{correctPredictions}</p>
            </div>
          </div>

          {/* Total Predictions */}
          <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-3 md:p-5 relative overflow-hidden group hover:border-[#D80027]/40 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#D80027]/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-[#D80027]" />
                <p className="text-[8px] md:text-[10px] font-black text-[#8A92A6] uppercase tracking-wider">Total</p>
              </div>
              <p className="text-xl md:text-3xl font-black text-white">{totalPredictions}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-8">
          
          {/* Predict Matches */}
          <Link href="/matches">
            <div className="bg-gradient-to-br from-[#F3A81D]/10 to-[#D80027]/10 border border-[#F3A81D]/20 rounded-xl p-4 md:p-6 hover:border-[#F3A81D]/50 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#F3A81D] to-[#D80027] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#F3A81D] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-sm md:text-lg font-black text-white uppercase mb-0.5 md:mb-1">Predict Matches</h3>
              <p className="text-xs md:text-sm text-[#8A92A6]">{upcomingCount} upcoming matches</p>
            </div>
          </Link>

          {/* View Leaderboard */}
          <Link href="/leaderboard">
            <div className="bg-gradient-to-br from-[#0052B4]/10 to-[#003D8F]/10 border border-[#0052B4]/20 rounded-xl p-4 md:p-6 hover:border-[#0052B4]/50 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#0052B4] to-[#003D8F] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#0052B4] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-sm md:text-lg font-black text-white uppercase mb-0.5 md:mb-1">Leaderboard</h3>
              <p className="text-xs md:text-sm text-[#8A92A6]">See rankings & standings</p>
            </div>
          </Link>

          {/* All Predictions */}
          <Link href="/all-predictions">
            <div className="bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/20 rounded-xl p-4 md:p-6 hover:border-[#10B981]/50 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-sm md:text-lg font-black text-white uppercase mb-0.5 md:mb-1">All Predictions</h3>
              <p className="text-xs md:text-sm text-[#8A92A6]">View community picks</p>
            </div>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          
          {/* Upcoming Matches */}
          <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#F3A81D]" />
                <h2 className="text-sm md:text-lg font-black text-white uppercase">Next Matches</h2>
              </div>
              <Link href="/matches" className="text-[10px] md:text-xs font-bold text-[#F3A81D] hover:text-[#FFD700] transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-2 md:space-y-3">
              {nextMatches && nextMatches.length > 0 ? (
                nextMatches.map(match => {
                  const kickoffDate = new Date(match.kickoff_time)
                  return (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                      <div className="bg-[#050508]/60 border border-white/5 rounded-lg p-3 md:p-4 hover:border-[#F3A81D]/30 transition-colors group cursor-pointer">
                        <div className="flex items-center justify-between mb-1.5 md:mb-2">
                          <span className="text-[8px] md:text-[9px] font-black text-[#F3A81D] uppercase tracking-wider">
                            {match.competition_round}
                          </span>
                          <span className="text-[8px] md:text-[9px] text-[#8A92A6]">
                            {kickoffDate.toLocaleDateString()} {kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 font-bold text-white text-xs md:text-sm truncate">{match.home_team}</div>
                          <div className="px-2 md:px-3 py-0.5 md:py-1 bg-white/5 rounded text-[9px] md:text-[10px] font-black text-[#8A92A6] mx-2">vs</div>
                          <div className="flex-1 font-bold text-white text-xs md:text-sm text-right truncate">{match.away_team}</div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="text-center py-6 md:py-8">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-[#8A92A6] mx-auto mb-2" />
                  <p className="text-xs md:text-sm text-[#8A92A6]">No upcoming matches</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Predictions */}
          <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-[#0052B4]" />
                <h2 className="text-sm md:text-lg font-black text-white uppercase">Recent Predictions</h2>
              </div>
              <Link href="/all-predictions" className="text-[10px] md:text-xs font-bold text-[#0052B4] hover:text-[#0066CC] transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-2 md:space-y-3">
              {recentPredictions && recentPredictions.length > 0 ? (
                recentPredictions.map((pred: any) => {
                  const match = pred.matches
                  const isFinished = match?.status === 'finished'
                  const points = pred.total_points ?? pred.points_awarded ?? 0
                  
                  return (
                    <div key={pred.id} className="bg-[#050508]/60 border border-white/5 rounded-lg p-3 md:p-4">
                      <div className="flex items-center justify-between mb-1.5 md:mb-2">
                        <span className="text-[8px] md:text-[9px] font-black text-[#8A92A6] uppercase tracking-wider">
                          {match?.competition_round}
                        </span>
                        {isFinished && (
                          <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider ${
                            points >= 5 ? 'text-[#10B981]' : points >= 3 ? 'text-[#F3A81D]' : 'text-[#8A92A6]'
                          }`}>
                            {points >= 5 ? 'Exact' : points >= 3 ? 'Correct' : 'Miss'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] md:text-xs text-[#8A92A6] mb-0.5 md:mb-1 truncate flex items-center gap-1">
                            <span>{match?.home_team}</span>
                            {pred.predicted_penalty_winner === 'home' && (
                              <span className="text-[8px] px-1 bg-[#F3A81D]/20 border border-[#F3A81D]/30 text-[#F3A81D] font-black rounded flex-shrink-0">P</span>
                            )}
                          </div>
                          <div className="text-[10px] md:text-xs text-[#8A92A6] truncate flex items-center gap-1">
                            <span>{match?.away_team}</span>
                            {pred.predicted_penalty_winner === 'away' && (
                              <span className="text-[8px] px-1 bg-[#F3A81D]/20 border border-[#F3A81D]/30 text-[#F3A81D] font-black rounded flex-shrink-0">P</span>
                            )}
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className="text-xs md:text-sm font-black text-white">{pred.predicted_home}</div>
                          <div className="text-xs md:text-sm font-black text-white">{pred.predicted_away}</div>
                        </div>
                        {isFinished && (
                          <>
                            <div className="text-[#8A92A6] text-[10px] md:text-xs flex-shrink-0">→</div>
                            <div className="text-center flex-shrink-0">
                              <div className="text-xs md:text-sm font-black text-[#F3A81D]">{match?.home_score}</div>
                              <div className="text-xs md:text-sm font-black text-[#F3A81D]">{match?.away_score}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 md:py-8">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-[#8A92A6] mx-auto mb-2" />
                  <p className="text-xs md:text-sm text-[#8A92A6] mb-3">No predictions yet</p>
                  <Link href="/matches">
                    <button className="text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 bg-[#F3A81D]/10 hover:bg-[#F3A81D]/20 text-[#F3A81D] font-bold rounded-lg transition-colors">
                      Make Your First Prediction
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
