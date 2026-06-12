-- Verification queries for 002_create_matches_table.sql
-- Run these queries after executing the migration to verify success

-- ============================================================================
-- 1. Check table structure
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'matches'
ORDER BY ordinal_position;

-- Expected output:
-- id               | uuid                     | NO  | gen_random_uuid()
-- external_id      | integer                  | NO  | NULL
-- home_team        | text                     | NO  | NULL
-- away_team        | text                     | NO  | NULL
-- home_team_logo   | text                     | YES | NULL
-- away_team_logo   | text                     | YES | NULL
-- home_score       | integer                  | YES | NULL
-- away_score       | integer                  | YES | NULL
-- status           | text                     | NO  | NULL
-- kickoff_time     | timestamp with time zone | NO  | NULL
-- competition_round| text                     | NO  | NULL
-- group_name       | text                     | YES | NULL
-- venue            | text                     | YES | NULL
-- winner_announced | boolean                  | NO  | false
-- api_last_polled_at| timestamp with time zone| YES | NULL
-- created_at       | timestamp with time zone | NO  | now()
-- updated_at       | timestamp with time zone | NO  | now()

-- ============================================================================
-- 2. Check RLS is enabled
-- ============================================================================
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'matches';

-- Expected output: rowsecurity = true

-- ============================================================================
-- 3. Check RLS policies
-- ============================================================================
SELECT 
  policyname,
  roles,
  cmd,
  qual IS NOT NULL AS has_using_clause,
  with_check IS NOT NULL AS has_with_check
FROM pg_policies 
WHERE tablename = 'matches'
ORDER BY policyname;

-- Expected output (3 policies):
-- Anyone can view matches                | {authenticated} | SELECT | true  | false
-- Only service role can insert matches   | {service_role}  | INSERT | false | true
-- Only service role can update matches   | {service_role}  | UPDATE | true  | false

-- ============================================================================
-- 4. Check indexes
-- ============================================================================
SELECT 
  indexname,
  indexdef 
FROM pg_indexes 
WHERE tablename = 'matches'
ORDER BY indexname;

-- Expected output (5 indexes including primary key):
-- matches_pkey                        | CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id)
-- matches_external_id_key             | CREATE UNIQUE INDEX matches_external_id_key ON public.matches USING btree (external_id)
-- idx_matches_external_id             | CREATE INDEX idx_matches_external_id ON public.matches USING btree (external_id)
-- idx_matches_status                  | CREATE INDEX idx_matches_status ON public.matches USING btree (status)
-- idx_matches_kickoff_time            | CREATE INDEX idx_matches_kickoff_time ON public.matches USING btree (kickoff_time)
-- idx_matches_competition_round       | CREATE INDEX idx_matches_competition_round ON public.matches USING btree (competition_round)

-- ============================================================================
-- 5. Check CHECK constraint on status field
-- ============================================================================
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.matches'::regclass 
AND contype = 'c';

-- Expected output:
-- matches_status_check | CHECK ((status = ANY (ARRAY['upcoming'::text, 'live'::text, 'finished'::text])))

-- ============================================================================
-- 6. Test inserting valid data (will fail for non-service-role users - expected)
-- ============================================================================
-- This should fail with RLS error if running as authenticated user
-- INSERT INTO public.matches (
--   external_id,
--   home_team,
--   away_team,
--   status,
--   kickoff_time,
--   competition_round
-- ) VALUES (
--   12345,
--   'Brazil',
--   'Argentina',
--   'upcoming',
--   '2026-06-15 20:00:00+00',
--   'Group Stage'
-- );

-- ============================================================================
-- 7. Test CHECK constraint validation (commented out - for manual testing)
-- ============================================================================
-- This should fail with CHECK constraint violation
-- INSERT INTO public.matches (
--   external_id,
--   home_team,
--   away_team,
--   status,
--   kickoff_time,
--   competition_round
-- ) VALUES (
--   12346,
--   'Brazil',
--   'Argentina',
--   'invalid_status',  -- Should fail CHECK constraint
--   '2026-06-15 20:00:00+00',
--   'Group Stage'
-- );

-- ============================================================================
-- 8. Check table comments (documentation)
-- ============================================================================
SELECT 
  obj_description('public.matches'::regclass) AS table_comment;

-- Expected output: "World Cup 2026 match data synced from football-data.org API..."

-- ============================================================================
-- VERIFICATION SUMMARY
-- ============================================================================
-- ✅ Table created with correct columns and types
-- ✅ RLS enabled on matches table
-- ✅ 3 RLS policies created (SELECT for authenticated, INSERT/UPDATE for service_role)
-- ✅ 4 indexes created (external_id, status, kickoff_time, competition_round)
-- ✅ CHECK constraint enforces valid status values
-- ✅ Table and column comments added for documentation
