-- Verification script for migration 004: leaderboard materialized view
-- Task: 2.4
-- This script verifies that the leaderboard materialized view and refresh function were created correctly

-- ============================================================================
-- VERIFICATION CHECKS
-- ============================================================================

-- Check 1: Verify materialized view exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_matviews 
      WHERE schemaname = 'public' 
      AND matviewname = 'leaderboard'
    )
    THEN '✓ PASS: Materialized view "leaderboard" exists'
    ELSE '✗ FAIL: Materialized view "leaderboard" does not exist'
  END AS check_result;

-- Check 2: Verify materialized view has correct columns
SELECT 
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leaderboard'
      AND column_name IN ('id', 'username', 'avatar_url', 'total_points', 'correct_predictions', 'scored_count', 'rank')
    ) = 7
    THEN '✓ PASS: Materialized view has all 7 required columns'
    ELSE '✗ FAIL: Materialized view is missing required columns'
  END AS check_result;

-- Check 3: Verify UNIQUE index on id exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'leaderboard'
      AND indexname = 'idx_leaderboard_id'
      AND indexdef LIKE '%UNIQUE%'
    )
    THEN '✓ PASS: UNIQUE index "idx_leaderboard_id" exists'
    ELSE '✗ FAIL: UNIQUE index "idx_leaderboard_id" does not exist'
  END AS check_result;

-- Check 4: Verify index on rank exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'leaderboard'
      AND indexname = 'idx_leaderboard_rank'
    )
    THEN '✓ PASS: Index "idx_leaderboard_rank" exists'
    ELSE '✗ FAIL: Index "idx_leaderboard_rank" does not exist'
  END AS check_result;

-- Check 5: Verify refresh_leaderboard() function exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = 'refresh_leaderboard'
      AND p.prorettype = (SELECT oid FROM pg_type WHERE typname = 'void')
    )
    THEN '✓ PASS: Function "refresh_leaderboard()" exists and returns void'
    ELSE '✗ FAIL: Function "refresh_leaderboard()" does not exist'
  END AS check_result;

-- Check 6: Verify refresh_leaderboard() function is SECURITY DEFINER
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = 'refresh_leaderboard'
      AND p.prosecdef = true
    )
    THEN '✓ PASS: Function "refresh_leaderboard()" has SECURITY DEFINER'
    ELSE '✗ FAIL: Function "refresh_leaderboard()" is missing SECURITY DEFINER'
  END AS check_result;

-- Check 7: Test refresh_leaderboard() function executes without error
DO $$
BEGIN
  PERFORM public.refresh_leaderboard();
  RAISE NOTICE '✓ PASS: refresh_leaderboard() function executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✗ FAIL: refresh_leaderboard() function raised error: %', SQLERRM;
END $$;

-- Check 8: Verify materialized view query structure (inspect view definition)
SELECT 
  CASE 
    WHEN definition LIKE '%RANK() OVER%'
    AND definition LIKE '%LEFT JOIN%predictions%'
    AND definition LIKE '%GROUP BY%'
    THEN '✓ PASS: Materialized view has correct query structure with RANK() and aggregations'
    ELSE '✗ FAIL: Materialized view query structure is incorrect'
  END AS check_result
FROM pg_matviews 
WHERE schemaname = 'public' 
AND matviewname = 'leaderboard';

-- ============================================================================
-- SAMPLE DATA QUERY
-- ============================================================================
-- Display sample leaderboard data to verify structure

SELECT 
  '=== SAMPLE LEADERBOARD DATA ===' AS section,
  NULL::uuid AS id,
  NULL::text AS username,
  NULL::text AS avatar_url,
  NULL::integer AS total_points,
  NULL::integer AS correct_predictions,
  NULL::bigint AS scored_count,
  NULL::bigint AS rank
WHERE false

UNION ALL

SELECT 
  NULL,
  id,
  username,
  avatar_url,
  total_points,
  correct_predictions,
  scored_count,
  rank
FROM public.leaderboard
LIMIT 10;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT 
  '=== VERIFICATION COMPLETE ===' AS summary,
  'Run all checks above to verify migration 004 was successful' AS instructions;
