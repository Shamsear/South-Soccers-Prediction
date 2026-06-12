/**
 * Public Matches Page (FIFA World Cup 2026 Edition)
 * 
 * Public page showing all matches with filters (all, upcoming, live, completed),
 * using host-country themed ticket cards.
 */

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { Calendar, MapPin, Users, Filter } from 'lucide-react'
import { TeamLogoBadge } from '@/components/team-logo-badge'

export const metadata: Metadata = {
  title: 'All Matches | South Soccers Prediction League',
  description: 'View all FIFA World Cup 2026 matches and predictions',
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

/**
 * Format kickoff time for display
 */
function formatKickoffTime(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return date.toLocaleString('en-US', options)
}

/**
 * Get match status
 */
function getMatchStatusBadge(match: Match) {
  if (match.status === 'finished') {
    return {
      text: 'Completed',
      className: 'bg-zinc-800/80 border border-zinc-700 text-zinc-400',
    }
  }

  if (match.status === 'live') {
    return {
      text: 'LIVE',
      className: 'bg-[#D80027]/25 border-2 border-[#D80027] text-white animate-pulse-glow font-black',
      isLive: true,
    }
  }

  return {
    text: 'Upcoming',
    className: 'bg-[#F3A81D]/15 border border-[#F3A81D]/55 text-[#F3A81D]',
  }
}

/**
 * Dynamically color-code ticket based on match venue host country
 */
function getHostCountryClass(venue: string | null): string {
  if (!venue) return 'ticket-gold'
  const v = venue.toLowerCase()
  if (v.includes('canada') || v.includes('toronto') || v.includes('vancouver')) {
    return 'ticket-canada'
  }
  if (v.includes('mexico') || v.includes('monterrey') || v.includes('guadalajara') || v.includes('azteca')) {
    return 'ticket-mexico'
  }
  return 'ticket-usa'
}

export default async function PublicMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const supabase = await createServerClient()
  const params = await searchParams
  const filter = params.filter || 'all'

  // Build query
  let query = supabase
    .from('matches')
    .select(`
      *,
      predictions (
        *,
        profiles (
          id,
          username,
          avatar_url
        )
      )
    `)
    .order('kickoff_time', { ascending: true })

  // Apply filters
  if (filter === 'upcoming') {
    query = query.eq('status', 'upcoming')
  } else if (filter === 'live') {
    query = query.eq('status', 'live')
  } else if (filter === 'completed') {
    query = query.eq('status', 'finished')
  }

  const { data: matches, error } = await query

  if (error) {
    console.error('Error fetching matches:', error)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#D80027] font-black uppercase">Failed to load matches. Please try again.</p>
      </div>
    )
  }

  const typedMatches = matches as unknown as MatchWithPredictions[]

  // Counts for filters (using a baseline query for all counts would be better, but count calculations on current result is fine for visual)
  const { data: countData } = await supabase
    .from('matches')
    .select('status')

  const totalCount = countData?.length || 0
  const upcomingCount = countData?.filter(m => m.status === 'upcoming').length || 0
  const liveCount = countData?.filter(m => m.status === 'live').length || 0
  const completedCount = countData?.filter(m => m.status === 'finished').length || 0

  const filters = [
    { value: 'all', label: 'All Matches', count: totalCount },
    { value: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { value: 'live', label: 'Live', count: liveCount },
    { value: 'completed', label: 'Completed', count: completedCount },
  ]

  return (
    <div className="relative min-h-screen bg-[#030306] py-16 overflow-hidden">
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white mb-4 uppercase tracking-tight">
            All Matches & Predictions
          </h1>
          <p className="text-[#C1C5D0] text-base max-w-xl mx-auto font-medium">
            Explore live matches, scores, and predictions from all league participants.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap gap-4 justify-center">
          {filters.map(f => {
            const isActive = filter === f.value
            return (
              <Link
                key={f.value}
                href={`/public-matches?filter=${f.value}`}
                className={`btn-tactile text-xs ${isActive ? 'btn-tactile-gold' : 'btn-tactile-outline'}`}
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {f.label}
                  <span className="bg-black/30 text-white border border-white/10 px-2 py-0.5 rounded text-[10px]">
                    {f.count}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>

        {/* No Matches */}
        {typedMatches.length === 0 && (
          <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded">
            <p className="text-[#8A92A6] text-base font-black uppercase">
              No {filter !== 'all' ? filter : ''} matches scheduled yet.
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {typedMatches.map(match => {
            const status = getMatchStatusBadge(match)
            const ticketHostClass = getHostCountryClass(match.venue)
            const showPredictions = match.status === 'live' || match.status === 'finished'
            const predictionCount = match.predictions?.length || 0

            return (
              <div
                key={match.id}
                className={`ticket-card ${ticketHostClass} p-6 flex flex-col justify-between`}
              >
                <div>
                  {/* Card Status Header */}
                  <div className="flex justify-between items-center mb-6">
                    <span className={`px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${status.className}`}>
                      {status.isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      )}
                      {status.text}
                    </span>
                    
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#8A92A6]">
                      <Users className="w-4 h-4 text-[#F3A81D]" />
                      <span>{predictionCount} Predictions</span>
                    </div>
                  </div>

                  {/* Teams info */}
                  <div className="space-y-4 mb-4">
                    {/* Home */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TeamLogoBadge
                          src={match.home_team_logo}
                          alt={match.home_team}
                          teamName={match.home_team}
                          size="md"
                        />
                        <span className="text-white font-black text-base uppercase tracking-wide">
                          {match.home_team}
                        </span>
                      </div>
                      {(match.status === 'finished' || match.status === 'live') && match.home_score !== null && (
                        <span className="text-3xl font-black text-[#F3A81D] tracking-tighter">
                          {match.home_score}
                        </span>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TeamLogoBadge
                          src={match.away_team_logo}
                          alt={match.away_team}
                          teamName={match.away_team}
                          size="md"
                        />
                        <span className="text-white font-black text-base uppercase tracking-wide">
                          {match.away_team}
                        </span>
                      </div>
                      {(match.status === 'finished' || match.status === 'live') && match.away_score !== null && (
                        <span className="text-3xl font-black text-[#F3A81D] tracking-tighter">
                          {match.away_score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ticket Divider */}
                <div className="ticket-divider" />

                {/* Details info */}
                <div className="space-y-4 mt-auto">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8A92A6] font-semibold border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#F3A81D]/80" />
                      <span>{formatKickoffTime(match.kickoff_time)}</span>
                    </div>
                    {match.venue && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#F3A81D]/80" />
                        <span className="truncate">{match.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Predictions list */}
                  {showPredictions && predictionCount > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-2">
                        User Predictions
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {match.predictions.map(pred => (
                          <div
                            key={pred.id}
                            className="flex items-center justify-between bg-black/40 rounded p-2.5 border border-white/5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded bg-[#161620] border border-white/10 flex items-center justify-center overflow-hidden">
                                {pred.profiles.avatar_url ? (
                                  <Image
                                    src={pred.profiles.avatar_url}
                                    alt={pred.profiles.username}
                                    width={28}
                                    height={28}
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-[#F3A81D] font-black text-xs">
                                    {pred.profiles.username[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-black uppercase text-white tracking-wide">
                                {pred.profiles.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white bg-black/60 px-2.5 py-0.5 rounded border border-white/10">
                                {pred.predicted_home} - {pred.predicted_away}
                              </span>
                              {pred.points_awarded !== null && (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm ${
                                  pred.points_awarded === 3
                                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/35'
                                    : pred.points_awarded === 1
                                    ? 'bg-amber-950/50 text-amber-400 border border-amber-500/35'
                                    : 'bg-rose-950/50 text-rose-400 border border-rose-500/35'
                                }`}>
                                  +{pred.points_awarded} PTS
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming predictions locked info */}
                  {match.status === 'upcoming' && (
                    <div className="bg-black/30 border border-white/5 rounded p-3 text-center">
                      <p className="text-xs font-black text-[#F3A81D]/80 uppercase tracking-widest">
                        🔒 Predictions Encrypted
                      </p>
                      <p className="text-[10px] text-[#8A92A6] font-semibold mt-1">
                        Locked until match kickoff to prevent copycat predictions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA signup */}
        <div className="mt-16 text-center bg-[#0E0E13] border-2 border-white/5 max-w-2xl mx-auto p-8 rounded shadow-2xl">
          <h3 className="text-2xl font-black text-[#F3A81D] mb-3 uppercase tracking-wide">
            Think you can do better?
          </h3>
          <p className="text-[#C1C5D0] mb-8 text-sm max-w-md mx-auto">
            Create an account, submit predictions for all matches, and rise through the ranks.
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
