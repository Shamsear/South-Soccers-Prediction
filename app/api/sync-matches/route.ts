/**
 * Traffic-Driven Match Sync API Route
 * 
 * Requirements:
 * - 2 (Traffic-driven sync)
 * - 2.1-2.7 (Sync criteria)
 * - 16 (Rate limiting)
 * 
 * API endpoint that intelligently syncs match data from football-data.org
 * based on traffic and match urgency, with 5-minute throttling.
 */

import { NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { fetchMatches, FootballApiError } from '@/lib/football-api'
import { parseMatches } from '@/lib/parsers/match-parser'

// Configuration
const API_POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const URGENT_MATCH_WINDOW_MS = 2 * 60 * 60 * 1000 // 2 hours

/**
 * GET /api/sync-matches
 * 
 * Traffic-driven sync endpoint that:
 * 1. Checks authentication
 * 2. Queries last poll timestamp
 * 3. Returns cached data if < 5 minutes since last poll
 * 4. Checks for live or imminent matches
 * 5. Fetches from external API only if urgent matches exist
 * 6. Performs bulk upsert on matches table
 * 7. Updates api_last_polled_at timestamp
 * 
 * Query Parameters:
 * - force=true: Admin-only parameter to force sync regardless of urgency
 */
export async function GET(request: Request) {
  try {
    // Check authentication using regular server client
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Check for force parameter (admin only)
    const { searchParams } = new URL(request.url)
    const forceSync = searchParams.get('force') === 'true'

    // Query last poll timestamp using service role (bypasses RLS)
    const serviceSupabase = createServiceRoleClient()
    
    // If force sync, verify admin role
    if (forceSync) {
      const { data: profile } = await serviceSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const typedProfile = profile as { role: string } | null
      if (!typedProfile || typedProfile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden. Force sync requires admin role.' },
          { status: 403 }
        )
      }
    }
    
    const { data: lastPollData, error: pollError } = await serviceSupabase
      .from('matches')
      .select('api_last_polled_at')
      .order('api_last_polled_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    if (pollError) {
      console.error('Error querying last poll timestamp:', pollError)
    }

    const now = new Date()
    const typedLastPollData = lastPollData as { api_last_polled_at: string | null } | null
    const lastPolled = typedLastPollData?.api_last_polled_at 
      ? new Date(typedLastPollData.api_last_polled_at)
      : null

    // Check if we should skip sync due to rate limiting (< 5 minutes)
    // Skip this check if force sync is enabled
    if (!forceSync && lastPolled) {
      const timeSinceLastPoll = now.getTime() - lastPolled.getTime()
      
      if (timeSinceLastPoll < API_POLL_INTERVAL_MS) {
        const nextSyncIn = Math.ceil((API_POLL_INTERVAL_MS - timeSinceLastPoll) / 1000)
        
        return NextResponse.json({
          cached: true,
          message: 'Using cached data (rate limit)',
          lastPolled: lastPolled.toISOString(),
          nextSyncAvailableIn: `${nextSyncIn} seconds`,
          timeSinceLastPoll: `${Math.floor(timeSinceLastPoll / 1000)} seconds`,
        })
      }
    }

    // Check for urgent matches (live or imminent kickoffs within 2 hours)
    const twoHoursFromNow = new Date(now.getTime() + URGENT_MATCH_WINDOW_MS)
    
    const { data: urgentMatches, error: urgentError } = await serviceSupabase
      .from('matches')
      .select('id, status, kickoff_time, home_team, away_team')
      .or(`status.eq.live,and(status.eq.upcoming,kickoff_time.lte.${twoHoursFromNow.toISOString()})`)

    if (urgentError) {
      console.error('Error checking for urgent matches:', urgentError)
    }

    type UrgentMatch = {
      id: string
      status: string
      kickoff_time: string
      home_team: string
      away_team: string
    }

    const typedUrgentMatches = (urgentMatches as UrgentMatch[]) || []

    // If no urgent matches and not force sync, return cached data
    if (!forceSync && typedUrgentMatches.length === 0) {
      return NextResponse.json({
        cached: true,
        message: 'No live or imminent matches (within 2 hours). Use ?force=true to sync anyway.',
        lastPolled: lastPolled?.toISOString() || 'never',
        urgentMatches: 0,
      })
    }

    // Urgent matches exist or force sync - fetch from external API
    if (forceSync) {
      console.log('Force sync enabled by admin')
    } else {
      console.log(`Syncing matches: ${typedUrgentMatches.length} urgent matches found`)
      console.log('Urgent matches:', typedUrgentMatches.map(m => `${m.home_team} vs ${m.away_team} (${m.status})`))
    }

    try {
      // Fetch matches from football-data.org API
      const apiResponse = await fetchMatches('2026')
      
      console.log(`Fetched ${apiResponse.matches.length} matches from external API`)

      // Parse matches to internal format
      const parsedMatches = parseMatches(apiResponse.matches)

      if (parsedMatches.length === 0) {
        return NextResponse.json({
          error: 'No valid matches to sync',
          fetched: apiResponse.matches.length,
          parsed: 0,
        }, { status: 500 })
      }

      // Bulk upsert matches using service role client
      // Using onConflict with external_id to update existing matches
      const { error: upsertError, count } = await (serviceSupabase
        .from('matches') as any)
        .upsert(
          parsedMatches.map(match => ({
            ...match,
            api_last_polled_at: now.toISOString(),
            updated_at: now.toISOString(),
          })),
          {
            onConflict: 'external_id',
            ignoreDuplicates: false, // Update existing records
          }
        )

      if (upsertError) {
        console.error('Error upserting matches:', upsertError)
        return NextResponse.json({
          error: 'Failed to save matches to database',
          details: upsertError.message,
        }, { status: 500 })
      }

      console.log(`Successfully synced ${parsedMatches.length} matches`)

      // Return success response with metadata
      return NextResponse.json({
        success: true,
        synced: true,
        count: parsedMatches.length,
        urgentMatches: typedUrgentMatches.length,
        forced: forceSync,
        lastPolled: now.toISOString(),
        message: forceSync 
          ? `Force sync: Successfully synced ${parsedMatches.length} matches`
          : `Successfully synced ${parsedMatches.length} matches`,
      })

    } catch (apiError) {
      // Handle external API errors
      if (apiError instanceof FootballApiError) {
        console.error('Football API error:', apiError.message, apiError.statusCode)
        
        // For rate limit errors, inform the user but don't fail completely
        if (apiError.statusCode === 429) {
          return NextResponse.json({
            cached: true,
            error: 'API rate limit exceeded',
            message: apiError.message,
            lastPolled: lastPolled?.toISOString() || 'never',
          }, { status: 429 })
        }

        // For auth errors, this is critical - log for admin notification
        if (apiError.statusCode === 401) {
          console.error('🚨 CRITICAL: Football API authentication failed!', {
            message: apiError.message,
            timestamp: new Date().toISOString(),
            action: 'Check FOOTBALL_DATA_API_KEY environment variable',
          })
          
          return NextResponse.json({
            error: 'API authentication failed',
            message: apiError.message,
            critical: true,
          }, { status: 500 })
        }

        // For server errors, fall back to cached data
        if (apiError.statusCode && apiError.statusCode >= 500) {
          return NextResponse.json({
            cached: true,
            error: 'External API unavailable',
            message: apiError.message,
            lastPolled: lastPolled?.toISOString() || 'never',
          }, { status: 500 })
        }
      }

      // Unknown error
      console.error('Sync error:', apiError)
      return NextResponse.json({
        error: 'Failed to sync matches',
        message: apiError instanceof Error ? apiError.message : 'Unknown error',
        cached: true,
        lastPolled: lastPolled?.toISOString() || 'never',
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Unexpected error in sync route:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
