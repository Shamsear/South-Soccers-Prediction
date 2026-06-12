-- Verification script for 003_create_predictions_table.sql
-- Run this after executing the migration to verify all components are correctly created

-- ============================================================================
-- 1. Verify table structure
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'predictions'
ORDER BY ordinal_position;

-- Expected output:
-- id (uuid, NO, gen_random_uuid())
-- user_id (uuid, NO)
-- match_id (uuid, NO)
-- predicted_home (integer, NO)
-- predicted_away (integer, NO)
-- points_awarded (integer, YES)
-- scored_at (timestamp with time zone, YES)
-- created_at (timestamp with time zone, NO, now())

-- ============================================================================
-- 2. Verify foreign key constraints
-- ============================================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'predictions'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Expected output:
-- predictions_user_id_fkey | predictions | user_id | profiles | id | CASCADE
-- predictions_match_id_fkey | predictions | match_id | matches | id | CASCADE

-- ============================================================================
-- 3. Verify CHECK constraints
-- ============================================================================
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.predictions'::regclass
  AND contype = 'c'
ORDER BY conname;

-- Expected output:
-- predictions_predicted_away_check | CHECK (predicted_away >= 0)
-- predictions_predicted_home_check | CHECK (predicted_home >= 0)
-- predictions_points_awarded_check | CHECK (points_awarded = ANY (ARRAY[0, 1, 3]))

-- ============================================================================
-- 4. Verify UNIQUE constraint
-- ============================================================================
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.predictions'::regclass
  AND contype = 'u'
ORDER BY conname;

-- Expected output:
-- predictions_user_id_match_id_key | UNIQUE (user_id, match_id)

-- ============================================================================
-- 5. Verify RLS is enabled and policies exist
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'predictions'
ORDER BY policyname;

-- Expected output:
-- public | predictions | Users can insert own predictions | PERMISSIVE | {authenticated} | INSERT | NULL | (auth.uid() = user_id)
-- public | predictions | Users can view own predictions | PERMISSIVE | {authenticated} | SELECT | (auth.uid() = user_id) | NULL

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'predictions';

-- Expected output:
-- predictions | true

-- ============================================================================
-- 6. Verify indexes
-- ============================================================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'predictions'
ORDER BY indexname;

-- Expected output:
-- idx_predictions_match_id | CREATE INDEX idx_predictions_match_id ON public.predictions USING btree (match_id)
-- idx_predictions_user_id | CREATE INDEX idx_predictions_user_id ON public.predictions USING btree (user_id)
-- idx_predictions_user_match | CREATE INDEX idx_predictions_user_match ON public.predictions USING btree (user_id, match_id)
-- predictions_pkey | CREATE UNIQUE INDEX predictions_pkey ON public.predictions USING btree (id)
-- predictions_user_id_match_id_key | CREATE UNIQUE INDEX predictions_user_id_match_id_key ON public.predictions USING btree (user_id, match_id)

-- ============================================================================
-- 7. Verify trigger function exists
-- ============================================================================
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'verify_kickoff_time';

-- Expected: Function verify_kickoff_time exists with RAISE EXCEPTION logic

-- ============================================================================
-- 8. Verify trigger is attached to table
-- ============================================================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'predictions'
ORDER BY trigger_name;

-- Expected output:
-- check_kickoff_before_insert | INSERT | predictions | BEFORE | EXECUTE FUNCTION public.verify_kickoff_time()

-- ============================================================================
-- 9. Test prediction insert (will fail if matches table is empty)
-- ============================================================================
-- This test requires:
-- 1. A test user in auth.users
-- 2. A test match in public.matches with future kickoff_time
-- 
-- To test manually:
-- INSERT INTO public.predictions (user_id, match_id, predicted_home, predicted_away)
-- VALUES (
--   'YOUR_USER_UUID',
--   'YOUR_MATCH_UUID', 
--   2,
--   1
-- );
--
-- Should succeed if kickoff_time is in the future
-- Should fail with "Predictions locked" error if kickoff_time has passed

-- ============================================================================
-- Summary
-- ============================================================================
SELECT 
  'predictions table' AS component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'predictions'
  ) THEN '✓ Created' ELSE '✗ Missing' END AS status
UNION ALL
SELECT 
  'RLS policies',
  CASE WHEN COUNT(*) = 2 THEN '✓ Created' ELSE '✗ Incomplete' END
FROM pg_policies WHERE tablename = 'predictions'
UNION ALL
SELECT 
  'Indexes',
  CASE WHEN COUNT(*) >= 3 THEN '✓ Created' ELSE '✗ Incomplete' END
FROM pg_indexes WHERE tablename = 'predictions' AND indexname LIKE 'idx_predictions%'
UNION ALL
SELECT 
  'Trigger function',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'verify_kickoff_time'
  ) THEN '✓ Created' ELSE '✗ Missing' END
UNION ALL
SELECT 
  'Trigger',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_table = 'predictions' 
    AND trigger_name = 'check_kickoff_before_insert'
  ) THEN '✓ Created' ELSE '✗ Missing' END;
