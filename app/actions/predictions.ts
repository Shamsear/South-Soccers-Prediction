/**
 * Prediction Server Actions
 * 
 * Requirements:
 * - 4 (Prediction Submission)
 * - 5 (Lock enforcement via trigger)
 * - 15 (Toast notifications)
 * 
 * Server actions for prediction-related mutations.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

interface SubmitPredictionResult {
  success?: boolean
  error?: string
  data?: any
}

/**
 * Submit a prediction for a match
 * 
 * @param matchId - The match ID
 * @param predictedHome - Predicted home team score
 * @param predictedAway - Predicted away team score
 * @returns Success or error response
 */
export async function submitPrediction(
  matchId: string,
  predictedHome: number,
  predictedAway: number
): Promise<SubmitPredictionResult> {
  try {
    const supabase = await createServerClient()

    // Verify authentication using getUser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in to submit predictions.' }
    }

    // Validate input
    if (!matchId) {
      return { error: 'Match ID is required' }
    }

    if (typeof predictedHome !== 'number' || typeof predictedAway !== 'number') {
      return { error: 'Scores must be valid numbers' }
    }

    if (predictedHome < 0 || predictedHome > 15 || predictedAway < 0 || predictedAway > 15) {
      return { error: 'Scores must be between 0 and 15' }
    }

    // Use upsert with onConflict to handle race conditions atomically
    // This prevents duplicate predictions and handles concurrent submissions
    // The database trigger will still validate kickoff time
    const { data, error } = await (supabase
      .from('predictions') as any)
      .upsert(
        {
          user_id: user.id,
          match_id: matchId,
          predicted_home: predictedHome,
          predicted_away: predictedAway,
        },
        {
          onConflict: 'user_id,match_id',
          ignoreDuplicates: false, // Update existing prediction
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Prediction submission error:', error)

      // Handle kickoff time validation error from DB trigger
      if (
        error.message.includes('kicked off') ||
        error.message.includes('Predictions locked') ||
        error.message.includes('kickoff') ||
        error.message.includes('started or finished')
      ) {
        return { error: 'Predictions locked. This match has already kicked off.' }
      }

      // Handle foreign key constraint (invalid match_id)
      if (error.code === '23503') {
        return { error: 'Invalid match. Please try again.' }
      }

      // Generic error
      return { error: error.message || 'Failed to submit prediction. Please try again.' }
    }

    // Revalidate affected pages
    revalidatePath(`/matches/${matchId}`)
    revalidatePath('/matches')
    revalidatePath('/my-predictions')

    // Return success response for client toast display
    return {
      success: true,
      data,
    }

  } catch (error) {
    console.error('Unexpected error in submitPrediction:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
