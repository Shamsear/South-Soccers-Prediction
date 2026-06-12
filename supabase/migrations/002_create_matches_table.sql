-- Migration: Create matches table with RLS policies
-- Task: 2.2
-- Description: Creates matches table for World Cup 2026 match data synced from football-data.org API,
--              RLS policies ensuring only service role can modify data,
--              indexes for performance optimization,
--              and CHECK constraint for valid status values

-- ============================================================================
-- TABLE: matches
-- ============================================================================
-- Stores all World Cup 2026 match data synced from football-data.org API

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id INTEGER UNIQUE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_team_logo TEXT,
  away_team_logo TEXT,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'finished')),
  kickoff_time TIMESTAMPTZ NOT NULL,
  competition_round TEXT NOT NULL,
  group_name TEXT,
  venue TEXT,
  winner_announced BOOLEAN NOT NULL DEFAULT false,
  api_last_polled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS to enforce authorization at the database level
-- Requirement: 17 (Database Row Level Security)

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view matches
-- Requirement: 17 (Database Row Level Security)
-- Allows all authenticated users to SELECT match data (public read access)
CREATE POLICY "Anyone can view matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can insert matches
-- Requirement: 2 (Match Data Synchronization), 17 (Database Row Level Security)
-- Restricts INSERT operations to service_role only (API sync operations)
CREATE POLICY "Only service role can insert matches"
  ON public.matches FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only service role can update matches
-- Requirement: 2 (Match Data Synchronization), 17 (Database Row Level Security)
-- Restricts UPDATE operations to service_role only (API sync and admin scoring)
CREATE POLICY "Only service role can update matches"
  ON public.matches FOR UPDATE
  TO service_role
  USING (true);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance optimization for common query patterns
-- Requirement: 28 (Performance Optimization)

-- Index on external_id for upsert operations and API sync lookups
CREATE INDEX idx_matches_external_id ON public.matches(external_id);

-- Index on status for filtering live/upcoming/finished matches
CREATE INDEX idx_matches_status ON public.matches(status);

-- Index on kickoff_time for chronological ordering and prediction lock checks
CREATE INDEX idx_matches_kickoff_time ON public.matches(kickoff_time);

-- Index on competition_round for grouping matches by tournament phase
CREATE INDEX idx_matches_competition_round ON public.matches(competition_round);

-- ============================================================================
-- COMMENTS
-- ============================================================================
-- Add table and column documentation for maintainability

COMMENT ON TABLE public.matches IS 'World Cup 2026 match data synced from football-data.org API. Contains all 104 tournament matches.';
COMMENT ON COLUMN public.matches.id IS 'Primary key UUID. Internally generated unique identifier.';
COMMENT ON COLUMN public.matches.external_id IS 'Unique match ID from football-data.org API. Used for upsert operations during sync.';
COMMENT ON COLUMN public.matches.home_team IS 'Home team name as provided by external API.';
COMMENT ON COLUMN public.matches.away_team IS 'Away team name as provided by external API.';
COMMENT ON COLUMN public.matches.home_team_logo IS 'URL to home team crest/logo image.';
COMMENT ON COLUMN public.matches.away_team_logo IS 'URL to away team crest/logo image.';
COMMENT ON COLUMN public.matches.home_score IS 'Final home team score. NULL until match is finished. For knockout matches, uses regular time score only.';
COMMENT ON COLUMN public.matches.away_score IS 'Final away team score. NULL until match is finished. For knockout matches, uses regular time score only.';
COMMENT ON COLUMN public.matches.status IS 'Match status: "upcoming" (scheduled), "live" (in progress), or "finished" (completed). CHECK constraint enforces valid values.';
COMMENT ON COLUMN public.matches.kickoff_time IS 'Match kickoff time in UTC. Used for prediction lock enforcement.';
COMMENT ON COLUMN public.matches.competition_round IS 'Tournament phase: "Group Stage", "Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Third Place", "Final".';
COMMENT ON COLUMN public.matches.group_name IS 'Group identifier for group stage matches (e.g., "Group A"). NULL for knockout matches.';
COMMENT ON COLUMN public.matches.venue IS 'Stadium/venue name where match is played.';
COMMENT ON COLUMN public.matches.winner_announced IS 'Boolean flag indicating whether match has been scored and prediction points awarded by admin.';
COMMENT ON COLUMN public.matches.api_last_polled_at IS 'Timestamp of last successful API fetch for this match. Used for traffic-driven sync throttling (5-minute interval).';
COMMENT ON COLUMN public.matches.created_at IS 'Record creation timestamp.';
COMMENT ON COLUMN public.matches.updated_at IS 'Record last update timestamp.';

