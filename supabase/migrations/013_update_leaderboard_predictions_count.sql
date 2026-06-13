-- Migration: Update leaderboard materialized view to include total_predictions
-- Description: Changes scored_count to total_predictions to count all predictions, scored or not

-- Drop existing materialized view
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;

-- Recreate materialized view with total_predictions instead of scored_count
CREATE MATERIALIZED VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.full_name,
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
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.total_points, p.correct_predictions
ORDER BY rank;

-- Recreate indexes
CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);

-- Refresh the view
REFRESH MATERIALIZED VIEW public.leaderboard;

-- Update comments
COMMENT ON COLUMN public.leaderboard.scored_count IS 'Total number of predictions made by the user, regardless of scored status.';
