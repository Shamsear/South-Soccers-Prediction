/**
 * Public Matches Page (FIFA World Cup 2026 Edition)
 * 
 * Public page showing all matches - same UI as authenticated matches page
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { Trophy, Calendar, Target } from 'lucide-react'
import { MatchesFilter } from '@/components/matches-filter'

export const metadata: Metadata = {
  title: 'Matches | South Soccers Prediction League',
  description: 'View all FIFA World Cup 2026 matches',
}

type Match = Database['public']['Tables']['matches']['Row']

export default async function PublicMatchesPage() {
  const supabase = createPublicClient()

  // Fetch all matches (public access, no auth required for reading matches)
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#D80027] font-black">Failed to load matches. Please reload the page.</p>
        <p className="text-[#8A92A6] text-sm mt-2">Error: {matchesError.message}</p>
      </div>
    )
  }

  // Handle case where no matches exist yet
  if (!matches || matches.length === 0) {
    console.log('No matches found in database')
  }

  const liveMatches = matches?.filter(m => m.status === 'live') || []

  // Calculate stats
  const totalMatches = matches?.length || 0
  const upcomingMatches = matches?.filter(m => m.status === 'upcoming').length || 0
  const liveMatchesCount = liveMatches.length
  const finishedMatches = matches?.filter(m => m.status === 'finished').length || 0

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D80027] to-[#8B0A1E] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Tournament Fixtures
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                {totalMatches} total matches • Sign in to make predictions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#F3A81D]" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Total</p>
            </div>
            <p className="text-2xl font-black text-white">{totalMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#0052B4]" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Upcoming</p>
            </div>
            <p className="text-2xl font-black text-white">{upcomingMatches}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#D80027] animate-pulse" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Live</p>
            </div>
            <p className="text-2xl font-black text-white">{liveMatchesCount}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#009A44]" />
              <p className="text-[10px] font-black text-[#8A92A6] uppercase">Finished</p>
            </div>
            <p className="text-2xl font-black text-white">{finishedMatches}</p>
          </div>
        </div>

        {matches?.length === 0 && (
          <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded-xl">
            <p className="text-[#8A92A6] text-lg font-black uppercase">No matches loaded yet.</p>
          </div>
        )}

        {/* Filters and Match List - Using same component as authenticated page */}
        {matches && matches.length > 0 && (
          <MatchesFilter matches={matches} linkPrefix="/public-matches" />
        )}

        {/* CTA signup */}
        <div className="mt-16 text-center bg-[#0E0E13] border-2 border-white/5 max-w-2xl mx-auto p-8 rounded-xl shadow-2xl">
          <h3 className="text-2xl font-black text-[#F3A81D] mb-3 uppercase tracking-wide">
            Ready to Make Predictions?
          </h3>
          <p className="text-[#C1C5D0] mb-8 text-sm max-w-md mx-auto">
            Create an account, submit predictions for all matches, and compete for the top spot.
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
