-- Migration: Advanced Scoring System with Audit Trail
-- Description: Implements complex scoring rules with point breakdown and audit trail
-- 
-- New Scoring Rules:
-- 1. Exact score - 5 points (base)
-- 2. Correct result only - 3 points
-- 3. Correct goal difference bonus - +1 point
-- 4. Knockout exact score bonus - +2 points
-- 5. Correct penalty shootout winner - +2 points
-- 6. Wrong result - 0 points
-- 7. Correct winner/draw only - 3 points (same as #2)
-- 8. Correct winner/draw + correct goal difference - 4 points (3+1)
-- 9. Exact score, group stage - 5 points (base)
-- 10. Exact score, knockout stage (without penalty) - 7 points (5+2)
-- 11. Exact score, knockout stage (with penalty) - 9 points (5+2+2)

-- ============================================================================
-- STEP 1: Add new columns to predictions table
-- ============================================================================

-- Add penalty prediction columns
ALTER TABLE public.predictions
ADD COLUMN IF NOT EXISTS predicted_penalty_winner TEXT CHECK (predicted_penalty_winner IN ('home', 'away', NULL)),
ADD COLUMN IF NOT EXISTS points_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- Add comments
COMMENT ON COLUMN public.predictions.predicted_penalty_winner IS 'Predicted penalty shootout winner for knockout matches. NULL for group stage or if no penalty expected.';
COMMENT ON COLUMN public.predictions.points_breakdown IS 'JSON object showing detailed point breakdown: {base: 5, goal_difference: 1, knockout_bonus: 2, penalty_bonus: 2, total: 10}';
COMMENT ON COLUMN public.predictions.total_points IS 'Total points earned from this prediction. Replaces points_awarded for backward compatibility.';

-- ============================================================================
-- STEP 2: Create audit trail table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prediction_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  
  -- Match details at time of scoring
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  competition_round TEXT NOT NULL,
  match_stage TEXT NOT NULL, -- 'group_stage' or 'knockout'
  
  -- Prediction details
  predicted_home INTEGER NOT NULL,
  predicted_away INTEGER NOT NULL,
  predicted_penalty_winner TEXT,
  
  -- Actual result
  actual_home INTEGER NOT NULL,
  actual_away INTEGER NOT NULL,
  actual_penalty_winner TEXT,
  
  -- Point calculation breakdown
  base_points INTEGER NOT NULL DEFAULT 0,
  goal_difference_bonus INTEGER NOT NULL DEFAULT 0,
  knockout_bonus INTEGER NOT NULL DEFAULT 0,
  penalty_bonus INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  
  -- Calculation explanation
  calculation_notes TEXT,
  
  -- Metadata
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scored_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for audit queries
CREATE INDEX idx_prediction_audit_prediction_id ON public.prediction_audit(prediction_id);
CREATE INDEX idx_prediction_audit_user_id ON public.prediction_audit(user_id);
CREATE INDEX idx_prediction_audit_match_id ON public.prediction_audit(match_id);

-- Enable RLS
ALTER TABLE public.prediction_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit records
CREATE POLICY "Users can view own audit records"
  ON public.prediction_audit FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all audit records
CREATE POLICY "Admins can view all audit records"
  ON public.prediction_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE public.prediction_audit IS 'Audit trail for prediction scoring. Provides transparency and accountability for point calculations.';
COMMENT ON COLUMN public.prediction_audit.match_stage IS 'Stage of tournament: group_stage or knockout. Determines bonus eligibility.';
COMMENT ON COLUMN public.prediction_audit.base_points IS 'Base points: 5 for exact score, 3 for correct result, 0 for wrong.';
COMMENT ON COLUMN public.prediction_audit.goal_difference_bonus IS '+1 if predicted goal difference matches actual (even if score is wrong).';
COMMENT ON COLUMN public.prediction_audit.knockout_bonus IS '+2 for exact score in knockout stages (R32, R16, QF, SF, Final).';
COMMENT ON COLUMN public.prediction_audit.penalty_bonus IS '+2 for correctly predicting penalty shootout winner in knockout matches.';
COMMENT ON COLUMN public.prediction_audit.calculation_notes IS 'Human-readable explanation of how points were calculated.';

-- ============================================================================
-- STEP 3: Create scoring function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_advanced_points(
  p_predicted_home INTEGER,
  p_predicted_away INTEGER,
  p_predicted_penalty_winner TEXT,
  p_actual_home INTEGER,
  p_actual_away INTEGER,
  p_actual_penalty_winner TEXT,
  p_competition_round TEXT
) RETURNS JSONB AS $$
DECLARE
  v_base_points INTEGER := 0;
  v_goal_diff_bonus INTEGER := 0;
  v_knockout_bonus INTEGER := 0;
  v_penalty_bonus INTEGER := 0;
  v_total_points INTEGER := 0;
  v_notes TEXT := '';
  v_is_knockout BOOLEAN := FALSE;
  v_predicted_diff INTEGER;
  v_actual_diff INTEGER;
  v_predicted_result TEXT;
  v_actual_result TEXT;
BEGIN
  -- Determine if knockout stage
  v_is_knockout := p_competition_round IN (
    'ROUND_OF_32', 'LAST_32', 'ROUND_OF_16', 'LAST_16',
    'QUARTER_FINALS', 'QUARTER_FINAL', 'SEMI_FINALS', 'SEMI_FINAL',
    'THIRD_PLACE', 'FINAL', 'FINALS'
  );
  
  -- Calculate goal differences
  v_predicted_diff := ABS(p_predicted_home - p_predicted_away);
  v_actual_diff := ABS(p_actual_home - p_actual_away);
  
  -- Determine results
  IF p_predicted_home > p_predicted_away THEN
    v_predicted_result := 'home';
  ELSIF p_predicted_home < p_predicted_away THEN
    v_predicted_result := 'away';
  ELSE
    v_predicted_result := 'draw';
  END IF;
  
  IF p_actual_home > p_actual_away THEN
    v_actual_result := 'home';
  ELSIF p_actual_home < p_actual_away THEN
    v_actual_result := 'away';
  ELSE
    v_actual_result := 'draw';
  END IF;
  
  -- RULE 1: Check for exact score (5 base points)
  IF p_predicted_home = p_actual_home AND p_predicted_away = p_actual_away THEN
    v_base_points := 5;
    v_notes := 'Exact score predicted! ';
    
    -- RULE 4: Knockout bonus for exact score (+2 points)
    IF v_is_knockout THEN
      v_knockout_bonus := 2;
      v_notes := v_notes || 'Knockout stage bonus! ';
    END IF;
    
  -- RULE 2: Check for correct result (3 points)
  ELSIF v_predicted_result = v_actual_result THEN
    v_base_points := 3;
    v_notes := 'Correct winner/result! ';
    
    -- RULE 3: Goal difference bonus (+1 point) - Excluding draws since margin is always 0
    IF v_predicted_diff = v_actual_diff AND v_actual_result != 'draw' THEN
      v_goal_diff_bonus := 1;
      v_notes := v_notes || 'Correct goal difference! ';
    END IF;
  ELSE
    -- RULE 6: Wrong result (0 points)
    v_base_points := 0;
    v_notes := 'Incorrect result. ';
  END IF;
  
  -- RULE 5: Penalty shootout bonus (+2 points)
  IF v_is_knockout AND p_actual_penalty_winner IS NOT NULL 
     AND p_predicted_penalty_winner = p_actual_penalty_winner THEN
    v_penalty_bonus := 2;
    v_notes := v_notes || 'Correct penalty winner! ';
  END IF;
  
  -- Calculate total
  v_total_points := v_base_points + v_goal_diff_bonus + v_knockout_bonus + v_penalty_bonus;
  
  -- Return breakdown
  RETURN jsonb_build_object(
    'base_points', v_base_points,
    'goal_difference_bonus', v_goal_diff_bonus,
    'knockout_bonus', v_knockout_bonus,
    'penalty_bonus', v_penalty_bonus,
    'total_points', v_total_points,
    'notes', v_notes,
    'is_knockout', v_is_knockout
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.calculate_advanced_points IS 'Calculates points using advanced scoring rules with bonuses for knockouts and penalties. Returns JSON breakdown.';

-- ============================================================================
-- STEP 4: Create function to score a single prediction
-- ============================================================================

CREATE OR REPLACE FUNCTION public.score_prediction_with_audit(
  p_prediction_id UUID,
  p_match_id UUID,
  p_actual_home INTEGER,
  p_actual_away INTEGER,
  p_actual_penalty_winner TEXT,
  p_scored_by UUID
) RETURNS JSONB AS $$
DECLARE
  v_prediction RECORD;
  v_match RECORD;
  v_points_calc JSONB;
  v_audit_id UUID;
  v_match_stage TEXT;
BEGIN
  -- Get prediction details
  SELECT * INTO v_prediction
  FROM public.predictions
  WHERE id = p_prediction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prediction not found';
  END IF;
  
  -- Get match details
  SELECT * INTO v_match
  FROM public.matches
  WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;
  
  -- Determine match stage
  v_match_stage := CASE 
    WHEN v_match.competition_round IN ('GROUP_STAGE', 'FIRST_STAGE') THEN 'group_stage'
    ELSE 'knockout'
  END;
  
  -- Calculate points
  v_points_calc := public.calculate_advanced_points(
    v_prediction.predicted_home,
    v_prediction.predicted_away,
    v_prediction.predicted_penalty_winner,
    p_actual_home,
    p_actual_away,
    p_actual_penalty_winner,
    v_match.competition_round
  );
  
  -- Update prediction
  UPDATE public.predictions
  SET 
    points_awarded = (v_points_calc->>'total_points')::INTEGER, -- Keep for backward compatibility
    total_points = (v_points_calc->>'total_points')::INTEGER,
    points_breakdown = v_points_calc,
    scored_at = NOW()
  WHERE id = p_prediction_id;
  
  -- DELETE existing audit records for this prediction to prevent duplicates
  DELETE FROM public.prediction_audit WHERE prediction_id = p_prediction_id;
  
  -- Create audit record
  INSERT INTO public.prediction_audit (
    prediction_id,
    user_id,
    match_id,
    home_team,
    away_team,
    competition_round,
    match_stage,
    predicted_home,
    predicted_away,
    predicted_penalty_winner,
    actual_home,
    actual_away,
    actual_penalty_winner,
    base_points,
    goal_difference_bonus,
    knockout_bonus,
    penalty_bonus,
    total_points,
    calculation_notes,
    scored_by
  ) VALUES (
    p_prediction_id,
    v_prediction.user_id,
    p_match_id,
    v_match.home_team,
    v_match.away_team,
    v_match.competition_round,
    v_match_stage,
    v_prediction.predicted_home,
    v_prediction.predicted_away,
    v_prediction.predicted_penalty_winner,
    p_actual_home,
    p_actual_away,
    p_actual_penalty_winner,
    (v_points_calc->>'base_points')::INTEGER,
    (v_points_calc->>'goal_difference_bonus')::INTEGER,
    (v_points_calc->>'knockout_bonus')::INTEGER,
    (v_points_calc->>'penalty_bonus')::INTEGER,
    (v_points_calc->>'total_points')::INTEGER,
    v_points_calc->>'notes',
    p_scored_by
  ) RETURNING id INTO v_audit_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'prediction_id', p_prediction_id,
    'audit_id', v_audit_id,
    'points_breakdown', v_points_calc
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.score_prediction_with_audit IS 'Scores a prediction using advanced rules and creates an audit trail record.';

-- ============================================================================
-- STEP 5: Update leaderboard to use total_points
-- ============================================================================

-- Drop existing view
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;

-- Recreate with total_points
CREATE MATERIALIZED VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.avatar_url,
  p.full_name,
  COALESCE(SUM(pred.total_points), 0) AS total_points,
  COUNT(pred.id) FILTER (WHERE pred.total_points >= 5) AS correct_predictions,
  COUNT(pred.id) FILTER (WHERE pred.scored_at IS NOT NULL) AS scored_count,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pred.total_points), 0) DESC, p.username ASC) AS rank
FROM public.profiles p
LEFT JOIN public.predictions pred ON p.id = pred.user_id
WHERE p.role = 'user'
GROUP BY p.id, p.username, p.avatar_url, p.full_name;

-- Create index
CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);

COMMENT ON MATERIALIZED VIEW public.leaderboard IS 'Leaderboard rankings using advanced scoring system with total_points.';

-- Grant permissions
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.prediction_audit TO authenticated;

