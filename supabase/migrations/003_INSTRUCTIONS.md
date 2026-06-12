# Migration 003: Create Predictions Table

## Overview

This migration creates the `predictions` table with database-level enforcement of prediction lock rules, RLS policies for user data isolation, and performance indexes.

**Task**: 2.3 - Create predictions table with RLS policies and kickoff validation trigger

**Requirements covered**:
- Requirement 4 (Prediction Submission)
- Requirement 5 (Prediction Lock Enforcement)
- Requirement 9 (User Prediction History)
- Requirement 17 (Database Row Level Security)
- Requirement 28 (Performance Optimization)

## Prerequisites

Before running this migration, ensure the following migrations have been successfully executed:

1. ✅ `001_create_profiles_table.sql` - Required for foreign key to `profiles(id)`
2. ✅ `002_create_matches_table.sql` - Required for foreign key to `matches(id)`

## Migration Components

### 1. Table Schema

Creates `predictions` table with:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to profiles)
- `match_id` (UUID, foreign key to matches)
- `predicted_home` (INTEGER, CHECK >= 0)
- `predicted_away` (INTEGER, CHECK >= 0)
- `points_awarded` (INTEGER, CHECK IN (0,1,3))
- `scored_at` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ, default NOW())
- **UNIQUE constraint** on `(user_id, match_id)` - prevents duplicate predictions

### 2. Row Level Security (RLS) Policies

Enforces authorization at the database level:

**INSERT Policy**: "Users can insert own predictions"
- Users can only INSERT predictions where `auth.uid() = user_id`
- Prevents users from creating predictions for other users

**SELECT Policy**: "Users can view own predictions"
- Users can only SELECT their own predictions
- Ensures prediction privacy

**No UPDATE or DELETE policies**:
- Predictions are immutable after creation
- Aligns with requirement 5 (Prediction Lock Enforcement)

### 3. Kickoff Validation Trigger

**Function**: `verify_kickoff_time()`
- Executes BEFORE INSERT on predictions table
- Fetches `kickoff_time` from matches table
- Raises exception if `kickoff_time <= NOW()`
- Error message: "Predictions locked. This match has already kicked off."

**Trigger**: `check_kickoff_before_insert`
- Attached to predictions table
- Automatically enforces prediction lock at database level
- Cannot be bypassed by application code

### 4. Indexes

Performance optimization for common queries:
- `idx_predictions_user_id` - User prediction history queries
- `idx_predictions_match_id` - Match-specific prediction lookups
- `idx_predictions_user_match` - Composite index for UNIQUE enforcement

## Execution Steps

### Option 1: Supabase SQL Editor (Recommended)

1. Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Open the SQL Editor
3. Copy the entire contents of `003_create_predictions_table.sql`
4. Paste into the editor
5. Click **Run** (or press `Ctrl+Enter`)
6. Wait for "Success. No rows returned" message

### Option 2: Supabase CLI

```bash
# Ensure you're in the project root
cd d:\ssprediction

# Login to Supabase (if not already logged in)
supabase login

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_ID

# Apply the migration
supabase db push
```

## Verification

After running the migration, execute the verification script:

1. Open `003_verify.sql` in the Supabase SQL Editor
2. Run the entire script
3. Review the results for each section

### Expected Verification Results

**Table Structure**: 8 columns with correct data types
**Foreign Keys**: 2 constraints (user_id → profiles, match_id → matches) with CASCADE delete
**CHECK Constraints**: 3 constraints (predicted_home >= 0, predicted_away >= 0, points_awarded IN (0,1,3))
**UNIQUE Constraint**: 1 constraint on (user_id, match_id)
**RLS Policies**: 2 policies (INSERT, SELECT)
**Indexes**: 3 custom indexes + 2 automatic (primary key, unique)
**Trigger Function**: `verify_kickoff_time()` exists
**Trigger**: `check_kickoff_before_insert` attached to predictions table

### Summary Check

Run this query for a quick status overview:

```sql
SELECT 
  'predictions table' AS component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'predictions'
  ) THEN '✓ Created' ELSE '✗ Missing' END AS status
UNION ALL
SELECT 'RLS policies', CASE WHEN COUNT(*) = 2 THEN '✓ Created' ELSE '✗ Incomplete' END
FROM pg_policies WHERE tablename = 'predictions'
UNION ALL
SELECT 'Indexes', CASE WHEN COUNT(*) >= 3 THEN '✓ Created' ELSE '✗ Incomplete' END
FROM pg_indexes WHERE tablename = 'predictions' AND indexname LIKE 'idx_predictions%'
UNION ALL
SELECT 'Trigger', CASE WHEN EXISTS (
  SELECT 1 FROM information_schema.triggers
  WHERE event_object_table = 'predictions' AND trigger_name = 'check_kickoff_before_insert'
) THEN '✓ Created' ELSE '✗ Missing' END;
```

Expected output:
```
component           | status
--------------------+-----------
predictions table   | ✓ Created
RLS policies        | ✓ Created
Indexes             | ✓ Created
Trigger             | ✓ Created
```

## Testing the Trigger

To test the kickoff validation trigger, you need test data:

### 1. Insert a test match with FUTURE kickoff time

```sql
INSERT INTO public.matches (
  external_id,
  home_team,
  away_team,
  status,
  kickoff_time,
  competition_round
) VALUES (
  999999,
  'Test Team A',
  'Test Team B',
  'upcoming',
  NOW() + INTERVAL '1 day',  -- 1 day in the future
  'Group Stage'
) RETURNING id;
```

### 2. Try to insert a prediction (should SUCCEED)

```sql
-- Replace YOUR_USER_ID and YOUR_MATCH_ID with actual values
INSERT INTO public.predictions (
  user_id,
  match_id,
  predicted_home,
  predicted_away
) VALUES (
  'YOUR_USER_ID'::uuid,
  'YOUR_MATCH_ID'::uuid,
  2,
  1
);
```

Expected: ✅ Success - Prediction inserted

### 3. Insert a test match with PAST kickoff time

```sql
INSERT INTO public.matches (
  external_id,
  home_team,
  away_team,
  status,
  kickoff_time,
  competition_round
) VALUES (
  999998,
  'Test Team C',
  'Test Team D',
  'live',
  NOW() - INTERVAL '1 hour',  -- 1 hour in the past
  'Group Stage'
) RETURNING id;
```

### 4. Try to insert a prediction (should FAIL)

```sql
INSERT INTO public.predictions (
  user_id,
  match_id,
  predicted_home,
  predicted_away
) VALUES (
  'YOUR_USER_ID'::uuid,
  'YOUR_PAST_MATCH_ID'::uuid,
  3,
  2
);
```

Expected: ❌ Error: "Predictions locked. This match has already kicked off."

### 5. Cleanup test data

```sql
DELETE FROM public.matches WHERE external_id IN (999999, 999998);
```

## Rollback

If you need to undo this migration:

```sql
-- Drop trigger first
DROP TRIGGER IF EXISTS check_kickoff_before_insert ON public.predictions;

-- Drop trigger function
DROP FUNCTION IF EXISTS public.verify_kickoff_time();

-- Drop table (CASCADE will remove all foreign keys)
DROP TABLE IF EXISTS public.predictions CASCADE;
```

**⚠️ Warning**: This will permanently delete all prediction data. Use only in development or if migration fails.

## Common Issues

### Issue 1: Foreign key constraint violation

**Error**: `insert or update on table "predictions" violates foreign key constraint`

**Cause**: Trying to insert a prediction with user_id or match_id that doesn't exist

**Solution**: Ensure profiles and matches tables are populated before inserting predictions

### Issue 2: Unique constraint violation

**Error**: `duplicate key value violates unique constraint "predictions_user_id_match_id_key"`

**Cause**: User is attempting to submit a second prediction for the same match

**Solution**: This is expected behavior. Update application logic to handle duplicate prediction attempts gracefully.

### Issue 3: Trigger raises exception unexpectedly

**Error**: "Predictions locked. This match has already kicked off."

**Cause**: Match kickoff_time is in the past or equal to NOW()

**Solution**: 
- Verify match kickoff_time: `SELECT id, kickoff_time, NOW() FROM matches WHERE id = 'YOUR_MATCH_ID';`
- Ensure kickoff_time is in the future
- For testing, update kickoff_time: `UPDATE matches SET kickoff_time = NOW() + INTERVAL '1 day' WHERE id = 'YOUR_MATCH_ID';`

### Issue 4: RLS policy blocks INSERT

**Error**: `new row violates row-level security policy for table "predictions"`

**Cause**: User is trying to insert a prediction with a different user_id than their auth.uid()

**Solution**: Ensure application passes `auth.uid()` as the user_id value, not a different user's ID

## Next Steps

After successfully running this migration:

1. ✅ Update the README.md migration tracker
2. ✅ Test prediction submission in the application
3. ✅ Implement prediction form component with countdown timer
4. 🔜 Run migration 004: Create leaderboard materialized view

## Related Documentation

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [PostgreSQL CHECK Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS)
