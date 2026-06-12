/**
 * Admin Matches Management Page
 * 
 * Requirements:
 * - 11 (Admin Dashboard)
 * - 11.4-11.6 (Match management)
 * 
 * Server component for scoring matches and managing match data.
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ScoreMatchForm } from '@/components/score-match-form'
import { ForceSyncButton } from '@/components/force-sync-button'
import { formatCompetitionRound, formatGroupName } from '@/lib/format-text'
import { ArrowLeft, Activity, CheckCircle2, Clock, Calendar, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manage Matches | Admin | South Soccers',
  description: 'Score matches and manage match data',
}

type Match = {
  id: string
  external_id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  status: 'upcoming' | 'live' | 'finished'
  kickoff_time: string
  competition_round: string
  group_name: string | null
  winner_announced: boolean
}

/**
 * Format date for display
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminMatchesPage() {
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const typedProfile = profile as { role: string } | null
  if (!typedProfile || typedProfile.role !== 'admin') {
    redirect('/matches')
  }

  // Fetch all matches ordered by kickoff time
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
  }

  type Match = {
    id: string
    status: 'upcoming' | 'live' | 'finished'
    home_team: string
    away_team: string
    home_score: number | null
    away_score: number | null
    winner_announced: boolean
    [key: string]: any
  }

  const typedMatches = (matches as Match[]) || []

  // Group matches by status
  const groupedMatches = {
    live: typedMatches.filter(m => m.status === 'live'),
    upcoming: typedMatches.filter(m => m.status === 'upcoming'),
    finished: typedMatches.filter(m => m.status === 'finished'),
  }

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D80027]/6 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-medium" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[#C1C5D0] hover:text-[#F3A81D] font-bold mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Admin Home
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D80027] to-[#8B0A1E] flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                  Manage Matches
                </h1>
                <p className="text-[#C1C5D0] text-sm mt-1">
                  Score finished matches and manage match data
                </p>
              </div>
            </div>
            <ForceSyncButton />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#D80027]/40 transition-all group">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#D80027] via-[#D80027]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#D80027]/10 flex items-center justify-center mb-3 border border-[#D80027]/20">
              <Activity className="w-5 h-5 text-[#D80027]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Live Now</p>
            <p className="text-3xl font-black text-white">{groupedMatches.live.length}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#F3A81D]/40 transition-all group">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#F3A81D] via-[#F3A81D]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center mb-3 border border-[#F3A81D]/20">
              <Clock className="w-5 h-5 text-[#F3A81D]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Needs Scoring</p>
            <p className="text-3xl font-black text-white">{groupedMatches.finished.filter(m => !m.winner_announced).length}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#009A44]/40 transition-all group">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#009A44] via-[#009A44]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#009A44]/10 flex items-center justify-center mb-3 border border-[#009A44]/20">
              <CheckCircle2 className="w-5 h-5 text-[#009A44]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Scored</p>
            <p className="text-3xl font-black text-white">{groupedMatches.finished.filter(m => m.winner_announced).length}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#0052B4]/40 transition-all group">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#0052B4] via-[#0052B4]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#0052B4]/10 flex items-center justify-center mb-3 border border-[#0052B4]/20">
              <Calendar className="w-5 h-5 text-[#0052B4]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Upcoming</p>
            <p className="text-3xl font-black text-white">{groupedMatches.upcoming.length}</p>
          </div>
        </div>

        {/* Live Matches */}
        {groupedMatches.live.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#D80027]/10 flex items-center justify-center border border-[#D80027]/20">
                <Activity className="w-5 h-5 text-[#D80027]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">Live Matches</h2>
                <p className="text-xs text-[#8A92A6]">{groupedMatches.live.length} match{groupedMatches.live.length !== 1 ? 'es' : ''} in progress</p>
              </div>
            </div>

            <div className="space-y-4">
              {groupedMatches.live.map(match => (
                <div
                  key={match.id}
                  className="bg-[#0E0E13] border-2 border-[#D80027]/30 hover:border-[#D80027]/60 rounded-xl p-6 transition-all card-hover-lift relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D80027]/5 blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                      <p className="text-sm text-[#F3A81D] font-black uppercase tracking-wide">
                        {formatCompetitionRound(match.competition_round)} {match.group_name && `• ${formatGroupName(match.group_name)}`}
                      </p>
                      <p className="text-xs text-[#8A92A6] mt-1">{formatDate(match.kickoff_time)}</p>
                    </div>
                    <span className="px-4 py-2 bg-gradient-to-r from-[#D80027] to-[#8B0A1E] text-white text-xs font-black rounded-lg animate-pulse shadow-lg shadow-[#D80027]/30">
                      ● LIVE
                    </span>
                  </div>
                  
                  <div className="text-xl font-black text-white relative z-10">
                    {match.home_team} <span className="text-[#F3A81D] mx-2">{match.home_score ?? '-'}</span> - <span className="text-[#F3A81D] mx-2">{match.away_score ?? '-'}</span> {match.away_team}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finished Matches - Needs Scoring */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center border border-[#F3A81D]/20">
              <Clock className="w-5 h-5 text-[#F3A81D]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">Needs Scoring</h2>
              <p className="text-xs text-[#8A92A6]">{groupedMatches.finished.filter(m => !m.winner_announced).length} finished match{groupedMatches.finished.filter(m => !m.winner_announced).length !== 1 ? 'es' : ''} awaiting results</p>
            </div>
          </div>

          <div className="space-y-6">
            {groupedMatches.finished
              .filter(m => !m.winner_announced)
              .map(match => (
                <div
                  key={match.id}
                  className="bg-[#0E0E13] border-2 border-[#F3A81D]/20 hover:border-[#F3A81D]/50 rounded-xl p-6 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#F3A81D]/5 blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="mb-4 relative z-10">
                    <p className="text-sm text-[#F3A81D] font-black uppercase tracking-wide">
                      {formatCompetitionRound(match.competition_round)} {match.group_name && `• ${formatGroupName(match.group_name)}`}
                    </p>
                    <p className="text-xs text-[#8A92A6] mt-1">{formatDate(match.kickoff_time)}</p>
                  </div>
                  
                  <div className="text-xl font-black text-white mb-6 relative z-10">
                    {match.home_team} vs {match.away_team}
                  </div>
                  
                  <div className="relative z-10">
                    <ScoreMatchForm match={match} />
                  </div>
                </div>
              ))}
            
            {groupedMatches.finished.filter(m => !m.winner_announced).length === 0 && (
              <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#009A44]/10 flex items-center justify-center mx-auto mb-4 border border-[#009A44]/20">
                  <CheckCircle2 className="w-8 h-8 text-[#009A44]" />
                </div>
                <p className="text-lg font-black text-white mb-2">All Caught Up!</p>
                <p className="text-sm text-[#8A92A6]">No finished matches need scoring at this time</p>
              </div>
            )}
          </div>
        </div>

        {/* Already Scored Matches */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#009A44]/10 flex items-center justify-center border border-[#009A44]/20">
              <CheckCircle2 className="w-5 h-5 text-[#009A44]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">Already Scored</h2>
              <p className="text-xs text-[#8A92A6]">{groupedMatches.finished.filter(m => m.winner_announced).length} completed match{groupedMatches.finished.filter(m => m.winner_announced).length !== 1 ? 'es' : ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedMatches.finished
              .filter(m => m.winner_announced)
              .map(match => (
                <div
                  key={match.id}
                  className="bg-[#0E0E13] border border-white/5 hover:border-[#009A44]/30 rounded-xl p-5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#009A44]/5 blur-2xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <p className="text-xs text-[#8A92A6] mb-2 relative z-10">
                    {formatCompetitionRound(match.competition_round)} {match.group_name && `• ${formatGroupName(match.group_name)}`}
                  </p>
                  <p className="text-sm font-bold text-white mb-1 relative z-10">
                    {match.home_team} <span className="text-[#F3A81D] font-black mx-1">{match.home_score}</span> - <span className="text-[#F3A81D] font-black mx-1">{match.away_score}</span> {match.away_team}
                  </p>
                  <div className="flex items-center gap-2 mt-3 relative z-10">
                    <CheckCircle2 className="w-4 h-4 text-[#009A44]" />
                    <span className="text-xs text-[#009A44] font-bold">Scored</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#0052B4]/10 flex items-center justify-center border border-[#0052B4]/20">
              <Calendar className="w-5 h-5 text-[#0052B4]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">Upcoming Matches</h2>
              <p className="text-xs text-[#8A92A6]">{groupedMatches.upcoming.length} scheduled match{groupedMatches.upcoming.length !== 1 ? 'es' : ''}</p>
            </div>
          </div>

          <details className="bg-[#0E0E13] border border-white/5 hover:border-[#0052B4]/30 rounded-xl p-6 transition-all cursor-pointer group">
            <summary className="font-bold text-[#C1C5D0] hover:text-[#0052B4] transition-colors list-none flex items-center justify-between">
              <span>Show all upcoming matches ({groupedMatches.upcoming.length})</span>
              <span className="text-[#0052B4] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-6 space-y-2 pt-6 border-t border-white/5">
              {groupedMatches.upcoming.slice(0, 20).map(match => (
                <div key={match.id} className="text-sm text-[#8A92A6] hover:text-[#C1C5D0] transition-colors py-2">
                  <span className="text-[#0052B4] font-bold">{formatDate(match.kickoff_time)}</span> • {match.home_team} vs {match.away_team}
                </div>
              ))}
              {groupedMatches.upcoming.length > 20 && (
                <p className="text-xs text-[#8A92A6] italic pt-2">
                  ... and {groupedMatches.upcoming.length - 20} more upcoming matches
                </p>
              )}
            </div>
          </details>
        </div>

      </div>
    </div>
  )
}
