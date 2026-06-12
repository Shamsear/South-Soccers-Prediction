-- Migration: Create leaderboard materialized view with refresh function
-- Task: 2.4
-- Description: Creates materialized view for optimized leaderboard queries with pre-computed rankings,
--              indexes for performance, and refresh function for updating the view after scoring operations.
--              The CONCURRENTLY option allows reads during refresh, ensuring leaderboard remains accessible.

-- ============================================================================
-- MATERIALIZED VIEW: leaderboard
-- ============================================================================
-- Optimized view for leaderboard queries to avoid expensive joins on every page load
-- Requirement: 8 (Leaderboard Display), 28 (Performance Optimization)

CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.avatar_url,
  p.total_points,
  p.correct_predictions,
  COUNT(pred.id) AS scored_count,
  RANK() OVER (
    ORDER BY p.total_points DESC, 
             p.correct_predictions DESC, 
             p.username ASC
  ) AS rank
FROM public.profiles p
LEFT JOIN public.predictions pred 
  ON p.id = pred.user_id 
  AND pred.scored_at IS NOT NULL
GROUP BY p.id, p.username, p.avatar_url, p.total_points, p.correct_predictions
ORDER BY rank;

-- ============================================================================
-- INDEXES ON MATERIALIZED VIEW
-- ============================================================================
-- Performance optimization for leaderboard queries
-- Requirement: 28 (Performance Optimization)

-- Unique index on id (required for CONCURRENTLY refresh)
-- Requirement: 8.3 (Leaderboard data structure)
CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);

-- Index on rank for efficient leaderboard pagination and lookups
-- Requirement: 8.4 (Leaderboard pagination)
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);

-- ============================================================================
-- FUNCTION: refresh_leaderboard()
-- ============================================================================
-- Refreshes the leaderboard materialized view after scoring operations
-- CONCURRENTLY option allows reads during refresh (requires UNIQUE index)
-- Requirement: 6.12 (Leaderboard refresh after scoring), 28 (Performance Optimization)

CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY allows SELECT queries during refresh
  -- Requires UNIQUE index on materialized view (idx_leaderboard_id)
  -- Called by admin scoring operation after points are awarded
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================
-- Add documentation for maintainability

COMMENT ON MATERIALIZED VIEW public.leaderboard IS 'Pre-computed leaderboard rankings for performance optimization. Refreshed after match scoring operations via refresh_leaderboard() function. Uses RANK() to handle ties in total_points.';

COMMENT ON COLUMN public.leaderboard.id IS 'User ID from profiles table. Primary key for CONCURRENTLY refresh.';
COMMENT ON COLUMN public.leaderboard.username IS 'User display name from profiles table.';
COMMENT ON COLUMN public.leaderboard.avatar_url IS 'User avatar URL from profiles table. NULL if not set.';
COMMENT ON COLUMN public.leaderboard.total_points IS 'Total prediction points earned by user. Aggregated from predictions.points_awarded.';
COMMENT ON COLUMN public.leaderboard.correct_predictions IS 'Count of exact scoreline predictions (3-point predictions). Denormalized from profiles for performance.';
COMMENT ON COLUMN public.leaderboard.scored_count IS 'Count of predictions that have been scored (predictions with scored_at IS NOT NULL). Indicates prediction participation.';
COMMENT ON COLUMN public.leaderboard.rank IS 'User rank based on total_points DESC, correct_predictions DESC, username ASC. Computed using RANK() window function to handle ties.';

COMMENT ON FUNCTION public.refresh_leaderboard() IS 'Refreshes the leaderboard materialized view using CONCURRENTLY option. Called by admin after scoring operations. Allows SELECT queries during refresh for zero-downtime updates.';

-- ============================================================================
-- INITIAL DATA POPULATION
-- ============================================================================
-- Populate the materialized view on first creation
-- Subsequent updates will be via refresh_leaderboard() function

REFRESH MATERIALIZED VIEW public.leaderboard;
