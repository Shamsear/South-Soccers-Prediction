/**
 * Public Match Detail Page (FIFA World Cup 2026 Edition)
 * 
 * Public page showing match details without authentication required
 * Similar to authenticated match detail but shows CTA to sign in
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'
import { CountdownTimer } from '@/components/countdown-timer'
import { TeamLogoBadge } from '@/components/team-logo-badge'
import { PublicPredictionsList } from '@/components/public-predictions-list'
import { formatCompetitionRound, formatGroupName } from '@/lib/format-text'
import type { Database } from '@/types/database'
import { ChevronLeft, Calendar, MapPin, LogIn } from 'lucide-react'

type Match = Database['public']['Tables']['matches']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface PredictionWithUser extends Prediction {
  profiles: Profile
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createPublicClient()
  
  const { data: match } = await supabase
    .from('matches')
    .select('home_team, away_team')
    .eq('id', id)
    .single()

  const typedMatch = match as { home_team: string; away_team: string } | null

  if (!typedMatch) {
    return {
      title: 'Match Not Found | South Soccers',
    }
  }

  return {
    title: `${typedMatch.home_team} vs ${typedMatch.away_team} | South Soccers`,
    description: `View match details for ${typedMatch.home_team} vs ${typedMatch.away_team} - FIFA World Cup 2026`,
  }
}

function formatMatchDate(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return date.toLocaleString('en-US', options)
}

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

export default async function PublicMatchDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createPublicClient()

  // Fetch match details (public access)
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (matchError || !match) {
    console.error('Error fetching match:', matchError)
    notFound()
  }

  type Match = {
    id: string
    home_team: string
    away_team: string
    home_team_logo: string | null
    away_team_logo: string | null
    home_score: number | null
    away_score: number | null
    status: 'upcoming' | 'live' | 'finished'
    kickoff_time: string
    competition_round: string
    group_name: string | null
    venue: string | null
    [key: string]: any
  }

  const typedMatch = match as Match

  // Fetch ALL predictions for this match (public access)
  const { data: predictions } = await supabase
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
    .eq('match_id', typedMatch.id)
    .order('created_at', { ascending: false })

  const allPredictions = (predictions || []) as unknown as PredictionWithUser[]

  // Check if match is locked
  const now = new Date()
  const kickoff = new Date(typedMatch.kickoff_time)
  const isLocked = kickoff <= now

  const ticketHostClass = getHostCountryClass(typedMatch.venue)

  return (
    <div className="relative min-h-screen bg-[#030306] py-12 overflow-hidden">
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/public-matches"
            className="btn-tactile btn-tactile-outline text-[11px] py-2 px-4 flex items-center gap-1.5 w-max"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Matches
          </Link>
        </div>

        {/* Match Card */}
        <div className={`ticket-card ${ticketHostClass} p-6 md:p-10 mb-8`}>
          
          {/* Round & Status */}
          <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-black/60 border border-white/10 text-[#F3A81D] text-[10px] font-black uppercase tracking-wider rounded-sm">
                {formatCompetitionRound(typedMatch.competition_round)}
              </span>
              {typedMatch.group_name && (
                <span className="text-[#8A92A6] font-black text-xs uppercase tracking-widest">
                  {formatGroupName(typedMatch.group_name)}
                </span>
              )}
            </div>
            
            {typedMatch.status === 'live' && (
              <span className="px-3.5 py-1 bg-[#D80027]/25 border-2 border-[#D80027] text-white text-xs font-black uppercase tracking-widest animate-pulse rounded-sm">
                🔴 LIVE
              </span>
            )}
            {typedMatch.status === 'finished' && (
              <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-black uppercase tracking-wider rounded-sm">
                Finished
              </span>
            )}
          </div>

          {/* Teams Display */}
          <div className="flex flex-row items-center justify-between gap-4 md:gap-8 mb-10">
            
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="mb-4">
                <TeamLogoBadge
                  src={typedMatch.home_team_logo}
                  alt={typedMatch.home_team}
                  teamName={typedMatch.home_team}
                  size="xl"
                />
              </div>
              <h2 className="text-base md:text-xl font-black text-white leading-tight uppercase tracking-wider">
                {typedMatch.home_team}
              </h2>
              {typedMatch.status === 'finished' && typedMatch.home_score !== null && (
                <div className="text-4xl md:text-6xl font-black text-[#F3A81D] mt-3 font-heading tracking-tighter">
                  {typedMatch.home_score}
                </div>
              )}
            </div>

            {/* VS Separator */}
            <div className="flex flex-col items-center justify-center min-w-[50px]">
              {typedMatch.status === 'live' ? (
                <div className="flex items-center gap-1.5 bg-[#D80027]/20 border border-[#D80027]/40 px-3.5 py-1.5 rounded text-sm font-black text-[#D80027]">
                  {typedMatch.home_score ?? 0} - {typedMatch.away_score ?? 0}
                </div>
              ) : (
                <span className="text-[#8A92A6]/40 text-xl md:text-2xl font-black font-heading">VS</span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="mb-4">
                <TeamLogoBadge
                  src={typedMatch.away_team_logo}
                  alt={typedMatch.away_team}
                  teamName={typedMatch.away_team}
                  size="xl"
                />
              </div>
              <h2 className="text-base md:text-xl font-black text-white leading-tight uppercase tracking-wider">
                {typedMatch.away_team}
              </h2>
              {typedMatch.status === 'finished' && typedMatch.away_score !== null && (
                <div className="text-4xl md:text-6xl font-black text-[#F3A81D] mt-3 font-heading tracking-tighter">
                  {typedMatch.away_score}
                </div>
              )}
            </div>

          </div>

          {/* Ticket Divider */}
          <div className="ticket-divider" />

          {/* Venue and Time */}
          <div className="pt-4 space-y-3 flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#C1C5D0] font-semibold">
              <Calendar className="w-4 h-4 text-[#F3A81D]" />
              <span>{formatMatchDate(typedMatch.kickoff_time)}</span>
            </div>
            {typedMatch.venue && (
              <div className="flex items-center gap-2 text-xs md:text-sm text-[#C1C5D0] font-semibold">
                <MapPin className="w-4 h-4 text-[#F3A81D]" />
                <span>{typedMatch.venue}</span>
              </div>
            )}
          </div>

          {/* Countdown Timer */}
          {typedMatch.status === 'upcoming' && !isLocked && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <CountdownTimer kickoffTime={typedMatch.kickoff_time} />
            </div>
          )}

        </div>

        {/* Show all predictions to everyone (always show, handles empty state) */}
        <div className="mb-8">
          <PublicPredictionsList 
            predictions={allPredictions as any} 
            matchStatus={typedMatch.status}
          />
        </div>

        {/* CTA to Sign In */}
        <div className="bg-[#0E0E13] border-2 border-white/5 p-8 md:p-12 rounded-xl shadow-2xl text-center">
          <div className="max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#D80027] flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">
              Want to Make a Prediction?
            </h3>
            
            <p className="text-[#C1C5D0] mb-8 text-sm">
              Sign in to submit your score prediction for this match and compete with other fans for points and glory!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="btn-tactile btn-tactile-gold text-xs px-8 w-full sm:w-auto">
                  Register Free
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-tactile btn-tactile-outline text-xs px-8 w-full sm:w-auto">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
