-- Fix prediction trigger "Match not found" issue
-- The trigger needs to check matches in the same transaction context

-- Drop all triggers that use this function
DROP TRIGGER IF EXISTS verify_kickoff_before_prediction ON public.predictions;
DROP TRIGGER IF EXISTS check_kickoff_before_insert ON public.predictions;

-- Drop the function with CASCADE to remove dependencies
DROP FUNCTION IF EXISTS public.verify_kickoff_time() CASCADE;

CREATE OR REPLACE FUNCTION public.verify_kickoff_time()
RETURNS TRIGGER AS $$
DECLARE
  match_record RECORD;
  match_count INTEGER;
BEGIN
  -- Debug: Check if match exists at all
  SELECT COUNT(*) INTO match_count
  FROM public.matches
  WHERE id = NEW.match_id;
  
  RAISE NOTICE 'Checking match ID: %, Found: %', NEW.match_id, match_count;
  
  -- Fetch the match details with explicit schema
  SELECT id, kickoff_time, status 
  INTO match_record
  FROM public.matches
  WHERE id = NEW.match_id
  LIMIT 1;
  
  -- Check if match was found
  IF NOT FOUND OR match_record.id IS NULL THEN
    -- More detailed error for debugging
    RAISE EXCEPTION 'Match ID % not found in database. Total matches checked: %. Please refresh the page.', 
      NEW.match_id, match_count;
  END IF;
  
  -- Prevent predictions for live or finished matches
  IF match_record.status IN ('live', 'finished') THEN
    RAISE EXCEPTION 'Predictions locked. This match has already started or finished.';
  END IF;
  
  -- Raise exception if kickoff time has passed or equals current time
  IF match_record.kickoff_time <= NOW() THEN
    RAISE EXCEPTION 'Predictions locked. This match has already kicked off.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger with consistent naming
CREATE TRIGGER check_kickoff_before_insert
  BEFORE INSERT OR UPDATE ON public.predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.verify_kickoff_time();

COMMENT ON FUNCTION public.verify_kickoff_time() IS 'Validates match exists and kickoff time has not passed before allowing prediction submission. Prevents predictions on live or finished matches. Includes debugging for match lookup issues.';

