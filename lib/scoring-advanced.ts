/**
 * Advanced Scoring Calculation Utility
 * 
 * New Point System (replacing simple 3-1-0):
 * 1. Exact score - 5 points (base)
 * 2. Correct result only - 3 points
 * 3. Correct goal difference bonus - +1 point
 * 4. Knockout exact score bonus - +2 points
 * 5. Correct penalty shootout winner - +2 points
 * 6. Wrong result - 0 points
 * 
 * Examples:
 * - Exact score, group stage: 5 points
 * - Exact score, knockout (no penalty): 7 points (5+2)
 * - Exact score, knockout (with correct penalty): 9 points (5+2+2)
 * - Correct winner + correct goal difference: 4 points (3+1)
 * - Correct winner only: 3 points
 * - Wrong result: 0 points
 */

export interface PointsBreakdown {
  basePoints: number
  goalDifferenceBonus: number
  knockoutBonus: number
  penaltyBonus: number
  totalPoints: number
  notes: string
  isKnockout: boolean
}

/**
 * Knockout stage identifiers
 */
const KNOCKOUT_STAGES = [
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
]

/**
 * Calculate points using advanced scoring rules
 * 
 * @param predictedHome - Predicted home team score
 * @param predictedAway - Predicted away team score
 * @param predictedPenaltyWinner - Predicted penalty winner ('home' | 'away' | null)
 * @param actualHome - Actual home team score
 * @param actualAway - Actual away team score
 * @param actualPenaltyWinner - Actual penalty winner ('home' | 'away' | null)
 * @param competitionRound - Tournament stage (e.g., 'GROUP_STAGE', 'ROUND_OF_16')
 * @returns Detailed points breakdown
 */
export function calculateAdvancedPoints(
  predictedHome: number,
  predictedAway: number,
  predictedPenaltyWinner: 'home' | 'away' | null,
  actualHome: number,
  actualAway: number,
  actualPenaltyWinner: 'home' | 'away' | null,
  competitionRound: string
): PointsBreakdown {
  // Validate inputs
  if (
    predictedHome < 0 ||
    predictedAway < 0 ||
    actualHome < 0 ||
    actualAway < 0
  ) {
    throw new Error('Scores cannot be negative')
  }

  let basePoints = 0
  let goalDifferenceBonus = 0
  let knockoutBonus = 0
  let penaltyBonus = 0
  let notes = ''

  // Determine if knockout stage
  const isKnockout = KNOCKOUT_STAGES.includes(competitionRound.toUpperCase())

  // Calculate goal differences
  const predictedDiff = Math.abs(predictedHome - predictedAway)
  const actualDiff = Math.abs(actualHome - actualAway)

  // Determine results
  const predictedResult = getResult(predictedHome, predictedAway)
  const actualResult = getResult(actualHome, actualAway)

  // RULE 1: Exact score (5 base points)
  if (predictedHome === actualHome && predictedAway === actualAway) {
    basePoints = 5
    notes = '🎯 Exact score predicted!'

    // RULE 4: Knockout bonus for exact score (+2 points)
    if (isKnockout) {
      knockoutBonus = 2
      notes += ' + Knockout stage bonus!'
    }
  }
  // RULE 2: Correct result (3 points)
  else if (predictedResult === actualResult) {
    basePoints = 3
    notes = '✓ Correct winner/result!'

    // RULE 3: Goal difference bonus (+1 point)
    if (predictedDiff === actualDiff) {
      goalDifferenceBonus = 1
      notes += ' + Correct goal difference!'
    }
  }
  // RULE 6: Wrong result (0 points)
  else {
    basePoints = 0
    notes = '✗ Incorrect result'
  }

  // RULE 5: Penalty shootout bonus (+2 points)
  if (
    isKnockout &&
    actualPenaltyWinner &&
    predictedPenaltyWinner === actualPenaltyWinner
  ) {
    penaltyBonus = 2
    notes += ' + Correct penalty winner!'
  }

  const totalPoints = basePoints + goalDifferenceBonus + knockoutBonus + penaltyBonus

  return {
    basePoints,
    goalDifferenceBonus,
    knockoutBonus,
    penaltyBonus,
    totalPoints,
    notes,
    isKnockout,
  }
}

/**
 * Determine match result (home win, draw, or away win)
 */
function getResult(homeScore: number, awayScore: number): 'home' | 'draw' | 'away' {
  if (homeScore > awayScore) return 'home'
  if (homeScore < awayScore) return 'away'
  return 'draw'
}

/**
 * Get a human-readable description of points with breakdown
 */
export function getPointsDescription(breakdown: PointsBreakdown): string {
  const parts: string[] = []

  if (breakdown.basePoints > 0) {
    parts.push(`${breakdown.basePoints}pts (${breakdown.basePoints === 5 ? 'exact score' : 'correct result'})`)
  }

  if (breakdown.goalDifferenceBonus > 0) {
    parts.push(`+${breakdown.goalDifferenceBonus}pt (goal diff)`)
  }

  if (breakdown.knockoutBonus > 0) {
    parts.push(`+${breakdown.knockoutBonus}pts (knockout)`)
  }

  if (breakdown.penaltyBonus > 0) {
    parts.push(`+${breakdown.penaltyBonus}pts (penalty)`)
  }

  if (parts.length === 0) {
    return '0 points'
  }

  return `${breakdown.totalPoints} total: ${parts.join(' ')}`
}

/**
 * Get emoji representation based on points
 */
export function getPointsEmoji(totalPoints: number): string {
  if (totalPoints >= 9) return '🏆' // Maximum possible
  if (totalPoints >= 7) return '🥇' // Knockout exact score
  if (totalPoints >= 5) return '🎯' // Exact score
  if (totalPoints >= 4) return '✓✓' // Result + goal diff
  if (totalPoints >= 3) return '✓' // Result only
  return '✗' // Wrong
}

/**
 * Format breakdown for display
 */
export function formatBreakdown(breakdown: PointsBreakdown): {
  label: string
  value: number
  color: string
}[] {
  const items: { label: string; value: number; color: string }[] = []

  if (breakdown.basePoints > 0) {
    items.push({
      label: breakdown.basePoints === 5 ? 'Exact Score' : 'Correct Result',
      value: breakdown.basePoints,
      color: breakdown.basePoints === 5 ? '#009A44' : '#0052B4',
    })
  }

  if (breakdown.goalDifferenceBonus > 0) {
    items.push({
      label: 'Goal Difference',
      value: breakdown.goalDifferenceBonus,
      color: '#F3A81D',
    })
  }

  if (breakdown.knockoutBonus > 0) {
    items.push({
      label: 'Knockout Bonus',
      value: breakdown.knockoutBonus,
      color: '#D80027',
    })
  }

  if (breakdown.penaltyBonus > 0) {
    items.push({
      label: 'Penalty Bonus',
      value: breakdown.penaltyBonus,
      color: '#8B0A1E',
    })
  }

  return items
}
