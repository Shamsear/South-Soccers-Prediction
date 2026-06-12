# Migration 004 Execution Checklist

**Task:** 2.4 - Create leaderboard materialized view with refresh function

## Pre-Execution Checklist

Before executing this migration, ensure:

- [ ] Migration 001 (profiles table) has been executed ✅
- [ ] Migration 002 (matches table) has been executed ✅
- [ ] Migration 003 (predictions table) has been executed ⚠️ **REQUIRED**
- [ ] You have admin access to Supabase dashboard
- [ ] You have reviewed `004_INSTRUCTIONS.md`

## Execution Steps

### Step 1: Execute Migration

- [ ] Open Supabase project dashboard
- [ ] Navigate to **SQL Editor**
- [ ] Create new query
- [ ] Copy contents of `004_create_leaderboard_materialized_view.sql`
- [ ] Paste into SQL editor
- [ ] Click **Run**
- [ ] Verify "Success. No rows returned" or similar success message

### Step 2: Run Verification

- [ ] Open new query in SQL Editor
- [ ] Copy contents of `004_verify.sql`
- [ ] Paste and execute
- [ ] Verify all checks show "✓ PASS":
  - [ ] ✓ Materialized view "leaderboard" exists
  - [ ] ✓ Materialized view has all 7 required columns
  - [ ] ✓ UNIQUE index "idx_leaderboard_id" exists
  - [ ] ✓ Index "idx_leaderboard_rank" exists
  - [ ] ✓ Function "refresh_leaderboard()" exists and returns void
  - [ ] ✓ Function has SECURITY DEFINER
  - [ ] ✓ refresh_leaderboard() executes without error
  - [ ] ✓ Materialized view has correct query structure

### Step 3: Test Queries

- [ ] Test basic leaderboard query:
```sql
SELECT * FROM public.leaderboard LIMIT 10;
```

- [ ] Test refresh function:
```sql
SELECT public.refresh_leaderboard();
```

- [ ] Test pagination:
```sql
SELECT * FROM public.leaderboard LIMIT 50 OFFSET 0;
```

## Post-Execution Validation

### Database Objects Created

Verify the following objects exist in your Supabase database:

- [ ] **Materialized View:** `public.leaderboard`
- [ ] **Index:** `idx_leaderboard_id` (UNIQUE)
- [ ] **Index:** `idx_leaderboard_rank`
- [ ] **Function:** `public.refresh_leaderboard()`

### Columns Present

Verify leaderboard has these columns:

- [ ] `id` (uuid)
- [ ] `username` (text)
- [ ] `avatar_url` (text, nullable)
- [ ] `total_points` (integer)
- [ ] `correct_predictions` (integer)
- [ ] `scored_count` (bigint)
- [ ] `rank` (bigint)

## Integration Checklist

### Application Code Updates

After migration, update application code:

- [ ] Create `/app/leaderboard/page.tsx` component (Task 5.x)
- [ ] Query leaderboard view with pagination
- [ ] Highlight current user's row
- [ ] Add refresh call to `scoreMatch` server action (Task 6.x)
- [ ] Test leaderboard updates after scoring operations

## Common Issues Resolution

### Issue: "relation 'predictions' does not exist"

- [ ] Execute migration 003 first
- [ ] Retry this migration

### Issue: "could not create unique index"

- [ ] Check for duplicate profile IDs:
```sql
SELECT id, COUNT(*) FROM public.profiles GROUP BY id HAVING COUNT(*) > 1;
```
- [ ] Resolve duplicates if any exist
- [ ] Retry migration

### Issue: Leaderboard shows no data

- [ ] Verify profiles table has users
- [ ] Run manual refresh:
```sql
REFRESH MATERIALIZED VIEW public.leaderboard;
```

## Rollback Plan

If migration fails or needs to be undone:

```sql
-- Drop refresh function
DROP FUNCTION IF EXISTS public.refresh_leaderboard();

-- Drop indexes
DROP INDEX IF EXISTS public.idx_leaderboard_rank;
DROP INDEX IF EXISTS public.idx_leaderboard_id;

-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;
```

## Success Criteria

Migration is successful when:

- [ ] All verification checks pass (✓ PASS)
- [ ] Leaderboard query returns data
- [ ] Refresh function executes without error
- [ ] Indexes are present and unique constraint enforced
- [ ] Sample leaderboard shows correct rankings

## Documentation Review

Before marking task complete, review:

- [ ] `004_INSTRUCTIONS.md` for detailed guidance
- [ ] `TASK_2.4_SUMMARY.md` for implementation details
- [ ] `README_LEADERBOARD.md` for quick reference
- [ ] Design document (`.kiro/specs/.../design.md`) for context

## Task Completion

- [ ] Migration executed successfully
- [ ] Verification passed
- [ ] Documentation reviewed
- [ ] Integration plan understood
- [ ] Task 2.4 marked as complete in `tasks.md`

---

**Status:** Ready for execution  
**Estimated Time:** 5-10 minutes  
**Risk Level:** Low (no data loss, easily rollback-able)

## Next Steps After Completion

1. Execute Task 2.3 (if not done) - Predictions table
2. Mark Task 2.4 as complete in project tracking
3. Proceed to Task 3.x - Authentication implementation
4. Later: Integrate refresh into scoring operations
5. Later: Build leaderboard UI component

---

**For questions or issues, refer to `004_INSTRUCTIONS.md` troubleshooting section.**
