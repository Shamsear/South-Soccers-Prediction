'use client'

/**
 * Matches Filter Component
 * 
 * Client component with search, group filter tablets, and date filter
 */

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { MatchFixtureCard } from '@/components/match-fixture-card'

interface Match {
  id: string
  home_team: string
  away_team: string
  group_name: string | null
  kickoff_time: string
  competition_round: string
  [key: string]: any
}

interface MatchesFilterProps {
  matches: Match[]
}

export function MatchesFilter({ matches }: MatchesFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dateScrollRef = useRef<HTMLDivElement>(null)

  // Extract unique groups
  const groups = Array.from(new Set(matches.map(m => m.group_name).filter(Boolean))).sort()
  
  // Extract unique dates (YYYY-MM-DD format)
  const dates = Array.from(
    new Set(
      matches.map(m => new Date(m.kickoff_time).toISOString().split('T')[0])
    )
  ).sort()

  // Filter matches
  const filteredMatches = matches.filter(match => {
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      match.home_team.toLowerCase().includes(searchLower) ||
      match.away_team.toLowerCase().includes(searchLower) ||
      match.competition_round.toLowerCase().includes(searchLower)

    if (!matchesSearch) return false

    // Group filter
    if (selectedGroup && match.group_name !== selectedGroup) return false

    // Date filter
    if (selectedDate) {
      const matchDate = new Date(match.kickoff_time).toISOString().split('T')[0]
      if (matchDate !== selectedDate) return false
    }

    return true
  })

  // Group filtered matches by round
  const groupedMatches: Record<string, Match[]> = filteredMatches.reduce((acc, match) => {
    const round = match.competition_round
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(match)
    return acc
  }, {} as Record<string, Match[]>)

  const rounds = Object.keys(groupedMatches).sort()

  // Scroll functions for groups
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  // Scroll functions for dates
  const scrollDateLeft = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollDateRight = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8A92A6]" />
          <input
            type="text"
            placeholder="Search by team name or round..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#0E0E13] border-2 border-white/5 focus:border-[#F3A81D] rounded-xl text-white placeholder-[#8A92A6] focus:outline-none transition-colors text-base"
          />
        </div>
      </div>

      {/* Group Filter Tablets (Horizontal Scroll) */}
      {groups.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={scrollLeft}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0E0E13] border border-white/10 flex items-center justify-center hover:border-[#F3A81D] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-[#8A92A6]" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setSelectedGroup(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedGroup === null
                    ? 'bg-[#F3A81D] text-white border border-[#F3A81D]'
                    : 'bg-[#0E0E13] text-[#8A92A6] border border-white/10 hover:border-[#F3A81D]/50'
                }`}
              >
                All Groups
              </button>
              {groups.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                    selectedGroup === group
                      ? 'bg-[#F3A81D] text-white border border-[#F3A81D]'
                      : 'bg-[#0E0E13] text-[#8A92A6] border border-white/10 hover:border-[#F3A81D]/50'
                  }`}
                >
                  {group.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={scrollRight}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0E0E13] border border-white/10 flex items-center justify-center hover:border-[#F3A81D] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-[#8A92A6]" />
            </button>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={scrollDateLeft}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0E0E13] border border-white/10 flex items-center justify-center hover:border-[#0052B4] transition-colors"
            aria-label="Scroll dates left"
          >
            <ChevronLeft className="w-4 h-4 text-[#8A92A6]" />
          </button>

          <div
            ref={dateScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => setSelectedDate(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                selectedDate === null
                  ? 'bg-[#0052B4] text-white border border-[#0052B4]'
                  : 'bg-[#0E0E13] text-[#8A92A6] border border-white/10 hover:border-[#0052B4]/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>All Dates</span>
              </div>
            </button>
            {dates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedDate === date
                    ? 'bg-[#0052B4] text-white border border-[#0052B4]'
                    : 'bg-[#0E0E13] text-[#8A92A6] border border-white/10 hover:border-[#0052B4]/50'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>

          <button
            onClick={scrollDateRight}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0E0E13] border border-white/10 flex items-center justify-center hover:border-[#0052B4] transition-colors"
            aria-label="Scroll dates right"
          >
            <ChevronRight className="w-4 h-4 text-[#8A92A6]" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-center">
        <p className="text-sm text-[#8A92A6] font-bold">
          Showing <span className="text-[#F3A81D]">{filteredMatches.length}</span> of {matches.length} matches
        </p>
      </div>

      {/* Match List */}
      <div className="space-y-16">
        {rounds.length > 0 ? (
          rounds.map(round => (
            <div key={round} className="space-y-8">
              {/* Round Title */}
              <div className="flex items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black text-[#F3A81D] tracking-widest uppercase font-heading">
                  {round.replace(/_/g, ' ')}
                </h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-[#F3A81D]/30 to-transparent" />
              </div>

              {/* Cards Grid */}
              <div className="space-y-4">
                {groupedMatches[round].map(match => (
                  <MatchFixtureCard
                    key={match.id}
                    match={match}
                    showGroupBadge={true}
                    isClickable={true}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded-xl">
            <p className="text-[#8A92A6] text-lg font-black uppercase">No matches found</p>
            <p className="text-[#8A92A6] text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
