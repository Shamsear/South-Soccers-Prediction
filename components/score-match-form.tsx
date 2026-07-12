/**
 * Score Match Form Component
 * 
 * Requirements:
 * - 11.5 (Score entry form)
 * - 6 (Prediction Scoring)
 * 
 * Client component for admin to enter final match scores.
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { scoreMatch } from '@/app/actions/admin'

interface ScoreMatchFormProps {
  match: {
    id: string
    home_team: string
    away_team: string
    home_score: number | null
    away_score: number | null
    competition_round?: string | null
  }
}

export function ScoreMatchForm({ match }: ScoreMatchFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0)
  const [penaltyWinner, setPenaltyWinner] = useState<string | null>(null)

  const isKnockout = match.competition_round
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
      ].includes(match.competition_round.toUpperCase())
    : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (homeScore < 0 || awayScore < 0) {
      toast.error('Scores cannot be negative')
      return
    }

    const submittedPenaltyWinner = isKnockout && homeScore === awayScore ? penaltyWinner : null

    // Validate penalty winner selection for knockout draw match
    if (isKnockout && homeScore === awayScore && !submittedPenaltyWinner) {
      toast.error('Please select a penalty shootout winner')
      return
    }

    startTransition(async () => {
      try {
        const result = await scoreMatch(match.id, homeScore, awayScore, submittedPenaltyWinner)

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.success) {
          toast.success(`Match scored! ${result.count} predictions updated.`)
          router.refresh()
        }
      } catch (error) {
        console.error('Score match error:', error)
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-end gap-4">
        {/* Home Score */}
        <div className="flex-1">
          <Label htmlFor={`home-${match.id}`} className="text-foreground/80 text-sm">
            {match.home_team}
          </Label>
          <Input
            id={`home-${match.id}`}
            type="number"
            min="0"
            max="20"
            value={homeScore}
            onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
            disabled={isPending}
            className="mt-1 bg-[#0A0A0F] border-[#FFD700]/30 focus:border-[#FFD700] h-12 text-lg font-bold"
          />
        </div>

        {/* Divider */}
        <div className="pb-3 text-[#FFD700]/50 text-xl font-bold">-</div>

        {/* Away Score */}
        <div className="flex-1">
          <Label htmlFor={`away-${match.id}`} className="text-foreground/80 text-sm">
            {match.away_team}
          </Label>
          <Input
            id={`away-${match.id}`}
            type="number"
            min="0"
            max="20"
            value={awayScore}
            onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
            disabled={isPending}
            className="mt-1 bg-[#0A0A0F] border-[#FFD700]/30 focus:border-[#FFD700] h-12 text-lg font-bold"
          />
        </div>
      </div>

      {/* Penalty Shootout Winner Selector (Knockout matches only, shown on draw score entry) */}
      {isKnockout && homeScore === awayScore && (
        <div className="bg-[#0A0A0F] border border-white/5 rounded-lg p-3 space-y-2 animate-in fade-in duration-300">
          <p className="text-[10px] md:text-xs font-black text-[#8A92A6] uppercase tracking-wider">
            🏆 Knockout Match Draw - Who won the Penalty Shootout?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setPenaltyWinner('home')}
              className={`flex-1 py-1.5 px-3 rounded font-bold text-xs uppercase transition-all duration-300 ${
                penaltyWinner === 'home'
                  ? 'bg-gradient-to-r from-[#F3A81D] to-[#D80027] text-white ring-1 ring-[#F3A81D]'
                  : 'bg-[#161620] hover:bg-[#1C1C29] text-[#C1C5D0] border border-white/5'
              }`}
            >
              {match.home_team}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setPenaltyWinner('away')}
              className={`flex-1 py-1.5 px-3 rounded font-bold text-xs uppercase transition-all duration-300 ${
                penaltyWinner === 'away'
                  ? 'bg-gradient-to-r from-[#F3A81D] to-[#D80027] text-white ring-1 ring-[#F3A81D]'
                  : 'bg-[#161620] hover:bg-[#1C1C29] text-[#C1C5D0] border border-white/5'
              }`}
            >
              {match.away_team}
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] hover:from-[#8B0A1E] hover:to-[#C8102E] text-white font-bold h-12 px-6"
      >
        {isPending ? 'Scoring...' : 'Score Match'}
      </Button>
    </form>
  )
}
