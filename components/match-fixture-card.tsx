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
    date: date.toLocaleString('en-US', dateOptions),
    time: date.toLocaleString('en-US', timeOptions),
    venue: '', // We'll use match.venue separately
  }
}

export function MatchFixtureCard({ match, showGroupBadge = true, isClickable = true, linkPrefix = '/matches' }: MatchFixtureCardProps) {
  const { date, time } = formatFixtureDateTime(match.kickoff_time)
  const hasScore = match.status === 'finished' || match.status === 'live'
  const formattedGroupName = formatGroupName(match.group_name)
  
  const CardContent = (
    <div className="match-fixture-card group relative">
      {/* Group Badge - Top Right */}
      {showGroupBadge && formattedGroupName && (
        <div className="absolute top-2 right-2 z-20">
          <span className="inline-block px-3 py-1 bg-[#00FF85] text-black text-[10px] font-black uppercase tracking-wider rounded shadow-lg">
            {formattedGroupName}
          </span>
        </div>
      )}
      
      {/* Date, Time & Venue */}
      <div className="match-fixture-header">
        <span className="text-sm font-bold">{date} {time}</span>
        {match.venue && (
          <>
            <span className="text-[#00FF85] mx-2">•</span>
            <span className="text-sm font-bold">{match.venue}</span>
          </>
        )}
      </div>
      
      {/* Match Details Bar */}
      <div className="match-fixture-content">
        {/* Home Team */}
        <div className="match-fixture-team match-fixture-team-home">
          <TeamLogoBadge
            src={match.home_team_logo}
            alt={match.home_team}
            teamName={match.home_team}
            size="lg"
            className="match-fixture-flag"
          />
          <span className="match-fixture-team-name">{match.home_team}</span>
        </div>
        
        {/* Score or VS */}
        <div className="match-fixture-score">
          {hasScore ? (
            <>
              <div className="match-fixture-score-box">
                {match.home_score ?? 0}
              </div>
              <span className="match-fixture-vs">V</span>
              <div className="match-fixture-score-box">
                {match.away_score ?? 0}
              </div>
            </>
          ) : (
            <>
              <div className="match-fixture-score-box match-fixture-score-box-empty">-</div>
              <span className="match-fixture-vs">V</span>
              <div className="match-fixture-score-box match-fixture-score-box-empty">-</div>
            </>
          )}
        </div>
        
        {/* Away Team */}
        <div className="match-fixture-team match-fixture-team-away">
          <span className="match-fixture-team-name match-fixture-team-name-away">{match.away_team}</span>
          <TeamLogoBadge
            src={match.away_team_logo}
            alt={match.away_team}
            teamName={match.away_team}
            size="lg"
            className="match-fixture-flag"
          />
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
