# Database Migrations

This folder contains SQL migration files for the South Soccers World Cup 2026 Prediction Platform database schema.

## Running Migrations

### Option 1: Supabase SQL Editor (Recommended for this project)

1. Open the Supabase SQL Editor: https://supabase.com/dashboard/project/wdnjbeeuvttjafdcwdgu/sql
2. Copy the contents of the migration file (e.g., `001_create_profiles_table.sql`)
3. Paste into the SQL Editor
4. Click "Run" to execute the migration
5. Verify success by checking the "Tables" section in the dashboard

### Option 2: Supabase CLI (For local development)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wdnjbeeuvttjafdcwdgu

# Run migration
supabase db push
```

## Migration Files

### 001_create_profiles_table.sql

**Status**: ⏳ Pending execution

**Description**: Creates the `profiles` table with:
- Primary key referencing `auth.users(id)` (one-to-one relationship)
- Columns: `id`, `username`, `avatar_url`, `total_points`, `correct_predictions`, `role`, `email_notifications_enabled`, timestamps
- RLS policies: "Users can view all profiles" (SELECT), "Users can update own profile" (UPDATE)
- Indexes: `idx_profiles_username`, `idx_profiles_total_points` (DESC)
- Trigger function: `handle_new_user()` that auto-creates profile on user registration

**Requirements covered**:
- 1.2 (Profile creation on registration)
- 17 (Database Row Level Security)
- 27 (Profile management)

**Verification**:
After running the migration, verify:
```sql
-- Check table exists
SELECT * FROM public.profiles LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'profiles';

-- Check trigger
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';
```

## Migration Naming Convention

Format: `NNN_descriptive_name.sql`
- `NNN`: Sequential number (e.g., 001, 002, 003)
- `descriptive_name`: Brief description of the migration purpose
- Always use snake_case for file names

## Rollback

If you need to undo a migration:

```sql
-- Rollback 001_create_profiles_table.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;
```

**⚠️ Warning**: Rollback will delete all data in the table. Use with caution.

### 002_create_matches_table.sql

**Status**: ⏳ Pending execution

**Description**: Creates the `matches` table with:
- Primary key UUID with default generator
- Unique `external_id` for football-data.org API synchronization
- Team names and logos (home/away)
- Score fields (home_score, away_score) - NULL until match finishes
- Status field with CHECK constraint: `status IN ('upcoming', 'live', 'finished')`
- Kickoff time, competition round, group name, venue
- `winner_announced` flag for tracking if match has been scored
- `api_last_polled_at` timestamp for traffic-driven sync throttling
- RLS policies: "Anyone can view matches" (SELECT authenticated), service role only for INSERT/UPDATE
- Indexes: `idx_matches_external_id`, `idx_matches_status`, `idx_matches_kickoff_time`, `idx_matches_competition_round`

**Requirements covered**:
- 2 (Match Data Synchronization)
- 3 (Match Status Mapping)
- 17 (Database Row Level Security)
- 28 (Performance Optimization)

**Verification**:
After running the migration, verify:
```sql
-- Check table exists with correct structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'matches'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'matches';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'matches';

-- Verify CHECK constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.matches'::regclass 
AND contype = 'c';
```

### 003_create_predictions_table.sql

**Status**: ⏳ Pending execution

**Description**: Creates the `predictions` table with:
- Primary key UUID with default generator
- Foreign keys to `profiles(id)` and `matches(id)` with CASCADE delete
- Predicted scores (predicted_home, predicted_away) with CHECK >= 0
- Points awarded field with CHECK IN (0, 1, 3)
- Scored timestamp for tracking when admin scores the prediction
- UNIQUE constraint on `(user_id, match_id)` to prevent duplicate predictions
- RLS policies: "Users can insert own predictions" (INSERT), "Users can view own predictions" (SELECT)
- NO UPDATE or DELETE policies - predictions are immutable
- Trigger function `verify_kickoff_time()` that raises exception if kickoff_time <= NOW()
- BEFORE INSERT trigger `check_kickoff_before_insert` to enforce prediction lock
- Indexes: `idx_predictions_user_id`, `idx_predictions_match_id`, `idx_predictions_user_match`

**Requirements covered**:
- 4 (Prediction Submission)
- 5 (Prediction Lock Enforcement)
- 9 (User Prediction History)
- 17 (Database Row Level Security)
- 28 (Performance Optimization)

**Verification**:
After running the migration, verify:
```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'predictions'
ORDER BY ordinal_position;

-- Check RLS policies (should have 2)
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'predictions';

-- Check indexes (should have 3 custom + 2 automatic)
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'predictions';

-- Check trigger exists
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'predictions';

-- Check trigger function
SELECT proname, pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'verify_kickoff_time';
```

**Testing the trigger**:
```sql
-- Test 1: Insert match with FUTURE kickoff (should succeed)
INSERT INTO public.matches (external_id, home_team, away_team, status, kickoff_time, competition_round)
VALUES (999999, 'Test A', 'Test B', 'upcoming', NOW() + INTERVAL '1 day', 'Group Stage')
RETURNING id;

-- Insert prediction (should SUCCEED)
INSERT INTO public.predictions (user_id, match_id, predicted_home, predicted_away)
VALUES ('YOUR_USER_ID', 'YOUR_MATCH_ID', 2, 1);

-- Test 2: Insert match with PAST kickoff (should fail)
INSERT INTO public.matches (external_id, home_team, away_team, status, kickoff_time, competition_round)
VALUES (999998, 'Test C', 'Test D', 'live', NOW() - INTERVAL '1 hour', 'Group Stage')
RETURNING id;

-- Insert prediction (should FAIL with "Predictions locked" error)
INSERT INTO public.predictions (user_id, match_id, predicted_home, predicted_away)
VALUES ('YOUR_USER_ID', 'YOUR_PAST_MATCH_ID', 3, 2);
```

## Next Migrations

- 004: Create leaderboard materialized view

## Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
