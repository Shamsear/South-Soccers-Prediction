'use client'

/**
 * Leaderboard Table Component
 * 
 * Client component for displaying leaderboard with search functionality
 */

import { useState } from 'react'
import Image from 'next/image'
import { Search, Trophy, Crown, Medal } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  rank: number
  username: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  correct_predictions: number
  scored_count: number
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
  currentUserId: string | null
}

export function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  return (
    <div className="bg-[#0E0E13] border-2 border-white/5 rounded-xl shadow-2xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 md:p-6 border-b border-white/5">
        <div className="relative max-w-md">
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

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {filteredLeaderboard.length > 0 ? (
          <div className="p-3 space-y-2">
            {filteredLeaderboard.map((entry) => {
              const isCurrentUser = entry.id === currentUserId
              
              return (
                <div
                  key={entry.id}
                  className={`bg-black/40 border rounded-lg p-3 transition-all ${
                    isCurrentUser 
                      ? 'border-[#F3A81D] bg-[#F3A81D]/5 ring-1 ring-[#F3A81D]/20' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Top Row: Rank, Avatar, Player Info */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Rank with Medal */}
                    <div className="flex items-center gap-1 min-w-[50px]">
                      {entry.rank === 1 && <Crown className="w-4 h-4 text-[#F3A81D]" />}
                      {entry.rank === 2 && <Medal className="w-4 h-4 text-[#C0C0C0]" />}
                      {entry.rank === 3 && <Medal className="w-4 h-4 text-[#CD7F32]" />}
                      <span className={`text-base font-black ${
                        entry.rank === 1 ? 'text-[#F3A81D]' :
                        entry.rank === 2 ? 'text-[#C0C0C0]' :
                        entry.rank === 3 ? 'text-[#CD7F32]' :
                        'text-[#8A92A6]'
                      }`}>
                        #{entry.rank}
                      </span>
                    </div>
                    
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg border-2 border-white/10 bg-black/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {entry.avatar_url ? (
                        <Image
                          src={entry.avatar_url}
                          alt={entry.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-black text-[#F3A81D]">
                          {entry.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black uppercase tracking-wide truncate ${
                        isCurrentUser ? 'text-[#F3A81D]' : 'text-white'
                      }`}>
                        {entry.username}
                        {isCurrentUser && (
                          <span className="ml-1 text-[8px] font-normal">(You)</span>
                        )}
                      </p>
                      {entry.full_name && (
                        <p className="text-[9px] text-[#8A92A6] font-medium truncate">
                          {entry.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Bottom Row: Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="text-center flex-1">
                      <p className="text-[8px] text-[#8A92A6] uppercase font-bold mb-0.5">Points</p>
                      <p className="text-lg font-black text-[#F3A81D]">{entry.total_points}</p>
                    </div>
                    <div className="text-center flex-1 border-l border-white/5">
                      <p className="text-[8px] text-[#8A92A6] uppercase font-bold mb-0.5">Correct</p>
                      <p className="text-sm font-black text-[#009A44]">{entry.correct_predictions}</p>
                    </div>
                    <div className="text-center flex-1 border-l border-white/5">
                      <p className="text-[8px] text-[#8A92A6] uppercase font-bold mb-0.5">Predicts</p>
                      <p className="text-sm font-black text-[#0052B4]">{entry.scored_count}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-3 py-8 text-center">
            <p className="text-[#8A92A6] font-bold uppercase text-xs">
              {searchTerm ? 'No players found matching your search' : 'No players yet'}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black/40 border-b-2 border-white/10">
              <th className="px-6 py-4 text-left text-[11px] font-black text-[#8A92A6] uppercase tracking-wider w-24">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-[#8A92A6] uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-black text-[#8A92A6] uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-black text-[#8A92A6] uppercase tracking-wider">
                Correct Predictions
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-black text-[#8A92A6] uppercase tracking-wider">
                Predictions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaderboard.length > 0 ? (
              filteredLeaderboard.map((entry) => {
                const isCurrentUser = entry.id === currentUserId
                
                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-white/5 transition-all hover:bg-white/[0.02] ${
                      isCurrentUser ? 'bg-[#F3A81D]/5 border-l-4 border-l-[#F3A81D]' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.rank === 1 && <Crown className="w-5 h-5 text-[#F3A81D]" />}
                        {entry.rank === 2 && <Medal className="w-5 h-5 text-[#C0C0C0]" />}
                        {entry.rank === 3 && <Medal className="w-5 h-5 text-[#CD7F32]" />}
                        <span className={`text-lg font-black ${
                          entry.rank === 1 ? 'text-[#F3A81D]' :
                          entry.rank === 2 ? 'text-[#C0C0C0]' :
                          entry.rank === 3 ? 'text-[#CD7F32]' :
                          'text-[#8A92A6]'
                        }`}>
                          #{entry.rank}
                        </span>
                      </div>
                    </td>

                    {/* Player */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border-2 border-white/10 bg-black/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {entry.avatar_url ? (
                            <Image
                              src={entry.avatar_url}
                              alt={entry.username}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-black text-[#F3A81D]">
                              {entry.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-black uppercase tracking-wide ${
                            isCurrentUser ? 'text-[#F3A81D]' : 'text-white'
                          }`}>
                            {entry.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-[10px] text-[#F3A81D] font-normal">(You)</span>
                            )}
                          </p>
                          {entry.full_name && (
                            <p className="text-xs text-[#8A92A6] font-medium">
                              {entry.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-xl font-black text-[#F3A81D]">
                        {entry.total_points}
                      </span>
                    </td>

                    {/* Exact Scores */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-black text-[#009A44]">
                        {entry.correct_predictions}
                      </span>
                    </td>

                    {/* Predictions */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-black text-[#0052B4]">
                        {entry.scored_count}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-[#8A92A6] font-bold uppercase">
                    {searchTerm ? 'No players found matching your search' : 'No players yet'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="px-3 md:px-6 py-2 md:py-3 border-t border-white/5 bg-black/20">
          <p className="text-[10px] md:text-xs text-[#8A92A6] font-bold">
            Showing {filteredLeaderboard.length} of {leaderboard.length} players
          </p>
        </div>
      )}
    </div>
  )
}
