'use client'

/**
 * Public Predictions List Component
 * 
 * Displays all user predictions for a match (read-only)
 * Visible to everyone regardless of authentication or match state
 */

import { useState } from 'react'
import Image from 'next/image'
import { Search, Users, Trophy, Target } from 'lucide-react'

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  full_name: string | null
}

interface Prediction {
  id: string
  predicted_home: number
  predicted_away: number
  points_awarded: number | null
  created_at: string
  profiles: Profile
}

interface PublicPredictionsListProps {
  predictions: Prediction[]
  matchStatus: 'upcoming' | 'live' | 'finished'
  currentUserId?: string // Optional: to highlight current user's prediction
}

export function PublicPredictionsList({ predictions, matchStatus, currentUserId }: PublicPredictionsListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Sort by points if match is finished, otherwise by created_at
  const sortedPredictions = [...predictions].sort((a, b) => {
    if (matchStatus === 'finished' && a.points_awarded !== null && b.points_awarded !== null) {
      return b.points_awarded - a.points_awarded
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const filteredPredictions = sortedPredictions.filter((pred) =>
    pred.profiles && (
      pred.profiles.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="bg-[#0E0E13] border-2 border-white/5 p-4 md:p-6 lg:p-10 rounded shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          {matchStatus === 'finished' ? (
            <Trophy className="w-4 h-4 md:w-6 md:h-6 text-[#F3A81D]" />
          ) : (
            <Target className="w-4 h-4 md:w-6 md:h-6 text-[#F3A81D]" />
          )}
          <h3 className="text-base md:text-xl lg:text-2xl font-black text-white uppercase tracking-wide">
            {matchStatus === 'finished' ? 'Final Results' : 'All Predictions'}
          </h3>
          <span className="text-xs md:text-sm text-[#8A92A6] font-bold">
            ({predictions.length})
          </span>
        </div>
      </div>

      {/* Search Bar */}
      {predictions.length > 5 && (
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-[#8A92A6]" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-[#8A92A6] focus:border-[#F3A81D] focus:outline-none transition-colors text-xs md:text-sm"
            />
          </div>
        </div>
      )}

      {/* Predictions List */}
      {filteredPredictions.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <Users className="w-8 h-8 md:w-12 md:h-12 text-[#8A92A6]/40 mx-auto mb-3 md:mb-4" />
          <p className="text-[#8A92A6] font-bold uppercase text-xs md:text-sm">
            {predictions.length === 0 ? 'No predictions yet' : 'No matching predictions found'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-1 md:pr-2">
          {filteredPredictions.map((pred, index) => {
            // Skip predictions with missing profile data
            if (!pred.profiles) return null
            
            const isCurrentUser = currentUserId && pred.profiles.id === currentUserId
            
            return (
              <div
                key={pred.id}
                className={`flex items-center justify-between bg-black/40 border rounded-lg p-2.5 md:p-4 hover:border-[#F3A81D]/20 transition-colors ${
                  isCurrentUser 
                    ? 'border-[#F3A81D]/40 bg-[#F3A81D]/5 ring-1 md:ring-2 ring-[#F3A81D]/20' 
                    : 'border-white/5'
                }`}
              >
                {/* User Info */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  {matchStatus === 'finished' && pred.points_awarded !== null && index < 3 && (
                    <div className="text-base md:text-2xl flex-shrink-0">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </div>
                  )}
                  
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#161620] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {pred.profiles.avatar_url ? (
                      <Image
                        src={pred.profiles.avatar_url}
                        alt={pred.profiles.username}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[#F3A81D] font-black text-xs md:text-sm">
                        {pred.profiles.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 md:gap-2">
                      <p className="text-xs md:text-sm font-black text-white uppercase truncate">
                        {pred.profiles.username}
                      </p>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 md:px-2 bg-[#F3A81D]/20 border border-[#F3A81D]/40 text-[#F3A81D] text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded flex-shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    {pred.profiles.full_name && (
                      <p className="text-[10px] md:text-xs text-[#8A92A6] truncate hidden sm:block">{pred.profiles.full_name}</p>
                    )}
                  </div>
                </div>

                {/* Prediction and Points */}
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-[9px] md:text-xs text-[#8A92A6] uppercase font-bold mb-0.5 md:mb-1">Score</p>
                    <p className="text-sm md:text-lg font-black text-white bg-black/60 px-2 py-0.5 md:px-3 md:py-1 rounded border border-white/10">
                      {pred.predicted_home} - {pred.predicted_away}
                    </p>
                  </div>

                  {/* Points - show if match is finished (including 0 points) */}
                  {matchStatus === 'finished' && (
                    pred.points_awarded !== null ? (
                      <div className={`px-2 py-1 md:px-3 md:py-2 rounded-lg border text-center min-w-[50px] md:min-w-[70px] ${
                        pred.points_awarded > 0
                          ? 'bg-emerald-950/50 border-emerald-500/35 text-emerald-400'
                          : 'bg-rose-950/50 border-rose-500/35 text-rose-400'
                      }`}>
                        <p className="text-[9px] md:text-xs font-bold uppercase mb-0.5">Points</p>
                        <p className="text-base md:text-xl font-black">{pred.points_awarded === 0 ? '0' : `+${pred.points_awarded}`}</p>
                      </div>
                    ) : (
                      <div className="px-2 py-1 md:px-3 md:py-2 rounded-lg border border-[#8A92A6]/20 bg-[#8A92A6]/5 text-center min-w-[50px] md:min-w-[70px]">
                        <p className="text-[9px] md:text-xs font-bold uppercase mb-0.5 text-[#8A92A6]">Points</p>
                        <p className="text-base md:text-xl font-black text-[#8A92A6]">-</p>
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
  )
}
