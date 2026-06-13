import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'

loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for DDL

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateView() {
  console.log('Updating leaderboard view...')
  
  const sql = `
    DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;

    CREATE MATERIALIZED VIEW public.leaderboard AS
    SELECT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.total_points,
      p.correct_predictions,
      COUNT(pred.id) FILTER (WHERE pred.scored_at IS NOT NULL) AS scored_count,
      COUNT(pred.id) AS total_predictions,
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

    CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);
    CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);

    REFRESH MATERIALIZED VIEW public.leaderboard;
  `
  
  // Actually, Supabase JS client doesn't allow raw SQL execution by default.
  // We need to use postgres connection or a generic RPC if we don't have direct access.
  // But wait, can we execute SQL via REST API? No, only via an RPC function if it exists.
  // Is there an RPC function to execute sql? Let's check.
  
}

updateView()
