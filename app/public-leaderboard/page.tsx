/**
 * Public Leaderboard Page (FIFA World Cup 2026 Edition)
 * 
 * Public page showing the leaderboard without authentication required.
 */

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { Trophy, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Leaderboard | South Soccers Prediction League',
  description: 'View the top predictors in the FIFA World Cup 2026 competition',
}

type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']

export default async function PublicLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createServerClient()
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const pageSize = 50
  const offset = (page - 1) * pageSize

  // Fetch leaderboard data
  const { data: leaderboard, error, count } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact' })
    .range(offset, offset + pageSize - 1)
    .order('rank', { ascending: true })

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#D80027] font-black uppercase">Failed to load leaderboard. Please try again.</p>
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / pageSize)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  // Extract Top 3 for podium (only on Page 1)
  const podiumEntries = page === 1 && leaderboard ? leaderboard.slice(0, 3) : []
  
  // Rearrange: Rank 2 (left), Rank 1 (middle), Rank 3 (right)
  const rearrangedPodium: LeaderboardEntry[] = [];
  if (podiumEntries[1]) rearrangedPodium.push(podiumEntries[1] as LeaderboardEntry);
  if (podiumEntries[0]) rearrangedPodium.push(podiumEntries[0] as LeaderboardEntry);
  if (podiumEntries[2]) rearrangedPodium.push(podiumEntries[2] as LeaderboardEntry);

  return (
    <div className="relative min-h-screen bg-[#030306] py-16 overflow-hidden">
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white mb-4 uppercase tracking-tight">
            Leaderboard
          </h1>
          <p className="text-[#C1C5D0] text-base max-w-xl mx-auto font-medium">
            Explore the top soccer predictors in the South Soccers World Cup 2026 competition.
          </p>
        </div>

        {/* Top 3 Podium (for first page only) */}
        {page === 1 && leaderboard && leaderboard.length >= 3 && (
          <div className="mb-16">
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-4">
              {rearrangedPodium.map((entry) => {
                const isFirst = entry.rank === 1
                const isSecond = entry.rank === 2
                const isThird = entry.rank === 3

                let podiumClass = 'podium-silver h-48 md:w-60 order-2 md:order-1'
                let trophyBadge = '🥈'
                let rankLabel = 'RANK 2'

                if (isFirst) {
                  podiumClass = 'podium-gold h-56 md:w-68 order-1 md:order-2 scale-105 md:-translate-y-4 shadow-xl'
                  trophyBadge = '👑🥇'
                  rankLabel = 'CHAMPION'
                } else if (isThird) {
                  podiumClass = 'podium-bronze h-40 md:w-56 order-3'
                  trophyBadge = '🥉'
                  rankLabel = 'RANK 3'
                }

                return (
                  <div
                    key={entry.id}
                    className={`w-full podium-box ${podiumClass} flex flex-col justify-between p-6 text-center`}
                  >
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[9px] font-black uppercase text-white tracking-widest">
                        {rankLabel}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center pt-2">
                      <span className="text-3xl mb-2">{trophyBadge}</span>
                      <div className="w-14 h-14 rounded border-2 border-white/10 p-1 mb-3 bg-black/40 flex items-center justify-center">
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url}
                            alt={entry.username || ''}
                            className="w-full h-full rounded object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-white/5 flex items-center justify-center text-[#F3A81D] font-black text-lg">
                            {(entry.username || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="font-black text-base text-white truncate max-w-full">
                        {entry.username}
                      </h3>
                      <p className="text-[10px] text-[#8A92A6] font-bold uppercase mt-1">
                        {entry.correct_predictions} Exact Predictions
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 mt-4">
                      <span className="text-2xl font-black text-[#F3A81D]">
                        {entry.total_points}
                      </span>
                      <span className="text-xs text-[#8A92A6] ml-1 font-bold">PTS</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Rankings Table */}
        {leaderboard && leaderboard.length > 0 && (
          <div className="bg-[#0E0E13] border-2 border-white/5 rounded shadow-2xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="fwc-table">
                <thead>
                  <tr>
                    <th className="w-20">Rank</th>
                    <th>Player</th>
                    <th className="text-right">Exact Scores</th>
                    <th className="text-right">Predictions</th>
                    <th className="text-right w-28">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isPodium = entry.rank <= 3
                    
                    return (
                      <tr key={entry.id}>
                        {/* Rank */}
                        <td>
                          <span className="font-heading font-black text-base text-white flex items-center gap-1.5">
                            {isPodium ? (
                              <span>
                                {entry.rank === 1 && '🥇 '}
                                {entry.rank === 2 && '🥈 '}
                                {entry.rank === 3 && '🥉 '}
                              </span>
                            ) : (
                              <span className="text-[#8A92A6]">#{entry.rank}</span>
                            )}
                          </span>
                        </td>

                        {/* Player name */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                              {entry.avatar_url ? (
                                <img
                                  src={entry.avatar_url}
                                  alt={entry.username || ''}
                                  className="w-full h-full rounded object-cover"
                                />
                              ) : (
                                <span className="text-[#F3A81D] font-black text-xs">
                                  {(entry.username || 'U')[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span className="text-white font-black uppercase text-xs tracking-wider">
                              {entry.username}
                            </span>
                          </div>
                        </td>

                        {/* Exact */}
                        <td className="text-right text-[#C1C5D0] font-black">
                          {entry.correct_predictions}
                        </td>

                        {/* Count */}
                        <td className="text-right text-[#8A92A6] font-semibold">
                          {entry.scored_count}
                        </td>

                        {/* Points */}
                        <td className="text-right">
                          <span className="text-lg font-black text-[#F3A81D] font-heading">
                            {entry.total_points}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!leaderboard || leaderboard.length === 0) && (
          <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded">
            <p className="text-[#8A92A6] text-lg font-black uppercase">
              No players on the leaderboard yet.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <Link 
              href={`/public-leaderboard?page=${Math.max(1, page - 1)}`} 
              className={!hasPrevPage ? 'pointer-events-none opacity-50' : ''}
            >
              <button 
                disabled={!hasPrevPage} 
                className="btn-tactile btn-tactile-outline text-[11px] py-2.5"
              >
                ← Previous Page
              </button>
            </Link>

            <span className="text-xs text-[#8A92A6] font-black uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>

            <Link 
              href={`/public-leaderboard?page=${Math.min(totalPages, page + 1)}`} 
              className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
            >
              <button 
                disabled={!hasNextPage} 
                className="btn-tactile btn-tactile-outline text-[11px] py-2.5"
              >
                Next Page →
              </button>
            </Link>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-[#0E0E13] border-2 border-white/5 max-w-2xl mx-auto p-8 rounded shadow-2xl">
          <h3 className="text-2xl font-black text-[#F3A81D] mb-3 uppercase tracking-wide">
            Ready to show your skills?
          </h3>
          <p className="text-[#C1C5D0] mb-8 text-sm max-w-md mx-auto">
            Sign up now, submit predictions for matches, and make your way to the top of the global podium.
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
