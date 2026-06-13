'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { importPrediction } from '@/app/actions/admin'
import { User, Calendar, Target, Upload } from 'lucide-react'
import { SearchableSelect } from './searchable-select'
import { cn } from '@/lib/utils'

interface ImportPredictionsFormProps {
  users: Array<{
    id: string
    username: string
    full_name: string | null
  }>
  matches: Array<{
    id: string
    home_team: string
    away_team: string
    kickoff_time: string
    status: 'upcoming' | 'live' | 'finished'
    home_score: number | null
    away_score: number | null
    competition_round: string
    group_name: string | null
  }>
}

export function ImportPredictionsForm({ users, matches }: ImportPredictionsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [predictedHome, setPredictedHome] = useState('')
  const [predictedAway, setPredictedAway] = useState('')

  const selectedMatch = matches.find(m => m.id === selectedMatchId)

  // Transform users into options
  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username,
    sublabel: user.full_name || undefined,
  }))

  // Transform matches into options
  const matchOptions = matches.map(match => {
    const date = new Date(match.kickoff_time).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    const statusText = match.status === 'finished' && match.home_score !== null && match.away_score !== null
      ? `Final: ${match.home_score}-${match.away_score}`
      : match.status.toUpperCase()
    
    return {
      value: match.id,
      label: `${match.home_team} vs ${match.away_team}`,
      sublabel: `${date} • ${statusText}`,
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !selectedMatchId || predictedHome === '' || predictedAway === '') {
      toast.error('Please fill in all fields')
      return
    }

    const predictedHomeNum = parseInt(predictedHome)
    const predictedAwayNum = parseInt(predictedAway)

    if (isNaN(predictedHomeNum) || isNaN(predictedAwayNum) || predictedHomeNum < 0 || predictedAwayNum < 0) {
      toast.error('Predicted scores must be non-negative numbers')
      return
    }

    startTransition(async () => {
      const result = await importPrediction({
        userId: selectedUserId,
        matchId: selectedMatchId,
        predictedHome: predictedHomeNum,
        predictedAway: predictedAwayNum,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success(result.message || 'Prediction imported successfully! Points calculated.')
        
        // Reset form
        setSelectedUserId('')
        setSelectedMatchId('')
        setPredictedHome('')
        setPredictedAway('')
        
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* User Selection - Searchable */}
      <SearchableSelect
        options={userOptions}
        value={selectedUserId}
        onChange={setSelectedUserId}
        placeholder="Search and select a user..."
        disabled={isPending}
        icon={<User className="w-4 h-4 text-[#F3A81D]" />}
        label="Select User"
        description="Select the player who made this prediction"
      />

      {/* Match Selection - Searchable */}
      <SearchableSelect
        options={matchOptions}
        value={selectedMatchId}
        onChange={setSelectedMatchId}
        placeholder="Search and select a match..."
        disabled={isPending}
        icon={<Calendar className="w-4 h-4 text-[#0052B4]" />}
        label="Select Match"
        description="Select the match for this prediction"
      />

      {/* Match Details Display */}
      {selectedMatch && (
        <div className="bg-[#0052B4]/5 border border-[#0052B4]/20 rounded-lg p-5">
          <h4 className="text-sm font-black text-white uppercase mb-3">Match Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#8A92A6]">Match:</span>
              <span className="text-white font-bold">{selectedMatch.home_team} vs {selectedMatch.away_team}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8A92A6]">Status:</span>
              <span className={cn(
                "font-bold uppercase text-xs px-2 py-1 rounded",
                selectedMatch.status === 'finished' ? "bg-[#009A44]/20 text-[#009A44]" :
                selectedMatch.status === 'live' ? "bg-[#D80027]/20 text-[#D80027]" :
                "bg-[#0052B4]/20 text-[#0052B4]"
              )}>
                {selectedMatch.status}
              </span>
            </div>
            {selectedMatch.status === 'finished' && selectedMatch.home_score !== null && selectedMatch.away_score !== null && (
              <div className="flex items-center justify-between">
                <span className="text-[#8A92A6]">Final Score:</span>
                <span className="text-[#F3A81D] font-black text-lg">
                  {selectedMatch.home_score} - {selectedMatch.away_score}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predicted Scores */}
      <div className="bg-black/30 border border-white/5 rounded-lg p-5 hover:border-[#009A44]/30 transition-colors">
        <div className="flex items-center gap-2 text-xs font-black text-[#009A44] uppercase tracking-wider mb-4">
          <Target className="w-4 h-4 text-[#009A44]" />
          Predicted Scores
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Home Score */}
          <div>
            <label htmlFor="predictedHome" className="block text-xs font-bold text-[#C1C5D0] mb-2">
              {selectedMatch?.home_team || 'Home Team'} Score
            </label>
            <input
              id="predictedHome"
              type="number"
              min="0"
              value={predictedHome}
              onChange={(e) => setPredictedHome(e.target.value)}
              disabled={isPending}
              required
              placeholder="0"
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-2xl font-black text-center text-white focus:outline-none focus:border-[#009A44] focus:ring-2 focus:ring-[#009A44]/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Away Score */}
          <div>
            <label htmlFor="predictedAway" className="block text-xs font-bold text-[#C1C5D0] mb-2">
              {selectedMatch?.away_team || 'Away Team'} Score
            </label>
            <input
              id="predictedAway"
              type="number"
              min="0"
              value={predictedAway}
              onChange={(e) => setPredictedAway(e.target.value)}
              disabled={isPending}
              required
              placeholder="0"
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-2xl font-black text-center text-white focus:outline-none focus:border-[#009A44] focus:ring-2 focus:ring-[#009A44]/20 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <p className="text-xs text-[#8A92A6] mt-3">
          Enter the scores that the user predicted
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-[#0052B4] to-[#003D8C] hover:from-[#003D8C] hover:to-[#0052B4] text-white font-black text-sm uppercase tracking-wider py-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#0052B4]/30 hover:shadow-xl hover:shadow-[#0052B4]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      >
        <Upload className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
        {isPending ? 'Importing Prediction...' : 'Import Prediction'}
      </button>

      {selectedMatch?.status === 'finished' && selectedMatch.home_score !== null && (
        <div className="bg-[#009A44]/10 border border-[#009A44]/30 rounded-lg p-4 text-center">
          <p className="text-xs font-bold text-[#009A44] uppercase tracking-wide">
            ✓ Points will be calculated automatically based on the final score
          </p>
        </div>
      )}
    </form>
  )
}
