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
    date: date.toLocaleString('en-US', dateOptions),
    time: date.toLocaleString('en-US', timeOptions),
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
    <div className="bg-[#0E0E13] border-2 border-white/5 rounded-lg overflow-hidden hover:border-white/10 transition-colors">
      {/* Match Header - Always Visible */}
      <div className="relative">
        {/* Group Badge */}
        {formattedGroupName && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-block px-3 py-1 bg-[#00FF85] text-black text-[10px] font-black uppercase tracking-wider rounded shadow-lg">
              {formattedGroupName}
            </span>
          </div>
        )}
        
        {/* Date, Time & Venue */}
        <div className="px-4 pt-3 pb-2 border-b border-white/5 bg-black/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A92A6] font-bold">{date} • {time}</span>
            {match.venue && <span className="text-[#8A92A6] font-bold truncate ml-2">{match.venue}</span>}
          </div>
        </div>
        
        {/* Match Details */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex-1 flex items-center gap-3">
              <TeamLogoBadge
                src={match.home_team_logo}
                alt={match.home_team}
                teamName={match.home_team}
                size="md"
              />
              <span className="text-sm font-black text-white uppercase truncate">{match.home_team}</span>
            </div>
            
            {/* Score or VS */}
            <div className="flex items-center gap-2 px-3">
              {hasScore ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#F3A81D]">{match.home_score ?? 0}</span>
                  <span className="text-sm text-[#8A92A6] font-bold">-</span>
                  <span className="text-xl font-black text-[#F3A81D]">{match.away_score ?? 0}</span>
                </div>
              ) : (
                <span className="text-sm text-[#8A92A6] font-black">VS</span>
              )}
            </div>
            
            {/* Away Team */}
            <div className="flex-1 flex items-center gap-3 justify-end">
              <span className="text-sm font-black text-white uppercase truncate text-right">{match.away_team}</span>
              <TeamLogoBadge
                src={match.away_team_logo}
                alt={match.away_team}
                teamName={match.away_team}
                size="md"
              />
            </div>
          </div>
        </div>
        
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 border-t border-white/5 bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F3A81D]" />
            <span className="text-sm font-black text-white uppercase">
              {match.status === 'finished' ? 'View Results' : 'View Predictions'}
            </span>
            <span className="text-xs text-[#8A92A6] font-bold">({validPredictions.length})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#F3A81D]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#8A92A6]" />
          )}
        </button>
      </div>
      
      {/* Predictions List - Expandable */}
      {isExpanded && (
        <div className="border-t-2 border-white/5 bg-black/40 p-4">
          {validPredictions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-[#8A92A6]/40 mx-auto mb-3" />
              <p className="text-[#8A92A6] text-sm font-bold">No predictions yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {validPredictions.map((pred, index) => {
                const isCurrentUser = currentUserId && pred.profiles.id === currentUserId
                
                return (
                  <div
                    key={pred.id}
                    className={`flex items-center justify-between bg-black/40 border rounded-lg p-3 transition-colors ${
                      isCurrentUser 
                        ? 'border-[#F3A81D]/40 bg-[#F3A81D]/5 ring-1 ring-[#F3A81D]/20' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {match.status === 'finished' && pred.points_awarded !== null && index < 3 && (
                        <div className="text-lg flex-shrink-0">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                        </div>
                      )}
                      
                      <div className="w-8 h-8 rounded-lg bg-[#161620] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {pred.profiles.avatar_url ? (
                          <Image
                            src={pred.profiles.avatar_url}
                            alt={pred.profiles.username}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[#F3A81D] font-black text-xs">
                            {pred.profiles.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-white uppercase truncate">
                            {pred.profiles.username}
                          </p>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 bg-[#F3A81D]/20 border border-[#F3A81D]/40 text-[#F3A81D] text-[8px] font-black uppercase tracking-wider rounded flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prediction and Points */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-black text-white bg-black/60 px-2 py-1 rounded border border-white/10">
                          {pred.predicted_home} - {pred.predicted_away}
                        </p>
                      </div>

                      {/* Points - show if match is finished */}
                      {match.status === 'finished' && (
                        pred.points_awarded !== null ? (
                          <div className={`px-2 py-1 rounded-lg border text-center min-w-[50px] ${
                            pred.points_awarded === 3
                              ? 'bg-emerald-950/50 border-emerald-500/35 text-emerald-400'
                              : pred.points_awarded === 1
                              ? 'bg-amber-950/50 border-amber-500/35 text-amber-400'
                              : 'bg-rose-950/50 border-rose-500/35 text-rose-400'
                          }`}>
                            <p className="text-xs font-black">
                              {pred.points_awarded === 0 ? '0' : `+${pred.points_awarded}`}
                            </p>
                          </div>
                        ) : (
                          <div className="px-2 py-1 rounded-lg border border-[#8A92A6]/20 bg-[#8A92A6]/5 text-center min-w-[50px]">
                            <p className="text-xs font-black text-[#8A92A6]">-</p>
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
