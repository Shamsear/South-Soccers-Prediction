'use client'

/**
 * Admin Predictions List Component
 * 
 * Client component for displaying all user predictions with search
 */

import { useState } from 'react'
import Image from 'next/image'
import { Search, Users } from 'lucide-react'

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
  predicted_penalty_winner?: string | null
  points_awarded: number | null
  created_at?: string
  profiles: Profile
}

interface AdminPredictionsListProps {
  predictions: Prediction[]
  homeTeam: string
  awayTeam: string
}

export function AdminPredictionsList({ predictions, homeTeam, awayTeam }: AdminPredictionsListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (a.points_awarded !== null && b.points_awarded !== null) {
      return b.points_awarded - a.points_awarded
    }
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return 0
  })

  const filteredPredictions = sortedPredictions.filter((pred) =>
    pred.profiles.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-[#0E0E13] border-2 border-white/5 p-6 md:p-10 rounded shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#F3A81D]" />
          <h3 className="text-2xl font-black text-white uppercase tracking-wide">
            All Predictions
          </h3>
          <span className="text-sm text-[#8A92A6] font-bold">
            ({predictions.length} total)
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8A92A6]" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-[#8A92A6] focus:border-[#F3A81D] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Predictions List */}
      {filteredPredictions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#8A92A6] font-bold uppercase">
            {predictions.length === 0 ? 'No predictions yet' : 'No matching predictions found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPredictions.map((pred) => (
            <div
              key={pred.id}
              className="flex items-center justify-between bg-black/40 border border-white/5 rounded-lg p-4 hover:border-[#F3A81D]/20 transition-colors"
            >
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#161620] border border-white/10 flex items-center justify-center overflow-hidden">
                  {pred.profiles.avatar_url ? (
                    <Image
                      src={pred.profiles.avatar_url}
                      alt={pred.profiles.username}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-[#F3A81D] font-black text-sm">
                      {pred.profiles.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase">
                    {pred.profiles.username}
                  </p>
                  {pred.profiles.full_name && (
                    <p className="text-xs text-[#8A92A6]">{pred.profiles.full_name}</p>
                  )}
                </div>
              </div>

              {/* Prediction */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-[#8A92A6] uppercase font-bold mb-1">Predicted</p>
                  <p className="text-lg font-black text-white bg-black/60 px-3 py-1 rounded border border-white/10">
                    {pred.predicted_home} - {pred.predicted_away}
                    {pred.predicted_penalty_winner && (
                      <span className="text-[10px] text-[#F3A81D] block mt-0.5 font-bold">
                        Pens: {pred.predicted_penalty_winner === 'home' ? homeTeam : awayTeam}
                      </span>
                    )}
                  </p>
                </div>

                {/* Points */}
                {pred.points_awarded !== null && (
                  <div className={`px-3 py-2 rounded-lg border text-center min-w-[70px] ${
                    pred.points_awarded > 0
                      ? 'bg-emerald-950/50 border-emerald-500/35 text-emerald-400'
                      : 'bg-rose-950/50 border-rose-500/35 text-rose-400'
                  }`}>
                    <p className="text-xs font-bold uppercase mb-0.5">Points</p>
                    <p className="text-xl font-black">+{pred.points_awarded}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
