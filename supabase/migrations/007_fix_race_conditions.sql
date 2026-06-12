-- Migration: Fix Race Conditions in Triggers
-- Date: 2026-06-12
-- Description: Updates trigger functions to prevent race conditions in
--              profile creation and prediction submission

-- ============================================================================
-- FIX 1: Profile Creation with Conflict Handling
-- ============================================================================
-- Prevents race conditions when multiple users register with same username
-- Adds retry logic and guaranteed unique fallback

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_attempt INTEGER := 0;
  v_max_attempts INTEGER := 10;
BEGIN
  -- Extract username from metadata or generate default
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    'user_' || substring(NEW.id::text, 1, 8)
  );
  
  -- Handle username conflicts with retry logic
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id, 
        username, 
        avatar_url,
        full_name,
        phone_number
      )
      VALUES (
        NEW.id,
        v_username,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone_number'
      );
      
      -- Success - exit loop
      EXIT;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- Username conflict - append attempt number and retry
        v_attempt := v_attempt + 1;
        
        IF v_attempt >= v_max_attempts THEN
          -- Max retries exceeded - use UUID-based username
          v_username := 'user_' || replace(NEW.id::text, '-', '');
          
          -- Final attempt with guaranteed unique username
          INSERT INTO public.profiles (
            id, 
            username, 
            avatar_url,
            full_name,
            phone_number
          )
          VALUES (
            NEW.id,
            v_username,
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'phone_number'
          )
          ON CONFLICT (id) DO NOTHING; -- Prevent duplicate profile
          
          EXIT;
        END IF;
        
        -- Append attempt number to username
        v_username := COALESCE(
          NEW.raw_user_meta_data->>'username', 
          'user_' || substring(NEW.id::text, 1, 8)
        ) || '_' || v_attempt::text;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile on user signup with conflict handling for username uniqueness. Retries up to 10 times with numbered suffixes, then falls back to UUID-based username.';

-- ============================================================================
-- FIX 2: Prediction Kickoff Validation with Row-Level Locking
-- ============================================================================
-- Prevents race conditions in concurrent prediction submissions
-- Adds FOR SHARE lock and match status check

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

COMMENT ON FUNCTION public.verify_kickoff_time() IS 'Validates prediction timing before insert. Uses FOR SHARE lock to prevent race conditions. Checks both kickoff time and match status.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify functions are created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user'
  ) THEN
    RAISE EXCEPTION 'Function handle_new_user not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'verify_kickoff_time'
  ) THEN
    RAISE EXCEPTION 'Function verify_kickoff_time not created';
  END IF;
  
  RAISE NOTICE 'Race condition fixes applied successfully';
END $$;
