# Leaderboard Materialized View - Quick Reference

## Overview

The leaderboard materialized view (migration 004) provides pre-computed user rankings for optimal query performance.

## Quick Start

### Query Leaderboard (Top 50)
```typescript
const { data, error } = await supabase
  .from('leaderboard')
  .select('*')
  .range(0, 49);
```

### Refresh After Scoring
```typescript
await supabase.rpc('refresh_leaderboard');
```

### Find User Rank
```typescript
const { data } = await supabase
  .from('leaderboard')
  .select('rank, total_points')
  .eq('id', userId)
  .single();
```

## Leaderboard Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | User identifier (FK to profiles) |
| `username` | TEXT | User display name |
| `avatar_url` | TEXT | User avatar URL (nullable) |
| `total_points` | INTEGER | Total prediction points |
| `correct_predictions` | INTEGER | Count of 3-point predictions |
| `scored_count` | BIGINT | Count of scored predictions |
| `rank` | BIGINT | User rank (with tie handling) |

## Ranking Logic

```
rank = RANK() OVER (
  ORDER BY 
    total_points DESC,           -- Primary
    correct_predictions DESC,    -- Tiebreaker 1
    username ASC                 -- Tiebreaker 2
)
```

## Pagination Example

```typescript
// Page 1 (ranks 1-50)
const page1 = await supabase
  .from('leaderboard')
  .select('*')
  .range(0, 49);

// Page 2 (ranks 51-100)
const page2 = await supabase
  .from('leaderboard')
  .select('*')
  .range(50, 99);

// Generic pagination
const page = 2; // Zero-indexed
const pageSize = 50;
const start = page * pageSize;
const end = start + pageSize - 1;

const data = await supabase
  .from('leaderboard')
  .select('*')
  .range(start, end);
```

## Performance

- **Query Speed:** 10-50ms (vs 200-500ms without materialized view)
- **Refresh Speed:** 50-500ms (depending on user count)
- **Storage:** ~200 bytes per user (view + indexes)

## When to Refresh

✅ **Do refresh:**
- After admin scoring operations
- After bulk point updates
- After profile points recalculation

❌ **Don't refresh:**
- On every prediction submission
- On user registration
- On profile avatar updates

## Indexes

- `idx_leaderboard_id` (UNIQUE) - Enables CONCURRENTLY refresh
- `idx_leaderboard_rank` - Optimizes rank-based queries

## Common Queries

### Top 10 Users
```typescript
const { data } = await supabase
  .from('leaderboard')
  .select('*')
  .limit(10);
```

### Users Above Rank 100
```typescript
const { data } = await supabase
  .from('leaderboard')
  .select('*')
  .lte('rank', 100);
```

### User Count
```typescript
const { count } = await supabase
  .from('leaderboard')
  .select('*', { count: 'exact', head: true });
```

### Current User's Position
```typescript
const { data: currentUser } = await supabase.auth.getUser();

const { data } = await supabase
  .from('leaderboard')
  .select('*')
  .eq('id', currentUser.user.id)
  .single();

console.log(`You are rank ${data.rank} with ${data.total_points} points`);
```

## Troubleshooting

### Leaderboard Shows Stale Data

**Cause:** Materialized view hasn't been refreshed after scoring.

**Solution:**
```typescript
await supabase.rpc('refresh_leaderboard');
```

### "relation 'leaderboard' does not exist"

**Cause:** Migration 004 hasn't been executed.

**Solution:** Execute `004_create_leaderboard_materialized_view.sql` in Supabase SQL Editor.

### CONCURRENTLY Refresh Fails

**Cause:** UNIQUE index missing or corrupted.

**Solution:**
```sql
DROP INDEX IF EXISTS idx_leaderboard_id;
CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);
```

## Related Files

- Migration: `004_create_leaderboard_materialized_view.sql`
- Verification: `004_verify.sql`
- Instructions: `004_INSTRUCTIONS.md`
- Summary: `TASK_2.4_SUMMARY.md`

---

**For detailed documentation, see `004_INSTRUCTIONS.md`**
