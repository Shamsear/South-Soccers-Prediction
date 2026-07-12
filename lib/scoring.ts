/**
 * Scoring Calculation Utility
 * 
 * Requirements:
 * - 6.5-6.7 (Point calculation rules)
 * 
 * Calculates points awarded for predictions based on actual match results.
 */

/**
 * Calculate points awarded for a prediction
 * 
 * Point System:
 * - 3 points: Exact scoreline match (e.g., predicted 2-1, actual 2-1)
 * - 1 point: Correct result but wrong score (e.g., predicted 2-0, actual 3-1, both home wins)
 * - 0 points: Incorrect result (e.g., predicted home win, actual draw/away win)
 * 
 * @param predictedHome - Predicted home team score
 * @param predictedAway - Predicted away team score
 * @param actualHome - Actual home team score
 * @param actualAway - Actual away team score
 * @returns Points awarded (0, 1, or 3)
 */
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  predictedPenaltyWinner?: string | null,
  actualPenaltyWinner?: string | null,
  competitionRound?: string
): number {
  // Validate inputs
  if (
    predictedHome < 0 ||
    predictedAway < 0 ||
    actualHome < 0 ||
    actualAway < 0
  ) {
    throw new Error('Scores cannot be negative')
  }

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

  const predictedDiff = Math.abs(predictedHome - predictedAway)
  const actualDiff = Math.abs(actualHome - actualAway)

  const predictedResult = getResult(predictedHome, predictedAway)
  const actualResult = getResult(actualHome, actualAway)

  let basePoints = 0
  let goalDiffBonus = 0
  let knockoutBonus = 0
  let penaltyBonus = 0

  // 1. Exact score (5 points)
  if (predictedHome === actualHome && predictedAway === actualAway) {
    basePoints = 5
    if (isKnockout) {
      knockoutBonus = 2
    }
  }
  // 2. Correct winner/result (3 points)
  else if (predictedResult === actualResult) {
    basePoints = 3
    // Goal difference bonus (+1 point, excluding draws)
    if (predictedDiff === actualDiff && actualResult !== 'draw') {
      goalDiffBonus = 1
    }
  } else {
    basePoints = 0
  }

  // Penalty shootout bonus (+2 points)
  if (
    isKnockout &&
    actualPenaltyWinner &&
    predictedPenaltyWinner === actualPenaltyWinner
  ) {
    penaltyBonus = 2
  }

  return basePoints + goalDiffBonus + knockoutBonus + penaltyBonus
}

/**
 * Determine match result (home win, draw, or away win)
 * 
 * @param homeScore - Home team score
 * @param awayScore - Away team score
 * @returns Result as 'home', 'draw', or 'away'
 */
function getResult(homeScore: number, awayScore: number): 'home' | 'draw' | 'away' {
  if (homeScore > awayScore) {
    return 'home'
  }
  if (homeScore < awayScore) {
    return 'away'
  }
  return 'draw'
}

/**
 * Get a human-readable description of the points awarded
 * 
 * @param points - Points awarded
 * @returns Description string
 */
export function getPointsDescription(points: number): string {
  switch (points) {
    case 9:
      return '🎯 Exact Score + KO + Penalty Winner!'
    case 7:
      return '🎯 Exact Score + KO Bonus!'
    case 5:
      return '🎯 Exact Score!'
    case 4:
      return '✓ Result + Margin Bonus'
    case 3:
      return '✓ Correct Result'
    case 0:
      return 'Incorrect'
    default:
      return `${points} Points`
  }
}
