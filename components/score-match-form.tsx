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
  }
}

export function ScoreMatchForm({ match }: ScoreMatchFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (homeScore < 0 || awayScore < 0) {
      toast.error('Scores cannot be negative')
      return
    }

    startTransition(async () => {
      try {
        const result = await scoreMatch(match.id, homeScore, awayScore)

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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] hover:from-[#8B0A1E] hover:to-[#C8102E] text-white font-bold h-12 px-6"
        >
          {isPending ? 'Scoring...' : 'Score Match'}
        </Button>
      </div>
    </form>
  )
}
