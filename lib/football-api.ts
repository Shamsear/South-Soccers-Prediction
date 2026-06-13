/**
 * Football Data API Client
 * 
 * Requirements:
 * - 2 (Match Data Synchronization)
 * - 16 (API Rate Limiting)
 * - 23 (Error Handling)
 * 
 * Client for interacting with football-data.org API to fetch World Cup 2026 match data.
 */

const FOOTBALL_API_BASE = 'https://api.football-data.org/v4'

/**
 * External API Response Types
 */
export interface FootballDataMatchResponse {
  filters: {
    season: string
  }
  resultSet: {
    count: number
    first: string
    last: string
    played: number
  }
  competition: {
    id: number
    name: string
    code: string
    type: string
    emblem: string
  }
  matches: FootballDataMatch[]
}

export interface FootballDataMatch {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'TIMED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED'
  matchday: number
  stage: string
  group: string | null
  lastUpdated: string
  homeTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  awayTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  score: {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT'
    fullTime: {
      home: number | null
      away: number | null
    }
    halfTime: {
      home: number | null
      away: number | null
    }
    regularTime?: {
      home: number | null
      away: number | null
    }
    extraTime?: {
      home: number | null
      away: number | null
    }
    penalties?: {
      home: number | null
      away: number | null
    }
  }
  odds?: {
    msg: string
  }
  referees: Array<{
    id: number
    name: string
    type: string
    nationality: string
  }>
  venue?: string | null
}

/**
 * API Error Class
 */
export class FootballApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown
  ) {
    super(message)
    this.name = 'FootballApiError'
  }
}

/**
 * Fetch matches from football-data.org API with retry logic
 * 
 * @param season - The season year (e.g., "2026")
 * @param retryCount - Current retry attempt (internal use)
 * @returns Promise with match data response
 * @throws FootballApiError for HTTP errors (401, 429, 500, etc.)
 */
export async function fetchMatches(
  season: string = '2026',
  retryCount: number = 0
): Promise<FootballDataMatchResponse> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY

  if (!apiKey) {
    throw new FootballApiError(
      'FOOTBALL_DATA_API_KEY environment variable is not set',
      500
    )
  }

  const url = `${FOOTBALL_API_BASE}/competitions/WC/matches?season=${season}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey,
      },
      signal: controller.signal,
      // Add timeout and caching options
      next: {
        revalidate: 0, // Don't cache - we handle caching in sync logic
      },
    })
    
    clearTimeout(timeoutId)

    // Handle HTTP errors
    if (!response.ok) {
      const errorBody = await response.text()
      
      // 401 Unauthorized - Invalid API key
      if (response.status === 401) {
        throw new FootballApiError(
          'Unauthorized: Invalid API key. Please check FOOTBALL_DATA_API_KEY environment variable.',
          401,
          errorBody
        )
      }

      // 429 Too Many Requests - Rate limit exceeded
      if (response.status === 429) {
        const retryAfter = response.headers.get('X-RateLimit-Reset')
        throw new FootballApiError(
          `Rate limit exceeded. ${retryAfter ? `Retry after: ${retryAfter}` : 'Please try again later.'}`,
          429,
          errorBody
        )
      }

      // 500 Internal Server Error - External API issue
      if (response.status >= 500) {
        throw new FootballApiError(
          'External API server error. Please try again later.',
          response.status,
          errorBody
        )
      }

      // Other HTTP errors
      throw new FootballApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorBody
      )
    }

    // Parse JSON response
    const data: FootballDataMatchResponse = await response.json()

    // Validate response structure
    if (!data.matches || !Array.isArray(data.matches)) {
      throw new FootballApiError(
        'Invalid API response: missing or invalid matches array',
        500,
        data
      )
    }

    return data

  } catch (error) {
    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FootballApiError(
        'Request timeout: The external API took too long to respond.',
        408,
        'Timeout after 10 seconds'
      )
    }
    
    // Handle network errors (connection closed, DNS failures, etc.)
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      console.error('Network error when fetching matches:', error)
      throw new FootballApiError(
        'Network error: Unable to connect to the external API. Please check your internet connection.',
        0,
        error.message
      )
    }
    
    // If it's already a FootballApiError, check if we should retry
    if (error instanceof FootballApiError) {
      // Don't retry on authentication errors (401) or rate limit errors (429)
      if (error.statusCode === 401 || error.statusCode === 429) {
        throw error
      }

      // Retry once for server errors (500+) after 2 seconds
      if (error.statusCode && error.statusCode >= 500 && retryCount === 0) {
        console.warn(`External API error (${error.statusCode}), retrying in 2 seconds...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        return fetchMatches(season, retryCount + 1)
      }

      throw error
    }

    // Network errors, JSON parse errors, etc. - retry once after 2 seconds
    if (error instanceof Error && retryCount === 0) {
      console.warn(`Network error: ${error.message}, retrying in 2 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return fetchMatches(season, retryCount + 1)
    }

    // Network errors, JSON parse errors, etc. (after retry)
    if (error instanceof Error) {
      throw new FootballApiError(
        `Failed to fetch matches: ${error.message}`,
        undefined,
        error
      )
    }

    // Unknown error
    throw new FootballApiError('An unknown error occurred while fetching matches')
  }
}

/**
 * Get API rate limit status
 * Makes a lightweight API call to check rate limit headers
 */
export async function checkRateLimit(): Promise<{
  remaining: number
  limit: number
  resetTime: string | null
}> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY

  if (!apiKey) {
    throw new FootballApiError('FOOTBALL_DATA_API_KEY environment variable is not set')
  }

  try {
    const response = await fetch(`${FOOTBALL_API_BASE}/competitions/WC`, {
      method: 'HEAD',
      headers: {
        'X-Auth-Token': apiKey,
      },
    })

    return {
      remaining: parseInt(response.headers.get('X-Requests-Available-Minute') || '0'),
      limit: parseInt(response.headers.get('X-RequestCounter-Reset') || '60'),
      resetTime: response.headers.get('X-RateLimit-Reset'),
    }
  } catch (error) {
    console.error('Failed to check rate limit:', error)
    throw error
  }
}
