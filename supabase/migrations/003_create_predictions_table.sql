-- Migration: Create predictions table with RLS policies and kickoff validation trigger
-- Task: 2.3
-- Description: Creates predictions table for user score predictions,
--              RLS policies ensuring users can only insert/view own predictions,
--              BEFORE INSERT trigger to enforce kickoff time lock,
--              indexes for performance optimization,
--              and UNIQUE constraint to prevent duplicate predictions

-- ============================================================================
-- TABLE: predictions
-- ============================================================================
-- Stores user predictions with unique constraint on (user_id, match_id)

CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home INTEGER NOT NULL CHECK (predicted_home >= 0),
  predicted_away INTEGER NOT NULL CHECK (predicted_away >= 0),
  points_awarded INTEGER CHECK (points_awarded IN (0, 1, 3)),
  scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS to enforce authorization at the database level
-- Requirement: 17 (Database Row Level Security)

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert own predictions
-- Requirement: 4 (Prediction Submission), 17 (Database Row Level Security)
-- Allows authenticated users to INSERT only predictions with their own user_id
CREATE POLICY "Users can insert own predictions"
  ON public.predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view own predictions
-- Requirement: 9 (User Prediction History), 17 (Database Row Level Security)
-- Allows authenticated users to SELECT only their own predictions
CREATE POLICY "Users can view own predictions"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: No UPDATE or DELETE policies - predictions are immutable after creation
-- Requirement: 5 (Prediction Lock Enforcement)

-- ============================================================================
-- TRIGGER FUNCTION: Validate kickoff time before prediction insert
-- ============================================================================
-- Requirement: 5 (Prediction Lock Enforcement)
-- Automatically prevents predictions after match kickoff
-- Fixed: Added SELECT FOR SHARE lock to prevent race conditions

CREATE OR REPLACE FUNCTION public.verify_kickoff_time()
RETURNS TRIGGER AS $$
DECLARE
  match_kickoff TIMESTAMPTZ;
  match_status TEXT;
BEGIN
  -- Fetch the kickoff_time and status for the match being predicted
  -- Use FOR SHARE to prevent concurrent modifications during check
  SELECT kickoff_time, status INTO match_kickoff, match_status
  FROM public.matches
  WHERE id = NEW.match_id
  FOR SHARE;
  
  -- Check if match was not found
  IF match_kickoff IS NULL THEN
    RAISE EXCEPTION 'Match not found.';
  END IF;
  
  -- Prevent predictions for live or finished matches
  IF match_status IN ('live', 'finished') THEN
    RAISE EXCEPTION 'Predictions locked. This match has already started or finished.';
  END IF;
  
  -- Raise exception if kickoff time has passed or equals current time
  IF match_kickoff <= NOW() THEN
    RAISE EXCEPTION 'Predictions locked. This match has already kicked off.';
  END IF;
  
  -- Allow insert if kickoff time is in the future
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Check kickoff before insert
-- Requirement: 5 (Prediction Lock Enforcement)
-- Executes BEFORE INSERT to validate prediction timing
CREATE TRIGGER check_kickoff_before_insert
  BEFORE INSERT ON public.predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.verify_kickoff_time();

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance optimization for common query patterns
-- Requirement: 28 (Performance Optimization)

-- Index on user_id for user prediction history queries
CREATE INDEX idx_predictions_user_id ON public.predictions(user_id);

-- Index on match_id for match-specific prediction lookups
CREATE INDEX idx_predictions_match_id ON public.predictions(match_id);

-- Composite index on (user_id, match_id) for unique constraint enforcement and lookups
CREATE INDEX idx_predictions_user_match ON public.predictions(user_id, match_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================
-- Add table and column documentation for maintainability

COMMENT ON TABLE public.predictions IS 'User predictions for match scores. Enforces prediction lock at kickoff time via trigger. Predictions are immutable (no UPDATE/DELETE allowed).';
COMMENT ON COLUMN public.predictions.id IS 'Primary key UUID. Internally generated unique identifier.';
COMMENT ON COLUMN public.predictions.user_id IS 'Foreign key to profiles.id. References the user who made the prediction.';
COMMENT ON COLUMN public.predictions.match_id IS 'Foreign key to matches.id. References the match being predicted.';
COMMENT ON COLUMN public.predictions.predicted_home IS 'Predicted home team score. Must be >= 0.';
COMMENT ON COLUMN public.predictions.predicted_away IS 'Predicted away team score. Must be >= 0.';
COMMENT ON COLUMN public.predictions.points_awarded IS 'Points earned: 3 (exact scoreline), 1 (correct result), 0 (incorrect). NULL until match is scored by admin.';
COMMENT ON COLUMN public.predictions.scored_at IS 'Timestamp when prediction was scored by admin. NULL until scoring operation completes.';
COMMENT ON COLUMN public.predictions.created_at IS 'Timestamp when prediction was submitted. Used for submission tracking.';
COMMENT ON CONSTRAINT predictions_user_id_match_id_key ON public.predictions IS 'Ensures each user can only submit one prediction per match.';
