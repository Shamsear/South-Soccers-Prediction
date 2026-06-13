'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { BulkPredictionModal } from './bulk-prediction-modal'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']

interface MatchWithPrediction extends Match {
  userPrediction?: Prediction | null
}

interface BulkPredictButtonProps {
  matches: MatchWithPrediction[]
}

export function BulkPredictButton({ matches }: BulkPredictButtonProps) {
  const [showModal, setShowModal] = useState(false)
  
  // Count upcoming matches without predictions
  const upcomingMatches = matches.filter(m => m.status === 'upcoming')
  const unpredictedCount = upcomingMatches.filter(m => !m.userPrediction).length

  if (upcomingMatches.length === 0) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="hidden md:flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-[#F3A81D] to-[#D80027] hover:from-[#D80027] hover:to-[#F3A81D] text-white font-black text-sm uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg border border-white/10"
      >
        <Zap className="w-4 h-4" />
        Bulk Predict
        {unpredictedCount > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {unpredictedCount}
          </span>
        )}
      </button>

      {/* Mobile button */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden w-10 h-10 bg-gradient-to-br from-[#F3A81D] to-[#D80027] hover:from-[#D80027] hover:to-[#F3A81D] text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg border border-white/10 transition-all"
        aria-label="Bulk Predict"
      >
        <Zap className="w-5 h-5" />
      </button>

      {showModal && (
        <BulkPredictionModal
          matches={upcomingMatches}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
