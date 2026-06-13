-- Migration: Allow public read access to predictions and profiles
-- Description: Adds RLS policies to allow all authenticated and anonymous users
--              to view all predictions (with user profiles joined)
--              This enables showing all predictions on match detail pages

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Predictions Table
-- ============================================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own predictions" ON public.predictions;

-- Policy: Users can view own predictions (keep for backwards compatibility)
CREATE POLICY "Users can view own predictions"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anyone can view all predictions (for public display)
-- This allows showing all predictions on match detail pages
-- Profiles data is handled by its own RLS policies
CREATE POLICY "Anyone can view all predictions"
  ON public.predictions FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Profiles Table
-- ============================================================================

-- Drop the old authenticated-only policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Policy: Anyone can view all profiles (for public display)
-- This allows showing usernames and avatars on public pages
-- Personal data like email is handled by auth.users which remains protected
CREATE POLICY "Anyone can view all profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Anyone can view all predictions" ON public.predictions IS 
'Allows public read access to all predictions for displaying on match detail pages and leaderboards. Profile data access is controlled by profiles table RLS policies.';

COMMENT ON POLICY "Anyone can view all profiles" ON public.profiles IS 
'Allows public read access to profile information (username, avatar, points) for displaying on public pages. Email and sensitive auth data remains protected in auth.users table.';

