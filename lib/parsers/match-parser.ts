/**
 * Match Parser and Status Mapper
 * 
 * Requirements:
 * - 2.8 (Status mapping)
 * - 7 (Knockout Regular Time)
 * - 24 (Parser for API data)
 * 
 * Transforms external API match data to internal database format.
 */

import type { FootballDataMatch } from '../football-api'

/**
 * Internal Match Entity (for database insertion)
 */
export interface ParsedMatch {
  external_id: number
  home_team: string
  away_team: string
  home_team_logo: string | null
  away_team_logo: string | null
  home_score: number | null
  away_score: number | null
  status: 'upcoming' | 'live' | 'finished'
  kickoff_time: string
  competition_round: string
  group_name: string | null
  venue: string | null
}

/**
 * Map external API status to internal status values
 * 
 * External API statuses:
 * - SCHEDULED, TIMED → upcoming
 * - LIVE, IN_PLAY, PAUSED → live
 * - FINISHED → finished
 * - POSTPONED, SUSPENDED, CANCELLED → upcoming (treat as rescheduled)
 * 
 * @param apiStatus - Status from football-data.org API
 * @returns Internal status value
 */
export function mapStatus(
  apiStatus: string
): 'upcoming' | 'live' | 'finished' {
  const statusMap: Record<string, 'upcoming' | 'live' | 'finished'> = {
    // Upcoming matches
    'SCHEDULED': 'upcoming',
    'TIMED': 'upcoming',
    'POSTPONED': 'upcoming',
    'SUSPENDED': 'upcoming',
    'CANCELLED': 'upcoming',
    
    // Live matches
    'LIVE': 'live',
    'IN_PLAY': 'live',
    'PAUSED': 'live', // Half-time, extra-time break, etc.
    
    // Finished matches
    'FINISHED': 'finished',
  }

  const mappedStatus = statusMap[apiStatus]
  
  if (!mappedStatus) {
    console.warn(`Unknown match status: ${apiStatus}, defaulting to 'upcoming'`)
    return 'upcoming'
  }

  return mappedStatus
}

/**
 * Extract the appropriate score based on match duration
 * 
 * For knockout matches that go to extra time or penalties:
 * - Use score.regularTime if available (90 minutes + injury time)
 * - Fallback to score.fullTime if regularTime not available
 * 
 * This ensures predictions are scored based on regular time only,
 * not including extra time or penalties.
 * 
 * @param match - Match data from external API
 * @returns Object with home and away scores
 */
export function extractScore(match: FootballDataMatch): {
  home_score: number | null
  away_score: number | null
} {
  const { score } = match

  // For knockout matches with extra time or penalties, prefer regularTime
  if (score.duration === 'EXTRA_TIME' || score.duration === 'PENALTY_SHOOTOUT') {
    if (score.regularTime) {
      return {
        home_score: score.regularTime.home,
        away_score: score.regularTime.away,
      }
    }
  }

  // Default to fullTime score
  return {
    home_score: score.fullTime.home,
    away_score: score.fullTime.away,
  }
}

/**
 * Parse a single match from external API format to internal format
 * 
 * Handles:
 * - Missing optional fields (venue, group, crest URLs)
 * - Score extraction based on match duration
 * - Status mapping
 * - Data validation and error logging
 * 
 * @param apiMatch - Match object from football-data.org API
 * @returns Parsed match object for database insertion
 */
export function parseMatch(apiMatch: FootballDataMatch): ParsedMatch | null {
  try {
    // Skip matches with null team names (knockout matches where teams haven't qualified yet)
    if (!apiMatch.homeTeam.name || !apiMatch.awayTeam.name) {
      console.log(`Skipping match ${apiMatch.id}: Teams not determined yet (${apiMatch.stage})`)
      return null
    }

    // Extract scores (handles regular time vs full time)
    const { home_score, away_score } = extractScore(apiMatch)

    // Map status
    const status = mapStatus(apiMatch.status)

    // Parse match data with fallbacks for optional fields
    const parsedMatch: ParsedMatch = {
      external_id: apiMatch.id,
      home_team: apiMatch.homeTeam.name,
      away_team: apiMatch.awayTeam.name,
      home_team_logo: apiMatch.homeTeam.crest || null,
      away_team_logo: apiMatch.awayTeam.crest || null,
      home_score,
      away_score,
      status,
      kickoff_time: apiMatch.utcDate,
      competition_round: apiMatch.stage || 'Unknown',
      group_name: apiMatch.group || null,
      venue: apiMatch.venue || null,
    }

    // Validate required fields
    if (!parsedMatch.external_id) {
      console.error('Missing external_id for match:', apiMatch)
      return null
    }

    if (!parsedMatch.kickoff_time) {
      console.error('Missing kickoff_time for match:', apiMatch)
      return null
    }

    return parsedMatch

  } catch (error) {
    console.error('Failed to parse match:', apiMatch.id, error)
    return null
  }
}

/**
 * Parse multiple matches from API response
 * 
 * Filters out any matches that fail to parse and logs errors.
 * Returns only successfully parsed matches.
 * 
 * @param apiMatches - Array of matches from football-data.org API
 * @returns Array of parsed matches ready for database insertion
 */
export function parseMatches(apiMatches: FootballDataMatch[]): ParsedMatch[] {
  const parsedMatches: ParsedMatch[] = []
  let skippedCount = 0
  let errorCount = 0

  for (const apiMatch of apiMatches) {
    const parsed = parseMatch(apiMatch)
    
    if (parsed === null) {
      skippedCount++
    } else {
      parsedMatches.push(parsed)
    }
  }

  // Log summary
  console.log(`Successfully parsed ${parsedMatches.length} matches`)
  if (skippedCount > 0) {
    console.log(`Skipped ${skippedCount} matches (teams not determined yet for knockout stages)`)
  }

  return parsedMatches
}

/**
 * Validate parsed match data before database insertion
 * 
 * @param match - Parsed match object
 * @returns true if valid, false otherwise
 */
export function isValidMatch(match: ParsedMatch): boolean {
  // Check required fields
  if (!match.external_id || match.external_id <= 0) {
    return false
  }

  if (!match.home_team || !match.away_team) {
    return false
  }

  if (!match.kickoff_time) {
    return false
  }

  // Check status is valid
  if (!['upcoming', 'live', 'finished'].includes(match.status)) {
    return false
  }

  // Check scores are valid if match is finished
  if (match.status === 'finished') {
    if (match.home_score === null || match.away_score === null) {
      return false
    }
    if (match.home_score < 0 || match.away_score < 0) {
      return false
    }
  }

  return true
}
