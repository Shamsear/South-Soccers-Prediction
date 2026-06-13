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

  // Initialize with existing prediction or empty for new predictions
  const [homeScore, setHomeScore] = useState<number | null>(
    existingPrediction?.predicted_home ?? null
  )
  const [awayScore, setAwayScore] = useState<number | null>(
    existingPrediction?.predicted_away ?? null
  )

  // Increment/decrement handlers
  const incrementHome = () => {
    const currentScore = homeScore ?? 0
    if (currentScore < 15) setHomeScore(currentScore + 1)
  }

  const decrementHome = () => {
    const currentScore = homeScore ?? 0
    if (currentScore > 0) setHomeScore(currentScore - 1)
  }

  const incrementAway = () => {
    const currentScore = awayScore ?? 0
    if (currentScore < 15) setAwayScore(currentScore + 1)
  }

  const decrementAway = () => {
    const currentScore = awayScore ?? 0
    if (currentScore > 0) setAwayScore(currentScore - 1)
  }

  // Direct input handlers
  const handleHomeScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setHomeScore(null)
      return
    }
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 15) {
      setHomeScore(numValue)
    }
  }

  const handleAwayScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setAwayScore(null)
      return
    }
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 15) {
      setAwayScore(numValue)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      toast.error('Predictions are locked. Match has kicked off.')
      return
    }

    // Validate that scores have been set
    if (homeScore === null || awayScore === null) {
      toast.error('Please set both team scores before submitting.')
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
          if (existingPrediction) {
            toast.success('Prediction updated successfully! 🎉')
          } else {
            toast.success('Prediction submitted successfully! 🎉')
          }
          router.refresh()
        }
      } catch (error) {
        console.error('Prediction submission error:', error)
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }

  const formDisabled = isLocked || isPending

  return (
    <div className="w-full">
      <div className="text-center mb-4 md:mb-8">
        <h3 className="text-base md:text-xl font-heading font-black text-[#F3A81D] tracking-wider uppercase">
          {existingPrediction ? 'Update Your Prediction' : 'Submit Your Score Prediction'}
        </h3>
        <div className="h-0.5 md:h-1 w-8 md:w-12 bg-[#F3A81D] mx-auto mt-2 md:mt-3" />
      </div>

      {isLocked && (
        <div className="bg-[#D80027]/10 border-2 border-[#D80027]/40 rounded p-3 md:p-4 mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
          <Lock className="w-4 h-4 md:w-5 md:h-5 text-[#D80027] animate-pulse" />
          <p className="text-[#D80027] font-black text-[10px] md:text-xs uppercase tracking-wide">
            Predictions are locked. This match has kicked off!
          </p>
        </div>
      )}

      {existingPrediction && !isLocked && (
        <div className="bg-blue-950/20 border-2 border-blue-500/40 rounded p-3 md:p-4 mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
          <p className="text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-wide">
            You can still edit your prediction until kickoff
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
        
        {/* Score Inputs Display */}
        <div className="flex flex-row items-center justify-center gap-3 md:gap-8 lg:gap-14">
          
          {/* Home Team Score selector */}
          <div className="flex flex-col items-center gap-2 md:gap-4 flex-1 max-w-[160px] md:max-w-[180px]">
            <span className="text-[10px] md:text-sm font-black text-[#8A92A6] text-center uppercase tracking-wider truncate w-full">
              {homeTeam}
            </span>
            
            <div className="flex items-center gap-1.5 md:gap-4">
              <button
                type="button"
                onClick={decrementHome}
                disabled={formDisabled || (homeScore ?? 0) === 0}
                aria-label={`Decrease ${homeTeam} score`}
                className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              
              <input
                type="number"
                min="0"
                max="15"
                value={homeScore ?? ''}
                onChange={handleHomeScoreChange}
                disabled={formDisabled}
                placeholder="-"
                className="w-14 h-14 md:w-20 md:h-20 bg-black/60 border-2 border-[#F3A81D] rounded flex items-center justify-center text-2xl md:text-4xl font-black text-white font-heading shadow-2xl text-center focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/50 disabled:opacity-50 placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <button
                type="button"
                onClick={incrementHome}
                disabled={formDisabled || (homeScore ?? 0) === 15}
                aria-label={`Increase ${homeTeam} score`}
                className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          {/* Divider VS */}
          <div className="text-white/20 text-xl md:text-3xl font-black select-none flex-shrink-0">-</div>

          {/* Away Team Score selector */}
          <div className="flex flex-col items-center gap-2 md:gap-4 flex-1 max-w-[160px] md:max-w-[180px]">
            <span className="text-[10px] md:text-sm font-black text-[#8A92A6] text-center uppercase tracking-wider truncate w-full">
              {awayTeam}
            </span>
            
            <div className="flex items-center gap-1.5 md:gap-4">
              <button
                type="button"
                onClick={decrementAway}
                disabled={formDisabled || (awayScore ?? 0) === 0}
                aria-label={`Decrease ${awayTeam} score`}
                className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              
              <input
                type="number"
                min="0"
                max="15"
                value={awayScore ?? ''}
                onChange={handleAwayScoreChange}
                disabled={formDisabled}
                placeholder="-"
                className="w-14 h-14 md:w-20 md:h-20 bg-black/60 border-2 border-[#F3A81D] rounded flex items-center justify-center text-2xl md:text-4xl font-black text-white font-heading shadow-2xl text-center focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/50 disabled:opacity-50 placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <button
                type="button"
                onClick={incrementAway}
                disabled={formDisabled || (awayScore ?? 0) === 15}
                aria-label={`Increase ${awayTeam} score`}
                className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-[#161620] border-2 border-white/10 hover:border-white rounded text-[#C1C5D0] hover:text-white disabled:opacity-20 transition-all cursor-pointer shadow-md active:scale-90"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Submit/Update Prediction */}
        <div className="flex justify-center max-w-xs mx-auto">
          <button
            type="submit"
            disabled={formDisabled}
            className="btn-tactile btn-tactile-red text-xs py-3 md:py-3.5 w-full flex items-center justify-center gap-2"
          >
            {isPending 
              ? (existingPrediction ? 'Updating...' : 'Locking in Score...') 
              : (existingPrediction ? 'Update Prediction 🎯' : 'Submit Prediction 🎯')
            }
          </button>
        </div>
      </form>
    </div>
  )
}
