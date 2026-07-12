'use client'

/**
 * Match Card with Expandable Predictions
 * 
 * Shows match details with expand/collapse functionality to view all predictions
 */

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Users, Trophy, Target } from 'lucide-react'
import { TeamLogoBadge } from '@/components/team-logo-badge'
import { formatGroupName } from '@/lib/format-text'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface PredictionWithUser extends Prediction {
  profiles: Profile
}

interface MatchWithPredictionsCardProps {
  match: Match
  predictions: PredictionWithUser[]
  currentUserId?: string
}

function formatFixtureDateTime(isoString: string): { date: string; time: string } {
  const date = new Date(isoString)
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  
  return {
    date: date.toLocaleString(undefined, dateOptions), // undefined = use browser's locale
    time: date.toLocaleString(undefined, timeOptions), // undefined = use browser's locale
  }
}

export function MatchWithPredictionsCard({ 
  match, 
  predictions, 
  currentUserId 
}: MatchWithPredictionsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { date, time } = formatFixtureDateTime(match.kickoff_time)
  const hasScore = match.status === 'finished' || match.status === 'live'
  const formattedGroupName = formatGroupName(match.group_name)
  
  // Determine match result for highlighting
  let borderStyle = ''
  let homeTeamClass = ''
  let awayTeamClass = ''
  let homeScoreClass = ''
  let awayScoreClass = ''
  
  if (match.status === 'finished' && match.home_score !== null && match.away_score !== null) {
    if (match.home_score > match.away_score) {
      borderStyle = 'border-l-emerald-500 border-r-white/5'
      homeTeamClass = 'text-emerald-400'
      awayTeamClass = 'text-white'
      homeScoreClass = 'text-emerald-400'
      awayScoreClass = 'text-rose-400'
    } else if (match.away_score > match.home_score) {
      borderStyle = 'border-l-white/5 border-r-emerald-500'
      homeTeamClass = 'text-white'
      awayTeamClass = 'text-emerald-400'
      homeScoreClass = 'text-rose-400'
      awayScoreClass = 'text-emerald-400'
    } else {
      borderStyle = 'border-l-amber-500 border-r-amber-500'
      homeTeamClass = 'text-amber-400'
      awayTeamClass = 'text-amber-400'
      homeScoreClass = 'text-amber-400'
      awayScoreClass = 'text-amber-400'
    }
  } else {
    borderStyle = 'border-l-white/5 border-r-white/5'
    homeTeamClass = 'text-white'
    awayTeamClass = 'text-white'
    homeScoreClass = 'text-[#F3A81D]'
    awayScoreClass = 'text-[#F3A81D]'
  }
  
  // Sort predictions by points (for finished matches) or creation time
  const sortedPredictions = [...predictions].sort((a, b) => {
    if (match.status === 'finished' && a.points_awarded !== null && b.points_awarded !== null) {
      return b.points_awarded - a.points_awarded
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  // Filter out predictions with missing profiles
  const validPredictions = sortedPredictions.filter(p => p.profiles)

  return (
    <div className={`bg-[#0E0E13] border-y-2 border-y-white/5 border-l-4 border-r-4 ${borderStyle} rounded-lg hover:border-y-white/10 transition-colors relative`}>
      {/* Match Header - Always Visible */}
      <div className="relative isolate overflow-hidden rounded-t-lg">
        {/* Group Badge */}
        {formattedGroupName && (
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
        
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 md:px-4 py-2 md:py-3 border-t border-white/5 bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <Users className="w-3 h-3 md:w-4 md:h-4 text-[#F3A81D]" />
            <span className="text-xs md:text-sm font-black text-white uppercase">
              {match.status === 'finished' ? 'View Results' : 'View Predictions'}
            </span>
            <span className="text-[10px] md:text-xs text-[#8A92A6] font-bold">({validPredictions.length})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-[#F3A81D]" />
          ) : (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-[#8A92A6]" />
          )}
        </button>
      </div>
      
      {/* Predictions List - Expandable */}
      {isExpanded && (
        <div className="border-t-2 border-white/5 bg-black/40 p-3 md:p-4 rounded-b-lg">
          {validPredictions.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Target className="w-8 h-8 md:w-10 md:h-10 text-[#8A92A6]/40 mx-auto mb-2 md:mb-3" />
              <p className="text-[#8A92A6] text-xs md:text-sm font-bold">No predictions yet</p>
            </div>
          ) : (
            <div className="space-y-1.5 md:space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 md:pr-2">
              {validPredictions.map((pred, index) => {
                const isCurrentUser = currentUserId && pred.profiles.id === currentUserId
                
                return (
                  <div
                    key={pred.id}
                    className={`flex items-center justify-between bg-black/40 border rounded-lg p-2 md:p-3 transition-colors ${
                      isCurrentUser 
                        ? 'border-[#F3A81D]/40 bg-[#F3A81D]/5 ring-1 ring-[#F3A81D]/20' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
                      {match.status === 'finished' && pred.points_awarded !== null && index < 3 && (
                        <div className="text-sm md:text-lg flex-shrink-0">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                        </div>
                      )}
                      
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[#161620] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {pred.profiles.avatar_url ? (
                          <Image
                            src={pred.profiles.avatar_url}
                            alt={pred.profiles.username}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[#F3A81D] font-black text-[10px] md:text-xs">
                            {pred.profiles.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 md:gap-1.5">
                          <p className="text-[10px] md:text-xs font-black text-white uppercase truncate">
                            {pred.profiles.username}
                          </p>
                          {isCurrentUser && (
                            <span className="px-1 py-0.5 md:px-1.5 bg-[#F3A81D]/20 border border-[#F3A81D]/40 text-[#F3A81D] text-[7px] md:text-[8px] font-black uppercase tracking-wider rounded flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prediction and Points */}
                    <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xs md:text-sm font-black text-white bg-black/60 px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-white/10">
                          {pred.predicted_home} - {pred.predicted_away}
                          {pred.predicted_penalty_winner && (
                            <span className="text-[8px] md:text-[9px] text-[#F3A81D] block mt-0.5 font-bold">
                              Pens: {pred.predicted_penalty_winner === 'home' ? match.home_team : match.away_team}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Points - show if match is finished */}
                      {match.status === 'finished' && (
                        pred.points_awarded !== null ? (
                          <div className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border text-center min-w-[40px] md:min-w-[50px] ${
                            pred.points_awarded > 0
                              ? 'bg-emerald-950/50 border-emerald-500/35 text-emerald-400'
                              : 'bg-rose-950/50 border-rose-500/35 text-rose-400'
                          }`}>
                            <p className="text-[10px] md:text-xs font-black">
                              {pred.points_awarded === 0 ? '0' : `+${pred.points_awarded}`}
                            </p>
                          </div>
                        ) : (
                          <div className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-[#8A92A6]/20 bg-[#8A92A6]/5 text-center min-w-[40px] md:min-w-[50px]">
                            <p className="text-[10px] md:text-xs font-black text-[#8A92A6]">-</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
