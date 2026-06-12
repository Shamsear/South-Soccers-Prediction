# Migration 004: Leaderboard Materialized View - Execution Instructions

**Task:** 2.4 - Create leaderboard materialized view with refresh function  
**Requirements:** 8 (Leaderboard Display), 28 (Performance Optimization)

## Overview

This migration creates a materialized view for the leaderboard that pre-computes user rankings and aggregations. This optimizes leaderboard queries by avoiding expensive joins and window function calculations on every page load.

## Dependencies

⚠️ **IMPORTANT**: This migration depends on the following tables existing:
- `public.profiles` (created in migration 001)
- `public.predictions` (created in migration 003)

**Ensure migration 003 is executed before running this migration.**

## What This Migration Creates

### 1. Materialized View: `leaderboard`

A pre-computed view with the following columns:
- `id` - User UUID from profiles
- `username` - User display name
- `avatar_url` - User avatar URL (nullable)
- `total_points` - Total prediction points earned
- `correct_predictions` - Count of exact scoreline predictions
- `scored_count` - Count of predictions that have been scored
- `rank` - User rank using RANK() window function

**Ranking Logic:**
1. Primary sort: `total_points DESC` (highest points first)
2. Tiebreaker: `correct_predictions DESC` (most exact predictions)
3. Final tiebreaker: `username ASC` (alphabetical)

### 2. Indexes

- `idx_leaderboard_id` - UNIQUE index on `id` (required for CONCURRENTLY refresh)
- `idx_leaderboard_rank` - Index on `rank` for efficient pagination

### 3. Refresh Function: `refresh_leaderboard()`

- Function that refreshes the materialized view using `REFRESH MATERIALIZED VIEW CONCURRENTLY`
- `SECURITY DEFINER` allows execution with elevated privileges
- `CONCURRENTLY` option allows SELECT queries during refresh (zero-downtime)
- Called by admin scoring operations after points are awarded

## Execution Steps

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `004_create_leaderboard_materialized_view.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Wait for success confirmation

### Option 2: Supabase CLI

```bash
# Navigate to project root
cd d:\ssprediction

# Apply migration using Supabase CLI
supabase db push
```

### Option 3: Direct PostgreSQL Connection

```bash
# Connect to your Supabase PostgreSQL instance
psql "postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"

# Execute migration file
\i supabase/migrations/004_create_leaderboard_materialized_view.sql
```

## Verification

After executing the migration, run the verification script:

1. Open SQL Editor in Supabase Dashboard
2. Copy contents of `004_verify.sql`
3. Paste and execute
4. Review the check results - all should show "✓ PASS"

Expected verification checks:
- ✓ Materialized view "leaderboard" exists
- ✓ Materialized view has all 7 required columns
- ✓ UNIQUE index "idx_leaderboard_id" exists
- ✓ Index "idx_leaderboard_rank" exists
- ✓ Function "refresh_leaderboard()" exists and returns void
- ✓ Function "refresh_leaderboard()" has SECURITY DEFINER
- ✓ refresh_leaderboard() function executes without error
- ✓ Materialized view has correct query structure

## Usage in Application

### Querying the Leaderboard

```typescript
// Server component or API route
const { data: leaderboard } = await supabase
  .from('leaderboard')
  .select('*')
  .range(0, 49); // First 50 rows (pagination)
```

### Refreshing After Scoring

```typescript
// In scoreMatch server action after updating predictions
await supabase.rpc('refresh_leaderboard');
```

## Performance Benefits

### Before (Without Materialized View)
- Complex query with JOIN between profiles and predictions
- RANK() window function computed on every request
- LEFT JOIN with aggregation (COUNT) on predictions
- Slow for large datasets (thousands of users)

### After (With Materialized View)
- Pre-computed rankings stored in materialized view
- Simple SELECT query with no joins
- Fast pagination using indexed rank column
- Refresh only when needed (after scoring operations)

**Estimated Performance Improvement:** 10-50x faster for leaderboard queries

## Refresh Strategy

The materialized view is refreshed:
- ✅ After admin scoring operations (via `refresh_leaderboard()` function)
- ✅ When profile points are updated
- ❌ NOT on every prediction submission (would be inefficient)

**Refresh Frequency:** Only when match results are scored (typically a few times per day during tournament)

## Troubleshooting

### Error: "relation 'predictions' does not exist"

**Cause:** Migration 003 (predictions table) hasn't been executed yet.

**Solution:** Execute migration 003 first, then retry this migration.

### Error: "could not create unique index"

**Cause:** Duplicate user IDs in profiles table (should not happen with proper FK constraints).

**Solution:** Check for duplicate profiles:
```sql
SELECT id, COUNT(*) 
FROM public.profiles 
GROUP BY id 
HAVING COUNT(*) > 1;
```

### Error: "CONCURRENTLY cannot be used"

**Cause:** UNIQUE index on id doesn't exist or is corrupted.

**Solution:** Recreate the UNIQUE index:
```sql
DROP INDEX IF EXISTS idx_leaderboard_id;
CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);
```

## Next Steps

After successful migration:
1. ✅ Implement `/leaderboard` page (Task 5.x)
2. ✅ Call `refresh_leaderboard()` in `scoreMatch` server action (Task 6.x)
3. ✅ Test leaderboard pagination with sample data
4. ✅ Verify leaderboard updates after scoring operations

## Related Files

- Migration: `004_create_leaderboard_materialized_view.sql`
- Verification: `004_verify.sql`
- Design Reference: `.kiro/specs/south-soccers-world-cup-2026/design.md` (Materialized View section)
- Requirements: `.kiro/specs/south-soccers-world-cup-2026/requirements.md` (Requirements 8, 28)

---

**Migration Author:** Kiro AI  
**Task:** 2.4  
**Date:** 2025
