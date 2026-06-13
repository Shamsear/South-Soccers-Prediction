/**
 * Admin Server Actions
 * 
 * Requirements:
 * - 6 (Prediction Scoring)
 * - 6.9-6.12 (Update user stats)
 * 
 * Server actions for admin-only operations.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { calculatePoints } from '@/lib/scoring'

interface ScoreMatchResult {
  success?: boolean
  error?: string
  count?: number
}

interface ImportPredictionResult {
  success?: boolean
  error?: string
  message?: string
}

/**
 * Score a match and calculate points for all predictions
 * 
 * @param matchId - The match ID
 * @param homeScore - Final home team score
 * @param awayScore - Final away team score
 * @returns Success or error response
 */
export async function scoreMatch(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<ScoreMatchResult> {
  try {
    const supabase = await createServerClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { error: 'Unable to verify user role' }
    }

    const typedProfile = profile as { role: string }
    if (typedProfile.role !== 'admin') {
      return { error: 'Forbidden: Admin access required' }
    }

    // Validate input
    if (!matchId) {
      return { error: 'Match ID is required' }
    }

    if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
      return { error: 'Scores must be valid numbers' }
    }

    if (homeScore < 0 || awayScore < 0) {
      return { error: 'Scores cannot be negative' }
    }

    // Use service role client for privileged operations
    const serviceSupabase = createServiceRoleClient()

    // Update match record with final scores
    const { error: matchUpdateError } = await (serviceSupabase
      .from('matches') as any)
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished',
        winner_announced: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)

    if (matchUpdateError) {
      console.error('Error updating match:', matchUpdateError)
      return { error: 'Failed to update match scores' }
    }

    // Fetch all predictions for this match
    const { data: predictions, error: predictionsError } = await serviceSupabase
      .from('predictions')
      .select('id, user_id, predicted_home, predicted_away')
      .eq('match_id', matchId)

    if (predictionsError) {
      console.error('Error fetching predictions:', predictionsError)
      return { error: 'Failed to fetch predictions' }
    }

    if (!predictions || predictions.length === 0) {
      // No predictions to score
      return {
        success: true,
        count: 0,
      }
    }

    // Calculate points for each prediction and update
    const now = new Date().toISOString()
    const typedPredictions = predictions as any[]
    const updatePromises = typedPredictions.map(async (prediction) => {
      const points = calculatePoints(
        prediction.predicted_home,
        prediction.predicted_away,
        homeScore,
        awayScore
      )

      return (serviceSupabase
        .from('predictions') as any)
        .update({
          points_awarded: points,
          scored_at: now,
        })
        .eq('id', prediction.id)
    })

    const updateResults = await Promise.all(updatePromises)
    
    // Check for errors in updates
    const updateErrors = updateResults.filter(result => result.error)
    if (updateErrors.length > 0) {
      console.error('Error updating predictions:', updateErrors)
      return { error: 'Failed to update some predictions' }
    }

    // Get unique user IDs
    const userIds = [...new Set(typedPredictions.map(p => p.user_id))]

    // Update each user's total_points and correct_predictions
    const userUpdatePromises = userIds.map(async (userId) => {
      // Get all scored predictions for this user
      const { data: userPredictions, error: userPredError } = await serviceSupabase
        .from('predictions')
        .select('points_awarded')
        .eq('user_id', userId)
        .not('points_awarded', 'is', null)

      if (userPredError || !userPredictions) {
        console.error(`Error fetching predictions for user ${userId}:`, userPredError)
        return
      }

      const typedUserPredictions = userPredictions as Array<{ points_awarded: number | null }>

      // Calculate total points
      const totalPoints = typedUserPredictions.reduce(
        (sum, pred) => sum + (pred.points_awarded || 0),
        0
      )

      // Count correct predictions (3 points = exact score)
      const correctPredictions = typedUserPredictions.filter(
        pred => pred.points_awarded === 3
      ).length

      // Update user profile
      return (serviceSupabase
        .from('profiles') as any)
        .update({
          total_points: totalPoints,
          correct_predictions: correctPredictions,
        })
        .eq('id', userId)
    })

    await Promise.all(userUpdatePromises)

    // Refresh leaderboard materialized view
    const { error: refreshError } = await serviceSupabase.rpc('refresh_leaderboard')

    if (refreshError) {
      console.error('Error refreshing leaderboard:', refreshError)
      // Don't fail the operation, just log the error
    }

    // Revalidate affected pages
    revalidatePath('/admin/matches')
    revalidatePath('/leaderboard')
    revalidatePath('/matches')
    revalidatePath(`/matches/${matchId}`)

    return {
      success: true,
      count: predictions.length,
    }

  } catch (error) {
    console.error('Unexpected error in scoreMatch:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

/**
 * Import a single prediction from external source (e.g., Google Forms)
 * and automatically calculate points if match is finished
 * 
 * @param data - Prediction data (userId, matchId, predictedHome, predictedAway)
 * @returns Success or error response
 */
export async function importPrediction(data: {
  userId: string
  matchId: string
  predictedHome: number
  predictedAway: number
}): Promise<ImportPredictionResult> {
  try {
    const supabase = await createServerClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { error: 'Unable to verify user role' }
    }

    const typedProfile = profile as { role: string }
    if (typedProfile.role !== 'admin') {
      return { error: 'Forbidden: Admin access required' }
    }

    // Validate input
    const { userId, matchId, predictedHome, predictedAway } = data

    if (!userId || !matchId) {
      return { error: 'User ID and Match ID are required' }
    }

    if (typeof predictedHome !== 'number' || typeof predictedAway !== 'number') {
      return { error: 'Predicted scores must be valid numbers' }
    }

    if (predictedHome < 0 || predictedAway < 0) {
      return { error: 'Predicted scores cannot be negative' }
    }

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Check if prediction already exists
    const { data: existing } = await serviceSupabase
      .from('predictions')
      .select('id')
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .maybeSingle()

    if (existing) {
      return { error: 'Prediction already exists for this user and match' }
    }

    // Fetch match details
    const { data: match, error: matchError } = await serviceSupabase
      .from('matches')
      .select('home_score, away_score, status, home_team, away_team')
      .eq('id', matchId)
      .single()

    if (matchError || !match) {
      return { error: 'Match not found' }
    }

    const typedMatch = match as {
      home_score: number | null
      away_score: number | null
      status: string
      home_team: string
      away_team: string
    }

    // Prepare prediction data
    const predictionData: any = {
      user_id: userId,
      match_id: matchId,
      predicted_home: predictedHome,
      predicted_away: predictedAway,
      created_at: new Date().toISOString(),
    }

    // Calculate points if match is finished
    if (
      typedMatch.status === 'finished' &&
      typedMatch.home_score !== null &&
      typedMatch.away_score !== null
    ) {
      const points = calculatePoints(
        predictedHome,
        predictedAway,
        typedMatch.home_score,
        typedMatch.away_score
      )
      predictionData.points_awarded = points
      predictionData.scored_at = new Date().toISOString()
    }

    // Insert prediction
    const { error: insertError } = await serviceSupabase
      .from('predictions')
      .insert(predictionData)

    if (insertError) {
      console.error('Error inserting prediction:', insertError)
      return { error: 'Failed to import prediction' }
    }

    // Update user stats if points were calculated
    if (predictionData.points_awarded !== undefined) {
      // Get all scored predictions for this user
      const { data: userPredictions } = await serviceSupabase
        .from('predictions')
        .select('points_awarded')
        .eq('user_id', userId)
        .not('points_awarded', 'is', null)

      if (userPredictions) {
        const typedUserPredictions = userPredictions as Array<{ points_awarded: number | null }>

        const totalPoints = typedUserPredictions.reduce(
          (sum, pred) => sum + (pred.points_awarded || 0),
          0
        )

        const correctPredictions = typedUserPredictions.filter(
          pred => pred.points_awarded === 3
        ).length

        await serviceSupabase
          .from('profiles')
          .update({
            total_points: totalPoints,
            correct_predictions: correctPredictions,
          })
          .eq('id', userId)
      }

      // Refresh leaderboard
      await serviceSupabase.rpc('refresh_leaderboard')
    }

    // Revalidate affected pages
    revalidatePath('/admin/import-predictions')
    revalidatePath('/leaderboard')
    revalidatePath(`/matches/${matchId}`)
    revalidatePath('/all-predictions')

    const message = predictionData.points_awarded !== undefined
      ? `Prediction imported with ${predictionData.points_awarded} points!`
      : 'Prediction imported! Points will be calculated when match is scored.'

    return {
      success: true,
      message,
    }

  } catch (error) {
    console.error('Unexpected error in importPrediction:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
