-- Verification script for 001_create_profiles_table.sql
-- Run this after executing the main migration to verify everything is set up correctly

-- ============================================================================
-- TABLE EXISTENCE CHECK
-- ============================================================================
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles')
    THEN '✅ Table public.profiles exists'
    ELSE '❌ Table public.profiles does NOT exist'
  END AS table_check;

-- ============================================================================
-- COLUMN STRUCTURE CHECK
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================================================
-- RLS POLICIES CHECK
-- ============================================================================
SELECT 
  policyname AS policy_name,
  cmd AS command,
  roles,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Expected policies:
-- 1. "Users can view all profiles" - SELECT - authenticated - true
-- 2. "Users can update own profile" - UPDATE - authenticated - (auth.uid() = id)

-- ============================================================================
-- INDEXES CHECK
-- ============================================================================
SELECT 
  indexname AS index_name,
  indexdef AS index_definition
FROM pg_indexes 
WHERE tablename = 'profiles'
  AND schemaname = 'public'
ORDER BY indexname;

-- Expected indexes:
-- 1. profiles_pkey (PRIMARY KEY on id)
-- 2. profiles_username_key (UNIQUE on username)
-- 3. idx_profiles_username
-- 4. idx_profiles_total_points

-- ============================================================================
-- TRIGGER CHECK
-- ============================================================================
SELECT 
  trigger_name,
  event_manipulation AS event,
  event_object_table AS table_name,
  action_statement AS trigger_action
FROM information_schema.triggers 
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- Expected: on_auth_user_created trigger on auth.users (AFTER INSERT)

-- ============================================================================
-- FUNCTION CHECK
-- ============================================================================
SELECT 
  proname AS function_name,
  pg_get_function_result(oid) AS return_type,
  pg_get_function_arguments(oid) AS arguments
FROM pg_proc
WHERE proname = 'handle_new_user'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Expected: handle_new_user() RETURNS trigger

-- ============================================================================
-- RLS ENABLED CHECK
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- Expected: rls_enabled = true

-- ============================================================================
-- CONSTRAINT CHECK
-- ============================================================================
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'c' THEN 'CHECK'
  END AS constraint_type_label,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'profiles'
ORDER BY con.contype, con.conname;

-- Expected constraints:
-- 1. profiles_pkey - PRIMARY KEY (id)
-- 2. profiles_id_fkey - FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
-- 3. profiles_username_key - UNIQUE (username)
-- 4. profiles_role_check - CHECK (role IN ('user', 'admin'))

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT 
  '✅ Migration verification complete' AS status,
  'Review the results above to ensure all components are created correctly' AS note;
