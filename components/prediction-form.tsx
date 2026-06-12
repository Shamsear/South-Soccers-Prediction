/**
 * Prediction Form Component (FIFA World Cup 2026 Edition)
 * 
 * Interactive client form for prediction submission with score selectors,
 * disabled states, and high-fidelity World Cup styling.
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { submitPrediction } from '@/app/actions/predictions'
import { Plus, Minus, CheckCircle, Lock } from 'lucide-react'

interface PredictionFormProps {
  matchId: string
  kickoffTime: string
  existingPrediction?: {
    predicted_home: number
    predicted_away: number
  } | null
  isLocked: boolean
  homeTeam: string
  awayTeam: string
}

export function PredictionForm({
  matchId,
  kickoffTime,
  existingPrediction,
  isLocked: initialLocked,
  homeTeam,
  awayTeam,
}: PredictionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLocked, setIsLocked] = useState(initialLocked)

  // Initialize with existing prediction or defaults
  const [homeScore, setHomeScore] = useState(
    existingPrediction?.predicted_home ?? 0
  )
  const [awayScore, setAwayScore] = useState(
    existingPrediction?.predicted_away ?? 0
  )

  // Increment/decrement handlers
  const incrementHome = () => {
    if (homeScore < 15) setHomeScore(homeScore + 1)
  }

  const decrementHome = () => {
    if (homeScore > 0) setHomeScore(homeScore - 1)
  }

  const incrementAway = () => {
    if (awayScore < 15) setAwayScore(awayScore + 1)
  }

  const decrementAway = () => {
    if (awayScore > 0) setAwayScore(awayScore - 1)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      toast.error('Predictions are locked. Match has kicked off.')
      return
    }

    if (existingPrediction) {
      toast.error('You have already submitted a prediction for this match.')
      return
    }

    startTransition(async () => {
      try {
        const result = await submitPrediction(matchId, homeScore, awayScore)

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.success) {
          toast.success('Prediction submitted successfully! 🎉')
          router.refresh()
        }
      } catch (error) {
        console.error('Prediction submission error:', error)
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }

  const formDisabled = isLocked || isPending || !!existingPrediction

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h3 className="text-xl font-heading font-black text-[#F3A81D] tracking-wider uppercase">
          {existingPrediction ? 'Your Locked Prediction' : 'Submit Your Score Prediction'}
        </h3>
        <div className="h-1 w-12 bg-[#F3A81D] mx-auto mt-3" />
      </div>

      {isLocked && !existingPrediction && (
        <div className="bg-[#D80027]/10 border-2 border-[#D80027]/40 rounded p-4 mb-8 flex items-center justify-center gap-3">
          <Lock className="w-5 h-5 text-[#D80027] animate-pulse" />
          <p className="text-[#D80027] font-black text-xs uppercase tracking-wide">
            Predictions are locked. This match has kicked off!
          </p>
        </div>
      )}

      {existingPrediction && (
        <div className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded p-4 mb-8 flex items-center justify-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400 font-black text-xs uppercase tracking-wide">
            Prediction locked. Good luck!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Score Inputs Display */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-14">
          
          {/* Home Team Score selector */}
          <div className="flex flex-col items-center gap-4 w-full max-w-[180px]">
            <span className="text-sm font-black text-[#8A92A6] text-center uppercase tracking-wider truncate w-full">
              {homeTeam}
            </span>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={decrementHome}
                disabled={formDisabled || homeScore === 0}
                aria-label={`Decrease ${homeTeam} score`}
                className="w-10 h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="w-20 h-20 bg-black/60 border-2 border-[#F3A81D] rounded flex items-center justify-center text-4xl font-black text-white font-heading shadow-2xl">
                {homeScore}
              </div>
              
              <button
                type="button"
                onClick={incrementHome}
                disabled={formDisabled || homeScore === 15}
                aria-label={`Increase ${homeTeam} score`}
                className="w-10 h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Divider VS */}
          <div className="text-white/20 text-3xl font-black hidden sm:block select-none">-</div>

          {/* Away Team Score selector */}
          <div className="flex flex-col items-center gap-4 w-full max-w-[180px]">
            <span className="text-sm font-black text-[#8A92A6] text-center uppercase tracking-wider truncate w-full">
              {awayTeam}
            </span>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={decrementAway}
                disabled={formDisabled || awayScore === 0}
                aria-label={`Decrease ${awayTeam} score`}
                className="w-10 h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="w-20 h-20 bg-black/60 border-2 border-[#F3A81D] rounded flex items-center justify-center text-4xl font-black text-white font-heading shadow-2xl">
                {awayScore}
              </div>
              
              <button
                type="button"
                onClick={incrementAway}
                disabled={formDisabled || awayScore === 15}
                aria-label={`Increase ${awayTeam} score`}
                className="w-10 h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Submit Prediction */}
        {!existingPrediction && (
          <div className="flex justify-center max-w-xs mx-auto">
            <button
              type="submit"
              disabled={formDisabled}
              className="btn-tactile btn-tactile-red text-xs py-3.5 w-full flex items-center justify-center gap-2"
            >
              {isPending ? 'Locking in Score...' : 'Submit Prediction 🎯'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
