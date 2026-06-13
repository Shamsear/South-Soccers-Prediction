'use client'

/**
 * Matches Filter Component
 * 
 * Client component with search and dropdown filters
 */

import { useState } from 'react'
import { Search, Filter, Calendar, Users } from 'lucide-react'
import { MatchFixtureCard } from '@/components/match-fixture-card'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']

interface MatchesFilterProps {
  matches: Match[]
  linkPrefix?: '/matches' | '/public-matches'
}

export function MatchesFilter({ matches, linkPrefix = '/matches' }: MatchesFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')

  // Extract unique groups
  const groups = Array.from(new Set(matches.map(m => m.group_name).filter(Boolean))) as string[]
  groups.sort()
  
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
    if (selectedGroup !== 'all' && match.group_name !== selectedGroup) return false

    // Date filter
    if (selectedDate !== 'all') {
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

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Format date for short display
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {/* Search and Filters Bar */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8A92A6]" />
              <input
                type="text"
                placeholder="Search teams or round..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0E0E13] border border-white/10 focus:border-[#F3A81D] rounded-lg text-white placeholder-[#8A92A6] focus:outline-none transition-colors text-sm font-medium"
              />
            </div>
          </div>

          {/* Group Filter Dropdown */}
          <div className="md:col-span-1">
            <div className="relative">
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8A92A6] pointer-events-none" />
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-[#0E0E13] border border-white/10 focus:border-[#F3A81D] rounded-lg text-white focus:outline-none transition-colors text-sm font-bold uppercase tracking-wide appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A92A6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '12px',
                }}
              >
                <option value="all">All Groups</option>
                {groups.map(group => (
                  <option key={group} value={group}>
                    {group.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter Dropdown */}
          <div className="md:col-span-1">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8A92A6] pointer-events-none" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-[#0E0E13] border border-white/10 focus:border-[#0052B4] rounded-lg text-white focus:outline-none transition-colors text-sm font-bold uppercase tracking-wide appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A92A6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '12px',
                }}
              >
                <option value="all">All Dates</option>
                {dates.map(date => (
                  <option key={date} value={date}>
                    {formatDateShort(date)}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
                    linkPrefix={linkPrefix}
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
