# Migration 002: Create Matches Table

## Summary

This migration creates the `matches` table for storing all 104 World Cup 2026 match data synced from the football-data.org API. The table implements Row Level Security (RLS) to ensure only the service role can modify match data while all authenticated users can read it.

## Task Reference

- **Task**: 2.2 - Create matches table with RLS policies
- **Spec**: `south-soccers-world-cup-2026`
- **Requirements**: 2 (Match Data Synchronization), 3 (Match Status Mapping), 17 (Database Row Level Security), 28 (Performance Optimization)

## What This Migration Does

### 1. Creates the `matches` Table

The table stores comprehensive match data with the following structure:

**Identity & External Reference:**
- `id` (UUID) - Internal primary key
- `external_id` (INTEGER UNIQUE) - Unique ID from football-data.org API for upsert operations

**Team Information:**
- `home_team` (TEXT) - Home team name
- `away_team` (TEXT) - Away team name
- `home_team_logo` (TEXT) - URL to home team crest
- `away_team_logo` (TEXT) - URL to away team crest

**Match Scores:**
- `home_score` (INTEGER) - Final home score (NULL until match finishes)
- `away_score` (INTEGER) - Final away score (NULL until match finishes)
- Note: For knockout matches, uses regular time score only (excludes extra time/penalties)

**Match Status & Timing:**
- `status` (TEXT) - Match status with CHECK constraint: `'upcoming' | 'live' | 'finished'`
- `kickoff_time` (TIMESTAMPTZ) - Match kickoff time in UTC (used for prediction locking)

**Competition Details:**
- `competition_round` (TEXT) - Tournament phase: "Group Stage", "Round of 32", "Quarter-finals", etc.
- `group_name` (TEXT) - Group identifier for group stage matches (e.g., "Group A"), NULL for knockout
- `venue` (TEXT) - Stadium/venue name

**System Fields:**
- `winner_announced` (BOOLEAN) - Flag indicating if match has been scored and points awarded (default: false)
- `api_last_polled_at` (TIMESTAMPTZ) - Timestamp of last API fetch (for 5-minute throttling)
- `created_at` (TIMESTAMPTZ) - Record creation timestamp
- `updated_at` (TIMESTAMPTZ) - Record last update timestamp

### 2. Implements Row Level Security (RLS)

**Three RLS Policies:**

1. **"Anyone can view matches"** (SELECT)
   - **Who**: All authenticated users
   - **What**: Can read all match data
   - **Why**: Public read access for match lists, detail pages, leaderboard context

2. **"Only service role can insert matches"** (INSERT)
   - **Who**: Service role only (bypasses RLS)
   - **What**: Can insert new match records
   - **Why**: API sync operations require privileged access

3. **"Only service role can update matches"** (UPDATE)
   - **Who**: Service role only
   - **What**: Can update existing match records
   - **Why**: API sync and admin scoring operations require privileged access

### 3. Creates Performance Indexes

Four indexes optimize common query patterns:

1. **`idx_matches_external_id`** - Fast lookups during API upsert operations
2. **`idx_matches_status`** - Efficient filtering by match status (live, upcoming, finished)
3. **`idx_matches_kickoff_time`** - Chronological ordering and prediction lock checks
4. **`idx_matches_competition_round`** - Grouping matches by tournament phase

### 4. Enforces Data Integrity

**CHECK Constraint on `status`:**
- Ensures only valid status values: `'upcoming'`, `'live'`, `'finished'`
- Prevents invalid data at the database level

**UNIQUE Constraint on `external_id`:**
- Prevents duplicate matches from API sync
- Enables upsert operations (INSERT ... ON CONFLICT)

## How to Run This Migration

### Method 1: Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**: https://supabase.com/dashboard/project/wdnjbeeuvttjafdcwdgu/sql
3. Copy the entire contents of `002_create_matches_table.sql`
4. Paste into a new SQL query
5. Click **Run** to execute
6. Check for success message: "Success. No rows returned"

### Method 2: Supabase CLI

```bash
# Ensure you're logged in
supabase login

# Link to your project
supabase link --project-ref wdnjbeeuvttjafdcwdgu

# Push migration
supabase db push
```

## Verification Steps

After running the migration, execute the verification queries from `002_verify.sql`:

### Quick Verification Checklist

1. **Table exists**: ✅ Query `SELECT * FROM public.matches LIMIT 1;`
2. **RLS enabled**: ✅ Check `pg_tables` for `rowsecurity = true`
3. **3 RLS policies created**: ✅ Check `pg_policies` table
4. **4 indexes created**: ✅ Check `pg_indexes` table
5. **CHECK constraint enforced**: ✅ Check `pg_constraint` table
6. **Table comments added**: ✅ Check `obj_description()` function

### Run All Verification Queries

```sql
-- Copy and paste from 002_verify.sql into SQL Editor
-- Or run: psql -h <host> -U postgres -d postgres -f 002_verify.sql
```

## Testing the Migration

### Test 1: Valid Status Values (Should Succeed with Service Role)

```sql
-- This test must be run with service_role credentials
-- Using Supabase dashboard SQL Editor automatically uses service_role

INSERT INTO public.matches (
  external_id,
  home_team,
  away_team,
  status,
  kickoff_time,
  competition_round
) VALUES 
  (999001, 'Test Team A', 'Test Team B', 'upcoming', '2026-06-15 20:00:00+00', 'Group Stage'),
  (999002, 'Test Team C', 'Test Team D', 'live', '2026-06-16 18:00:00+00', 'Group Stage'),
  (999003, 'Test Team E', 'Test Team F', 'finished', '2026-06-14 16:00:00+00', 'Group Stage');

-- Verify inserted
SELECT external_id, home_team, away_team, status FROM public.matches WHERE external_id >= 999001;

-- Cleanup
DELETE FROM public.matches WHERE external_id >= 999001;
```

### Test 2: Invalid Status Value (Should Fail)

```sql
-- This should fail with CHECK constraint violation
INSERT INTO public.matches (
  external_id,
  home_team,
  away_team,
  status,
  kickoff_time,
  competition_round
) VALUES (
  999999,
  'Test Team',
  'Test Team 2',
  'invalid_status',  -- ❌ Not in ('upcoming', 'live', 'finished')
  '2026-06-15 20:00:00+00',
  'Group Stage'
);

-- Expected error: new row for relation "matches" violates check constraint "matches_status_check"
```

### Test 3: Duplicate external_id (Should Fail)

```sql
-- Insert first record
INSERT INTO public.matches (
  external_id,
  home_team,
  away_team,
  status,
  kickoff_time,
  competition_round
) VALUES (
  999998,
  'Team A',
  'Team B',
  'upcoming',
  '2026-06-15 20:00:00+00',
  'Group Stage'
);

-- Try to insert duplicate external_id (should fail)
INSERT INTO public.matches (
  external_id,
  home_team,
  away_team,
  status,
  kickoff_time,
  competition_round
) VALUES (
  999998,  -- ❌ Duplicate external_id
  'Team C',
  'Team D',
  'upcoming',
  '2026-06-16 20:00:00+00',
  'Group Stage'
);

-- Expected error: duplicate key value violates unique constraint "matches_external_id_key"

-- Cleanup
DELETE FROM public.matches WHERE external_id = 999998;
```

### Test 4: RLS Policy Enforcement

```sql
-- This test demonstrates RLS behavior
-- Run as authenticated user (not service_role) to test SELECT policy

-- Should succeed: Authenticated users can SELECT
SELECT * FROM public.matches LIMIT 1;

-- Should fail: Only service_role can INSERT
-- (This will be blocked by RLS if run as authenticated user)
INSERT INTO public.matches (
  external_id,
  home_team,
  away_team,
  status,
  kickoff_time,
  competition_round
) VALUES (
  999997,
  'Team X',
  'Team Y',
  'upcoming',
  '2026-06-15 20:00:00+00',
  'Group Stage'
);

-- Expected error: new row violates row-level security policy for table "matches"
```

## Integration with Next.js Application

Once the migration is complete, the `matches` table can be accessed in your Next.js application:

### Server Component Example

```typescript
// app/matches/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function MatchesPage() {
  const supabase = await createServerClient()
  
  // Query matches (RLS allows authenticated SELECT)
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('kickoff_time', { ascending: true })
  
  if (error) {
    console.error('Error fetching matches:', error)
    return <div>Error loading matches</div>
  }
  
  return (
    <div>
      <h1>Upcoming Matches</h1>
      {matches?.map(match => (
        <div key={match.id}>
          {match.home_team} vs {match.away_team}
        </div>
      ))}
    </div>
  )
}
```

### API Route for Sync (Service Role)

```typescript
// app/api/sync-matches/route.ts
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceRoleClient() // Uses service_role, bypasses RLS
  
  // Upsert matches from external API
  const { error } = await supabase
    .from('matches')
    .upsert(matchesData, { onConflict: 'external_id' })
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  
  return Response.json({ success: true })
}
```

## Next Steps

After this migration is successfully applied:

1. ✅ **Task 2.2 Complete** - Matches table created
2. ⏭️ **Task 2.3** - Create predictions table with RLS policies and kickoff validation trigger
3. ⏭️ **Task 2.4** - Create leaderboard materialized view with refresh function

## Rollback Instructions

If you need to undo this migration:

```sql
-- WARNING: This will delete all match data
-- Make sure you have a backup if needed

-- Drop indexes (will be dropped automatically with table, but included for completeness)
DROP INDEX IF EXISTS public.idx_matches_competition_round;
DROP INDEX IF EXISTS public.idx_matches_kickoff_time;
DROP INDEX IF EXISTS public.idx_matches_status;
DROP INDEX IF EXISTS public.idx_matches_external_id;

-- Drop table (CASCADE will drop dependent objects like foreign keys)
DROP TABLE IF EXISTS public.matches CASCADE;
```

## Troubleshooting

### Issue: "relation 'matches' already exists"

**Solution**: Table already exists. Check if it was created in a previous migration attempt.

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'matches';

-- If it exists but needs to be recreated, drop it first (see Rollback Instructions)
```

### Issue: RLS policies not working as expected

**Solution**: Verify RLS is enabled and policies are created correctly.

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'matches';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'matches';
```

### Issue: Cannot insert data as authenticated user

**Solution**: This is expected behavior. INSERT/UPDATE requires service_role.

Use `createServiceRoleClient()` in server-side API routes for data modification operations.

## Files Included

- `002_create_matches_table.sql` - Main migration file
- `002_verify.sql` - Verification queries
- `002_INSTRUCTIONS.md` - This file (instructions and documentation)

## References

- **Design Document**: `.kiro/specs/south-soccers-world-cup-2026/design.md`
- **Requirements Document**: `.kiro/specs/south-soccers-world-cup-2026/requirements.md`
- **Task List**: `.kiro/specs/south-soccers-world-cup-2026/tasks.md`
- **Supabase RLS Documentation**: https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL CHECK Constraints**: https://www.postgresql.org/docs/current/ddl-constraints.html

---

**Migration created**: 2025
**Status**: Ready to execute
**Next migration**: 003_create_predictions_table.sql
