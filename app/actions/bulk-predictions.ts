/**
 * Bulk Prediction Server Actions
 * 
 * Server actions for submitting multiple predictions at once
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

interface BulkPrediction {
  matchId: string
  predictedHome: number
  predictedAway: number
}

interface BulkPredictionResult {
  success: boolean
  successCount: number
  failureCount: number
  errors?: { matchId: string; error: string }[]
}

/**
 * Submit multiple predictions at once
 * 
 * @param predictions - Array of predictions to submit
 * @returns Success count, failure count, and errors
 */
export async function submitBulkPredictions(
  predictions: BulkPrediction[]
): Promise<BulkPredictionResult> {
  try {
    const supabase = await createServerClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        successCount: 0,
        failureCount: predictions.length,
        errors: predictions.map(p => ({
          matchId: p.matchId,
          error: 'Unauthorized. Please sign in.',
        })),
      }
    }

    // Validate all predictions first
    const validationErrors: { matchId: string; error: string }[] = []
    const validPredictions: BulkPrediction[] = []

    for (const pred of predictions) {
      if (!pred.matchId) {
        validationErrors.push({ matchId: pred.matchId, error: 'Match ID is required' })
        continue
      }

      if (typeof pred.predictedHome !== 'number' || typeof pred.predictedAway !== 'number') {
        validationErrors.push({ matchId: pred.matchId, error: 'Scores must be valid numbers' })
        continue
      }

      if (pred.predictedHome < 0 || pred.predictedHome > 15 || pred.predictedAway < 0 || pred.predictedAway > 15) {
        validationErrors.push({ matchId: pred.matchId, error: 'Scores must be between 0 and 15' })
        continue
      }

      validPredictions.push(pred)
    }

    if (validPredictions.length === 0) {
      return {
        success: false,
        successCount: 0,
        failureCount: predictions.length,
        errors: validationErrors,
      }
    }

    // Submit all valid predictions
    const results = await Promise.allSettled(
      validPredictions.map(async (pred) => {
        const { error } = await (supabase
          .from('predictions') as any)
          .upsert(
            {
              user_id: user.id,
              match_id: pred.matchId,
              predicted_home: pred.predictedHome,
              predicted_away: pred.predictedAway,
            },
            {
              onConflict: 'user_id,match_id',
              ignoreDuplicates: false,
            }
          )

        if (error) {
          throw { matchId: pred.matchId, error: error.message }
        }

        return pred.matchId
      })
    )

    // Count successes and failures
    let successCount = 0
    const errors: { matchId: string; error: string }[] = [...validationErrors]

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        successCount++
      } else {
        const error = result.reason
        errors.push({
          matchId: error.matchId || 'unknown',
          error: error.error || 'Unknown error',
        })
      }
    })

    // Revalidate affected pages
    revalidatePath('/matches')
    revalidatePath('/all-predictions')

    return {
      success: successCount > 0,
      successCount,
      failureCount: predictions.length - successCount,
      errors: errors.length > 0 ? errors : undefined,
    }

  } catch (error) {
    console.error('Unexpected error in submitBulkPredictions:', error)
    return {
      success: false,
      successCount: 0,
      failureCount: predictions.length,
      errors: [{ matchId: 'all', error: 'An unexpected error occurred' }],
    }
  }
}
