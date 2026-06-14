-- Migration: Fix predictions INSERT RLS policy
-- Description: Ensures authenticated users can insert their own predictions
--              by explicitly checking the auth context

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Fix INSERT Policy
-- ============================================================================

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;

-- Recreate with more explicit authentication check
-- This policy ensures:
-- 1. User is authenticated (auth.uid() is not null)
-- 2. The user_id in the row matches the authenticated user's ID
CREATE POLICY "Users can insert own predictions"
  ON public.predictions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- Also ensure UPDATE policy exists for upsert operations
-- (even though we don't want manual updates, upsert might need this)
DROP POLICY IF EXISTS "Users can update own predictions" ON public.predictions;

CREATE POLICY "Users can update own predictions"
  ON public.predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can insert own predictions" ON public.predictions IS 
'Allows authenticated users to insert predictions only for their own user_id. Explicitly checks auth.uid() is not null and matches user_id.';

COMMENT ON POLICY "Users can update own predictions" ON public.predictions IS 
'Allows authenticated users to update their own predictions via upsert operations. Both the existing row and the new data must belong to the authenticated user.';
