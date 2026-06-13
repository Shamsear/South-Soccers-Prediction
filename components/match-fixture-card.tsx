/**
 * Match Fixture Card Component
 * 
 * Displays match fixtures in a clean, horizontal card format
 * with date/time, teams, flags, and scores
 */

import Image from 'next/image'
import Link from 'next/link'
import type { Database } from '@/types/database'
import { TeamLogoBadge } from '@/components/team-logo-badge'
import { formatGroupName } from '@/lib/format-text'

type Match = Database['public']['Tables']['matches']['Row']

interface MatchFixtureCardProps {
  match: Match
  showGroupBadge?: boolean
  isClickable?: boolean
  linkPrefix?: '/matches' | '/public-matches'
}

/**
 * Format date and time for fixture display
 * Uses user's locale and timezone automatically
 */
function formatFixtureDateTime(isoString: string): { date: string; time: string; venue: string } {
  const date = new Date(isoString)
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  
  return {
    date: date.toLocaleString(undefined, dateOptions), // undefined = use browser's locale
    time: date.toLocaleString(undefined, timeOptions), // undefined = use browser's locale
    venue: '', // We'll use match.venue separately
  }
}

export function MatchFixtureCard({ match, showGroupBadge = true, isClickable = true, linkPrefix = '/matches' }: MatchFixtureCardProps) {
  const { date, time } = formatFixtureDateTime(match.kickoff_time)
  const hasScore = match.status === 'finished' || match.status === 'live'
  const formattedGroupName = formatGroupName(match.group_name)
  
  // Determine match result for highlighting
  let resultClass = ''
  let homeTeamClass = ''
  let awayTeamClass = ''
  let homeScoreClass = ''
  let awayScoreClass = ''
  
  if (match.status === 'finished' && match.home_score !== null && match.away_score !== null) {
    if (match.home_score > match.away_score) {
      resultClass = 'border-l-4 border-l-emerald-500'
      homeTeamClass = 'text-emerald-400'
      awayTeamClass = 'text-white'
      homeScoreClass = 'text-emerald-400'
      awayScoreClass = 'text-rose-400'
    } else if (match.away_score > match.home_score) {
      resultClass = 'border-r-4 border-r-emerald-500'
      homeTeamClass = 'text-white'
      awayTeamClass = 'text-emerald-400'
      homeScoreClass = 'text-rose-400'
      awayScoreClass = 'text-emerald-400'
    } else {
      resultClass = 'border-l-4 border-r-4 border-l-amber-500 border-r-amber-500'
      homeTeamClass = 'text-amber-400'
      awayTeamClass = 'text-amber-400'
      homeScoreClass = 'text-amber-400'
      awayScoreClass = 'text-amber-400'
    }
  } else {
    homeTeamClass = 'text-white'
    awayTeamClass = 'text-white'
    homeScoreClass = 'text-[#F3A81D]'
    awayScoreClass = 'text-[#F3A81D]'
  }
  
  const CardContent = (
    <div className={`bg-[#0E0E13] border-2 border-white/5 rounded-lg overflow-hidden hover:border-white/10 transition-colors ${resultClass}`}>
      <div className="relative isolate">
        {/* Group Badge */}
        {showGroupBadge && formattedGroupName && (
          <div className="absolute -top-0.5 right-1 md:top-1 md:right-2 z-20">
            <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-[#00FF85] text-black text-[8px] md:text-[10px] font-black uppercase tracking-wider rounded shadow-lg">
              {formattedGroupName}
            </span>
          </div>
        )}
        
        {/* Date, Time & Venue */}
        <div className="px-3 md:px-4 pt-2 md:pt-3 pb-1.5 md:pb-2 border-b border-white/5 bg-black/20">
          <div className="flex items-center justify-between text-[10px] md:text-xs">
            <span className="text-[#8A92A6] font-bold">{date} • {time}</span>
            {match.venue && <span className="text-[#8A92A6] font-bold truncate ml-2 hidden sm:inline">{match.venue}</span>}
          </div>
        </div>
        
        {/* Match Details */}
        <div className="px-3 md:px-4 py-2.5 md:py-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 md:gap-3 lg:gap-4">
            {/* Home Team */}
            <div className="w-full sm:flex-1 flex items-center gap-2 md:gap-3">
              <TeamLogoBadge
                src={match.home_team_logo}
                alt={match.home_team}
                teamName={match.home_team}
                size="sm"
                className="md:!w-10 md:!h-10"
              />
              <span className={`text-xs md:text-sm font-black uppercase flex-1 break-words ${homeTeamClass}`}>{match.home_team}</span>
            </div>
            
            {/* Score or VS */}
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 flex-shrink-0">
              {hasScore ? (
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className={`text-lg md:text-xl font-black ${homeScoreClass}`}>{match.home_score ?? 0}</span>
                  <span className="text-xs md:text-sm text-[#8A92A6] font-bold">-</span>
                  <span className={`text-lg md:text-xl font-black ${awayScoreClass}`}>{match.away_score ?? 0}</span>
                </div>
              ) : (
                <span className="text-xs md:text-sm text-[#8A92A6] font-black">VS</span>
              )}
            </div>
            
            {/* Away Team */}
            <div className="w-full sm:flex-1 flex items-center gap-2 md:gap-3 sm:justify-end">
              <span className={`text-xs md:text-sm font-black uppercase flex-1 break-words text-right ${awayTeamClass}`}>{match.away_team}</span>
              <TeamLogoBadge
                src={match.away_team_logo}
                alt={match.away_team}
                teamName={match.away_team}
                size="sm"
                className="md:!w-10 md:!h-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  if (isClickable) {
    return (
      <Link href={`${linkPrefix}/${match.id}`} className="block">
        {CardContent}
      </Link>
    )
  }
  
  return CardContent
}
