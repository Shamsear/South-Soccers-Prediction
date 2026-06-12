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
  actualAway: number
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

  // Check for exact scoreline match (3 points)
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3
  }

  // Determine actual result
  const actualResult = getResult(actualHome, actualAway)
  
  // Determine predicted result
  const predictedResult = getResult(predictedHome, predictedAway)

  // Check if result is correct (1 point)
  if (actualResult === predictedResult) {
    return 1
  }

  // Incorrect result (0 points)
  return 0
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
 * @param points - Points awarded (0, 1, or 3)
 * @returns Description string
 */
export function getPointsDescription(points: number): string {
  switch (points) {
    case 3:
      return '🎯 Exact score!'
    case 1:
      return '✓ Correct result'
    case 0:
      return 'Incorrect'
    default:
      return 'Unknown'
  }
}
