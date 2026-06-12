/**
 * Migration: Allow Public Access to Matches
 * 
 * Updates RLS policies to allow anonymous (public) users to view matches
 * This enables the public matches and leaderboard pages to work without authentication
 */

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view matches" ON public.matches;

-- Create new policy that allows both authenticated AND anonymous users to view matches
CREATE POLICY "Public can view matches"
  ON public.matches FOR SELECT
  TO authenticated, anon
  USING (true);

-- Also update leaderboard view to be publicly accessible
-- The leaderboard view should already be accessible, but let's ensure it
GRANT SELECT ON public.leaderboard TO anon;
