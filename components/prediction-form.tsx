/**
 * Prediction Form Component (FIFA World Cup 2026 Edition)
 * 
 * Interactive client form for prediction submission with score selectors,
 * disabled states, and high-fidelity World Cup styling.
 */

'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { submitPrediction } from '@/app/actions/predictions'
import { Plus, Minus, CheckCircle, Lock, Loader2 } from 'lucide-react'

interface PredictionFormProps {
  matchId: string
  kickoffTime: string
  existingPrediction?: {
    predicted_home: number
    predicted_away: number
    predicted_penalty_winner?: string | null
  } | null
  isLocked: boolean
  homeTeam: string
  awayTeam: string
  competitionRound?: string
}

export function PredictionForm({
  matchId,
  kickoffTime,
  existingPrediction,
  isLocked: initialLocked,
  homeTeam,
  awayTeam,
  competitionRound,
}: PredictionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLocked, setIsLocked] = useState(initialLocked)
  const [savedPrediction, setSavedPrediction] = useState<typeof existingPrediction>(existingPrediction)
  const [isSuccess, setIsSuccess] = useState(false)

  // Initialize with existing prediction or empty for new predictions
  const [homeScore, setHomeScore] = useState<number | null>(
    savedPrediction?.predicted_home ?? null
  )
  const [awayScore, setAwayScore] = useState<number | null>(
    savedPrediction?.predicted_away ?? null
  )
  const [penaltyWinner, setPenaltyWinner] = useState<string | null>(
    savedPrediction?.predicted_penalty_winner ?? null
  )

  const isKnockout = competitionRound
    ? [
        'ROUND_OF_32',
        'LAST_32',
        'ROUND_OF_16',
        'LAST_16',
        'QUARTER_FINALS',
        'QUARTER_FINAL',
        'SEMI_FINALS',
        'SEMI_FINAL',
        'THIRD_PLACE',
        'FINAL',
        'FINALS',
      ].includes(competitionRound.toUpperCase())
    : false

  // Sync state with server prop changes
  useEffect(() => {
    setSavedPrediction(existingPrediction)
    setHomeScore(existingPrediction?.predicted_home ?? null)
    setAwayScore(existingPrediction?.predicted_away ?? null)
    setPenaltyWinner(existingPrediction?.predicted_penalty_winner ?? null)
  }, [existingPrediction])

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

    // Check if match has started (client-side validation with current time)
    const now = new Date()
    const kickoff = new Date(kickoffTime)
    
    if (kickoff <= now) {
      setIsLocked(true)
      toast.error('Match has already started! Predictions are locked.')
      return
    }

    if (isLocked) {
      toast.error('Predictions are locked. Match has kicked off.')
      return
    }

    // Validate that scores have been set
    if (homeScore === null || awayScore === null) {
      toast.error('Please set both team scores before submitting.')
      return
    }

    const submittedHome = homeScore
    const submittedAway = awayScore
    const submittedPenaltyWinner = isKnockout && submittedHome === submittedAway ? penaltyWinner : null

    // If knockout draw, user must choose a penalty shootout winner
    if (isKnockout && submittedHome === submittedAway && !submittedPenaltyWinner) {
      toast.error('Please select a predicted penalty shootout winner.')
      return
    }

    startTransition(async () => {
      try {
        const result = await submitPrediction(matchId, submittedHome, submittedAway, submittedPenaltyWinner)

        if (result.error) {
          toast.error(result.error)
          // If error indicates match started, update locked state
          if (result.error.includes('started') || result.error.includes('locked')) {
            setIsLocked(true)
          }
          return
        }

        if (result.success) {
          setSavedPrediction({
            predicted_home: submittedHome,
            predicted_away: submittedAway,
            predicted_penalty_winner: submittedPenaltyWinner,
          })
          setIsSuccess(true)
          setTimeout(() => setIsSuccess(false), 2000)

          if (savedPrediction) {
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
          {savedPrediction ? 'Update Your Prediction' : 'Submit Your Score Prediction'}
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

      {savedPrediction && !isLocked && (
        <div className="bg-blue-950/20 border-2 border-blue-500/40 rounded p-3 md:p-4 mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3 animate-in fade-in duration-300">
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
                className={`w-14 h-14 md:w-20 md:h-20 bg-black/60 border-2 rounded flex items-center justify-center text-2xl md:text-4xl font-black text-white font-heading shadow-2xl text-center focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/50 disabled:opacity-50 placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-300 ${
                  isSuccess 
                    ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/30' 
                    : 'border-[#F3A81D]'
                }`}
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
                className={`w-14 h-14 md:w-20 md:h-20 bg-black/60 border-2 rounded flex items-center justify-center text-2xl md:text-4xl font-black text-white font-heading shadow-2xl text-center focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/50 disabled:opacity-50 placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-300 ${
                  isSuccess 
                    ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/30' 
                    : 'border-[#F3A81D]'
                }`}
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

        {/* Penalty Shootout Winner Selector (Knockout matches only, shown on draw prediction) */}
        {isKnockout && homeScore !== null && awayScore !== null && homeScore === awayScore && (
          <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 md:p-6 max-w-sm mx-auto space-y-3 md:space-y-4 animate-in fade-in duration-300">
            <p className="text-center text-[10px] md:text-xs font-black text-[#8A92A6] uppercase tracking-wider">
              🏆 Knockout Match Draw - Who wins the Penalty Shootout?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                disabled={formDisabled}
                onClick={() => setPenaltyWinner('home')}
                className={`flex-1 py-2.5 px-4 rounded font-bold text-xs uppercase transition-all duration-300 active:scale-95 ${
                  penaltyWinner === 'home'
                    ? 'bg-gradient-to-r from-[#F3A81D] to-[#D80027] text-white shadow-[0_0_15px_rgba(243,168,29,0.3)] ring-2 ring-[#F3A81D]'
                    : 'bg-[#161620] hover:bg-[#1C1C29] text-[#C1C5D0] border border-white/5'
                }`}
              >
                {homeTeam}
              </button>
              <button
                type="button"
                disabled={formDisabled}
                onClick={() => setPenaltyWinner('away')}
                className={`flex-1 py-2.5 px-4 rounded font-bold text-xs uppercase transition-all duration-300 active:scale-95 ${
                  penaltyWinner === 'away'
                    ? 'bg-gradient-to-r from-[#F3A81D] to-[#D80027] text-white shadow-[0_0_15px_rgba(243,168,29,0.3)] ring-2 ring-[#F3A81D]'
                    : 'bg-[#161620] hover:bg-[#1C1C29] text-[#C1C5D0] border border-white/5'
                }`}
              >
                {awayTeam}
              </button>
            </div>
          </div>
        )}

        {/* Submit/Update Prediction */}
        <div className="flex justify-center max-w-xs mx-auto w-full">
          <button
            type="submit"
            disabled={formDisabled}
            className={`btn-tactile text-xs py-3 md:py-3.5 w-full flex items-center justify-center gap-2 transition-all duration-300 ${
              isSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400' 
                : 'btn-tactile-red'
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{savedPrediction ? 'Updating...' : 'Locking in Score...'}</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 animate-bounce text-white" />
                <span>Saved Successfully! 🎉</span>
              </>
            ) : (
              <span>{savedPrediction ? 'Update Prediction 🎯' : 'Submit Prediction 🎯'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
