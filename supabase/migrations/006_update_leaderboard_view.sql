-- Migration: Update leaderboard materialized view to include full_name
-- Description: Refreshes the leaderboard view to include the new full_name column

-- Drop existing materialized view
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;

-- Recreate materialized view with full_name
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
  AND pred.scored_at IS NOT NULL
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.total_points, p.correct_predictions
ORDER BY rank;

-- Recreate indexes
CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);

-- Refresh the view
REFRESH MATERIALIZED VIEW public.leaderboard;

-- Update comments
COMMENT ON COLUMN public.leaderboard.full_name IS 'User full name from profiles table. NULL if not set.';
