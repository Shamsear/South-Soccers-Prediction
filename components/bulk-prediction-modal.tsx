'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitBulkPredictions } from '@/app/actions/bulk-predictions'
import { toast } from 'sonner'
import { X, CheckCircle, AlertCircle, Zap, Plus, Minus, Search } from 'lucide-react'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']

interface BulkPredictionModalProps {
  matches: Match[]
  onClose: () => void
}

interface PredictionEntry {
  matchId: string
  match: Match
  predictedHome: number | null
  predictedAway: number | null
}

export function BulkPredictionModal({ matches, onClose }: BulkPredictionModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [predictions, setPredictions] = useState<Map<string, PredictionEntry>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')

  // Filter only upcoming matches (not started yet)
  const now = new Date()
  const upcomingMatches = matches.filter(m => {
    const kickoff = new Date(m.kickoff_time)
    return m.status === 'upcoming' && kickoff > now
  })
  
  // Filter by search term
  const filteredMatches = upcomingMatches.filter(m =>
    m.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.away_team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleMatchSelection = (match: Match) => {
    const newSelected = new Set(selectedMatches)
    
    if (newSelected.has(match.id)) {
      newSelected.delete(match.id)
      const newPredictions = new Map(predictions)
      newPredictions.delete(match.id)
      setPredictions(newPredictions)
    } else {
      newSelected.add(match.id)
      const newPredictions = new Map(predictions)
      newPredictions.set(match.id, {
        matchId: match.id,
        match,
        predictedHome: null,
        predictedAway: null,
      })
      setPredictions(newPredictions)
    }
    
    setSelectedMatches(newSelected)
  }

  const updatePrediction = (matchId: string, field: 'home' | 'away', value: number | null) => {
    const newPredictions = new Map(predictions)
    const entry = newPredictions.get(matchId)
    
    if (entry) {
      if (field === 'home') {
        entry.predictedHome = value
      } else {
        entry.predictedAway = value
      }
      newPredictions.set(matchId, entry)
      setPredictions(newPredictions)
    }
  }

  const adjustScore = (matchId: string, field: 'home' | 'away', delta: number) => {
    const entry = predictions.get(matchId)
    if (!entry) return

    const currentValue = field === 'home' ? entry.predictedHome : entry.predictedAway
    const newValue = Math.max(0, Math.min(15, (currentValue ?? 0) + delta))
    updatePrediction(matchId, field, newValue)
  }

  const handleSubmit = () => {
    // Check if any selected matches have already started
    const now = new Date()
    const startedMatches = Array.from(predictions.values()).filter(p => {
      const kickoff = new Date(p.match.kickoff_time)
      return kickoff <= now
    })

    if (startedMatches.length > 0) {
      toast.error(`${startedMatches.length} match(es) have already started! Removing them from your selection.`)
      // Remove started matches from predictions
      const newPredictions = new Map(predictions)
      const newSelected = new Set(selectedMatches)
      startedMatches.forEach(m => {
        newPredictions.delete(m.matchId)
        newSelected.delete(m.matchId)
      })
      setPredictions(newPredictions)
      setSelectedMatches(newSelected)
      return
    }

    // Validate that all selected matches have predictions
    const incompletePredictions = Array.from(predictions.values()).filter(
      p => p.predictedHome === null || p.predictedAway === null
    )

    if (incompletePredictions.length > 0) {
      toast.error(`Please enter scores for all ${incompletePredictions.length} selected match(es)`)
      return
    }

    if (predictions.size === 0) {
      toast.error('Please select at least one match and enter predictions')
      return
    }

    startTransition(async () => {
      const bulkPredictions = Array.from(predictions.values()).map(p => ({
        matchId: p.matchId,
        predictedHome: p.predictedHome!,
        predictedAway: p.predictedAway!,
      }))

      const result = await submitBulkPredictions(bulkPredictions)

      if (result.success) {
        if (result.failureCount === 0) {
          toast.success(`All ${result.successCount} predictions submitted successfully!`)
          router.refresh()
          onClose()
        } else {
          toast.warning(
            `${result.successCount} predictions submitted. ${result.failureCount} failed.`,
            {
              description: result.errors?.map(e => e.error).join(', '),
            }
          )
          router.refresh()
        }
      } else {
        toast.error(`Failed to submit predictions. ${result.errors?.[0]?.error || 'Unknown error'}`)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0E0E13] border border-white/10 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F3A81D] to-[#D80027] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Bulk Predict</h2>
              <p className="text-xs text-[#8A92A6] mt-0.5">
                Select matches and enter predictions ({filteredMatches.length} matches)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5 text-[#8A92A6]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8A92A6] pointer-events-none" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 focus:border-[#F3A81D] rounded-lg text-white placeholder-[#8A92A6] focus:outline-none transition-colors text-sm font-medium"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-[#8A92A6] mx-auto mb-3" />
              <p className="text-[#8A92A6] font-bold">
                {searchTerm ? 'No matches found' : 'No upcoming matches available for prediction'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => {
                const isSelected = selectedMatches.has(match.id)
                const prediction = predictions.get(match.id)
                const kickoffDate = new Date(match.kickoff_time)

                return (
                  <div
                    key={match.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected
                        ? 'bg-[#F3A81D]/5 border-[#F3A81D]/30'
                        : 'bg-[#050508]/60 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Match Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMatchSelection(match)}
                        disabled={isPending}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-[#F3A81D] focus:ring-[#F3A81D] focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-[#F3A81D] uppercase tracking-wider">
                            {match.competition_round}
                          </span>
                          <span className="text-[10px] text-[#8A92A6]">•</span>
                          <span className="text-[10px] text-[#8A92A6]">
                            {kickoffDate.toLocaleDateString()} {kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="font-bold text-white text-sm">
                          {match.home_team} vs {match.away_team}
                        </div>
                      </div>
                    </div>

                    {/* Prediction Inputs */}
                    {isSelected && (
                      <div className="ml-7 flex items-center gap-3">
                        {/* Home Team Score */}
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-[#8A92A6] uppercase mb-1 block">
                            {match.home_team}
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => adjustScore(match.id, 'home', -1)}
                              disabled={isPending || (prediction?.predictedHome ?? 0) <= 0}
                              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={prediction?.predictedHome ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : parseInt(e.target.value)
                                if (val !== null && (val < 0 || val > 15)) return
                                updatePrediction(match.id, 'home', val)
                              }}
                              disabled={isPending}
                              placeholder="-"
                              className="w-16 h-8 text-center bg-white/5 border border-white/10 rounded text-white font-bold focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() => adjustScore(match.id, 'home', 1)}
                              disabled={isPending || (prediction?.predictedHome ?? 0) >= 15}
                              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[#8A92A6] font-black text-sm">vs</div>

                        {/* Away Team Score */}
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-[#8A92A6] uppercase mb-1 block">
                            {match.away_team}
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => adjustScore(match.id, 'away', -1)}
                              disabled={isPending || (prediction?.predictedAway ?? 0) <= 0}
                              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={prediction?.predictedAway ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : parseInt(e.target.value)
                                if (val !== null && (val < 0 || val > 15)) return
                                updatePrediction(match.id, 'away', val)
                              }}
                              disabled={isPending}
                              placeholder="-"
                              className="w-16 h-8 text-center bg-white/5 border border-white/10 rounded text-white font-bold focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() => adjustScore(match.id, 'away', 1)}
                              disabled={isPending || (prediction?.predictedAway ?? 0) >= 15}
                              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/5">
          <div className="text-sm">
            <span className="text-[#8A92A6]">Selected: </span>
            <span className="font-black text-white">{selectedMatches.size}</span>
            <span className="text-[#8A92A6]"> / {upcomingMatches.length} matches</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || selectedMatches.size === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-[#F3A81D] to-[#D80027] hover:from-[#D80027] hover:to-[#F3A81D] text-white font-black text-sm uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#F3A81D]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isPending ? 'Submitting...' : `Submit ${selectedMatches.size} Prediction${selectedMatches.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
